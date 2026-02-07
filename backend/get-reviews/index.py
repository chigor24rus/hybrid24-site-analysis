import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для получения списка отзывов'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, customer_name, rating, review_text, service_name, 
                   review_date, source, is_visible, created_at
            FROM reviews
            ORDER BY created_at DESC
        """)
        
        rows = cur.fetchall()
        
        reviews = []
        for row in rows:
            reviews.append({
                'id': row[0],
                'customer_name': row[1],
                'rating': row[2],
                'review_text': row[3],
                'service_name': row[4],
                'review_date': row[5],
                'source': row[6],
                'is_visible': row[7],
                'created_at': row[8]
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'reviews': reviews}, default=str)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
