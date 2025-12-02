import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление отзывами клиентов (создание, получение, обновление, удаление)
    Args: event - HTTP запрос с методом GET/POST/PUT/DELETE, context - контекст выполнения
    Returns: HTTP response со списком или статусом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            cursor.execute("""
                SELECT id, customer_name, rating, review_text, service_name, 
                       review_date, is_visible, created_at, updated_at
                FROM reviews
                WHERE is_visible = true
                ORDER BY review_date DESC, created_at DESC
            """)
            reviews = cursor.fetchall()
            
            formatted_reviews = []
            for review in reviews:
                formatted_reviews.append({
                    'id': review['id'],
                    'name': review['customer_name'],
                    'rating': review['rating'],
                    'text': review['review_text'],
                    'service': review['service_name'] or 'Общий отзыв',
                    'date': str(review['review_date'])
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'reviews': formatted_reviews})
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            customer_name = body.get('customer_name', '').strip()
            rating = body.get('rating')
            review_text = body.get('review_text', '').strip()
            service_name = body.get('service_name', '').strip() or None
            review_date = body.get('review_date') or 'CURRENT_DATE'
            
            if not customer_name or not review_text:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'customer_name and review_text are required'})
                }
            
            if not isinstance(rating, int) or rating < 1 or rating > 5:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'rating must be between 1 and 5'})
                }
            
            if review_date == 'CURRENT_DATE':
                cursor.execute("""
                    INSERT INTO reviews (customer_name, rating, review_text, service_name)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                """, (customer_name, rating, review_text, service_name))
            else:
                cursor.execute("""
                    INSERT INTO reviews (customer_name, rating, review_text, service_name, review_date)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                """, (customer_name, rating, review_text, service_name, review_date))
            
            review_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'review_id': review_id})
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            review_id = body.get('review_id')
            
            if not review_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'review_id is required'})
                }
            
            updates = []
            params = []
            
            if 'customer_name' in body:
                updates.append('customer_name = %s')
                params.append(body['customer_name'])
            
            if 'rating' in body:
                rating = body['rating']
                if not isinstance(rating, int) or rating < 1 or rating > 5:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'rating must be between 1 and 5'})
                    }
                updates.append('rating = %s')
                params.append(rating)
            
            if 'review_text' in body:
                updates.append('review_text = %s')
                params.append(body['review_text'])
            
            if 'service_name' in body:
                updates.append('service_name = %s')
                params.append(body['service_name'] or None)
            
            if 'is_visible' in body:
                updates.append('is_visible = %s')
                params.append(body['is_visible'])
            
            if 'review_date' in body:
                updates.append('review_date = %s')
                params.append(body['review_date'])
            
            if not updates:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'})
                }
            
            updates.append('updated_at = CURRENT_TIMESTAMP')
            params.append(review_id)
            
            query = f"UPDATE reviews SET {', '.join(updates)} WHERE id = %s"
            cursor.execute(query, params)
            conn.commit()
            
            if cursor.rowcount == 0:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Review not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            review_id = query_params.get('review_id')
            
            if not review_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'review_id parameter is required'})
                }
            
            cursor.execute("DELETE FROM reviews WHERE id = %s", (review_id,))
            conn.commit()
            
            if cursor.rowcount == 0:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Review not found'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    finally:
        cursor.close()
        conn.close()
