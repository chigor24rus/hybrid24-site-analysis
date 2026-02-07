import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для добавления отзывов вручную (админка)'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        body = json.loads(event.get('body', '{}'))
        
        customer_name = body.get('customer_name', '').strip()
        rating = body.get('rating')
        review_text = body.get('review_text', '').strip()
        service_name = body.get('service_name', '').strip()
        review_date = body.get('review_date', datetime.now().strftime('%Y-%m-%d'))
        source = body.get('source', 'manual')
        is_visible = body.get('is_visible', True)

        if not customer_name or not rating or not review_text or not service_name:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Missing required fields',
                    'required': ['customer_name', 'rating', 'review_text', 'service_name']
                })
            }

        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Rating must be between 1 and 5'})
            }

        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Database connection not configured'})
            }

        conn = psycopg2.connect(dsn)
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO reviews (customer_name, rating, review_text, service_name, review_date, source, is_visible)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, customer_name, rating, review_text, service_name, review_date, source, is_visible, created_at
        """, (customer_name, rating, review_text, service_name, review_date, source, is_visible))

        result = cur.fetchone()
        conn.commit()

        review = {
            'id': result[0],
            'customer_name': result[1],
            'rating': result[2],
            'review_text': result[3],
            'service_name': result[4],
            'review_date': result[5].strftime('%Y-%m-%d') if result[5] else None,
            'source': result[6],
            'is_visible': result[7],
            'created_at': result[8].strftime('%Y-%m-%d %H:%M:%S') if result[8] else None
        }

        cur.close()
        conn.close()

        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'review': review
            })
        }

    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON'})
        }
    except psycopg2.Error as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }
