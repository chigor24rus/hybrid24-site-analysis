import json
import os
import psycopg2
import requests
from datetime import datetime
import re

def handler(event: dict, context) -> dict:
    '''API для автоматического импорта отзывов из Яндекс.Карт'''
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
        organization_url = body.get('organization_url', '').strip()

        if not organization_url:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing organization_url'})
            }

        # Extract organization ID from Yandex Maps URL
        # Example: https://yandex.ru/maps/org/company_name/1234567890/
        org_id_match = re.search(r'/org/[^/]+/(\d+)', organization_url)
        if not org_id_match:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid Yandex Maps URL format'})
            }

        org_id = org_id_match.group(1)

        # Fetch reviews using Yandex Maps API
        # Note: This is a simplified example. Real implementation would need proper API access
        api_url = f'https://api-maps.yandex.ru/services/search/v2/?text=oid:{org_id}&type=biz&lang=ru_RU&results=50'
        
        try:
            response = requests.get(api_url, timeout=10)
            data = response.json()
        except Exception as api_error:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Failed to fetch reviews from Yandex Maps',
                    'details': str(api_error),
                    'note': 'Импорт напрямую из Яндекс.Карт требует API ключа. Используйте ручной импорт через форму.'
                })
            }

        # Parse reviews from API response
        reviews_data = []
        
        # This structure depends on actual Yandex API response format
        # You would need to adapt this based on real API documentation
        if 'features' in data and len(data['features']) > 0:
            org_data = data['features'][0].get('properties', {}).get('CompanyMetaData', {})
            reviews = org_data.get('Reviews', [])
            
            for review in reviews:
                reviews_data.append({
                    'customer_name': review.get('Author', {}).get('name', 'Аноним'),
                    'rating': review.get('rating', 5),
                    'review_text': review.get('text', ''),
                    'review_date': review.get('date', datetime.now().strftime('%Y-%m-%d')),
                    'source': 'yandex'
                })

        if not reviews_data:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'No reviews found',
                    'note': 'Автоматический импорт из Яндекс.Карт требует корректный URL и доступ к API. Рекомендуем использовать ручной импорт.'
                })
            }

        # Save reviews to database
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

        imported_count = 0
        skipped_count = 0
        
        for review_data in reviews_data:
            # Check if review already exists (by text similarity)
            cur.execute("""
                SELECT id FROM reviews 
                WHERE customer_name = %s 
                AND review_text = %s 
                AND source = 'yandex'
            """, (review_data['customer_name'], review_data['review_text']))
            
            if cur.fetchone():
                skipped_count += 1
                continue

            # Insert new review
            cur.execute("""
                INSERT INTO reviews (customer_name, rating, review_text, service_name, review_date, source, is_visible)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                review_data['customer_name'],
                review_data['rating'],
                review_data['review_text'],
                'Общий отзыв',  # Default service name for imported reviews
                review_data['review_date'],
                'yandex',
                True
            ))
            imported_count += 1

        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'imported': imported_count,
                'skipped': skipped_count,
                'total': len(reviews_data)
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
