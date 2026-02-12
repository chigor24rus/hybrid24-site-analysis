"""
API для управления моделями автомобилей
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
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
            params = event.get('queryStringParameters') or {}
            brand_id = params.get('brand_id')
            
            if brand_id:
                cur.execute("""
                    SELECT m.*, b.name as brand_name 
                    FROM car_models m
                    JOIN brands b ON m.brand_id = b.id
                    WHERE m.brand_id = %s
                    ORDER BY m.name
                """, (brand_id,))
            else:
                cur.execute("""
                    SELECT m.*, b.name as brand_name 
                    FROM car_models m
                    JOIN brands b ON m.brand_id = b.id
                    ORDER BY b.name, m.name
                """)
            
            models = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'models': models}, default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            brand_id = body.get('brand_id')
            name = body.get('name')
            year_from = body.get('year_from')
            year_to = body.get('year_to')
            
            if not brand_id or not name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'brand_id и name обязательны'})
                }
            
            # Простая вставка без проверки дубликатов
            cur.execute("""
                INSERT INTO car_models (brand_id, name, year_from, year_to)
                VALUES (%s, %s, %s, %s)
                RETURNING *
            """, (brand_id, name, year_from, year_to))
            
            model = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'model': model}, default=str)
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            model_id = body.get('id')
            name = body.get('name')
            year_from = body.get('year_from')
            year_to = body.get('year_to')
            
            if not model_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id обязателен'})
                }
            
            cur.execute("""
                UPDATE car_models 
                SET name = %s, year_from = %s, year_to = %s
                WHERE id = %s
                RETURNING *
            """, (name, year_from, year_to, model_id))
            
            model = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'model': model}, default=str)
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            model_id = params.get('id')
            action = params.get('action')
            
            # Удаление дубликатов
            if action == 'remove_duplicates':
                # Находим дубликаты (одинаковые brand_id + name без учета регистра)
                cur.execute("""
                    DELETE FROM car_models
                    WHERE id NOT IN (
                        SELECT MIN(id)
                        FROM car_models
                        GROUP BY brand_id, LOWER(name)
                    )
                """)
                deleted_count = cur.rowcount
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'deleted': deleted_count})
                }
            
            # Удаление одной модели
            if not model_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id обязателен'})
                }
            
            cur.execute("DELETE FROM car_models WHERE id = %s", (model_id,))
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
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
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