"""
API для управления услугами (CRUD операции)
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """Обработчик запросов для управления услугами"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            cur.execute("""
                SELECT id, title, description, icon, duration, is_active, created_at
                FROM services
                ORDER BY title
            """)
            services = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'services': services}, default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            title = body.get('title')
            description = body.get('description', '')
            icon = body.get('icon', 'Wrench')
            duration = body.get('duration', '1-2 часа')
            is_active = body.get('is_active', True)
            
            if not title:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'title обязателен'})
                }
            
            cur.execute("""
                INSERT INTO services (title, description, icon, duration, is_active)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, title, description, icon, duration, is_active, created_at
            """, (title, description, icon, duration, is_active))
            
            service = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'service': service}, default=str)
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            service_id = body.get('id')
            title = body.get('title')
            description = body.get('description')
            icon = body.get('icon')
            duration = body.get('duration')
            is_active = body.get('is_active')
            
            if not service_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id обязателен'})
                }
            
            cur.execute("""
                UPDATE services 
                SET title = %s, description = %s, icon = %s, duration = %s, is_active = %s
                WHERE id = %s
                RETURNING id, title, description, icon, duration, is_active, created_at
            """, (title, description, icon, duration, is_active, service_id))
            
            service = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'service': service}, default=str)
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            service_id = params.get('id')
            
            if not service_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id обязателен'})
                }
            
            cur.execute("DELETE FROM services WHERE id = %s", (service_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()