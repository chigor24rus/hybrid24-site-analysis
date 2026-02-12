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
            
            # Если запрос тегов
            if params.get('tags') == 'true':
                cur.execute("SELECT * FROM model_tags ORDER BY name")
                tags = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'tags': tags}, default=str)
                }
            
            # Иначе запрос моделей
            brand_id = params.get('brand_id')
            
            if brand_id:
                cur.execute("""
                    SELECT m.*, b.name as brand_name,
                           COALESCE(
                               (SELECT json_agg(json_build_object('id', mt.id, 'name', mt.name, 'color', mt.color))
                                FROM car_model_tags cmt
                                JOIN model_tags mt ON cmt.tag_id = mt.id
                                WHERE cmt.model_id = m.id),
                               '[]'::json
                           ) as tags
                    FROM car_models m
                    JOIN brands b ON m.brand_id = b.id
                    WHERE m.brand_id = %s
                    ORDER BY m.name
                """, (brand_id,))
            else:
                cur.execute("""
                    SELECT m.*, b.name as brand_name,
                           COALESCE(
                               (SELECT json_agg(json_build_object('id', mt.id, 'name', mt.name, 'color', mt.color))
                                FROM car_model_tags cmt
                                JOIN model_tags mt ON cmt.tag_id = mt.id
                                WHERE cmt.model_id = m.id),
                               '[]'::json
                           ) as tags
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
            tag_ids = body.get('tag_ids', [])
            
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
            model_id = model['id']
            
            # Добавляем теги
            for tag_id in tag_ids:
                cur.execute("""
                    INSERT INTO car_model_tags (model_id, tag_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (model_id, tag_id))
            
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
            tag_ids = body.get('tag_ids', [])
            
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
            
            # Обновляем теги модели
            if tag_ids is not None:
                # Удаляем старые связи
                cur.execute("DELETE FROM car_model_tags WHERE model_id = %s", (model_id,))
                
                # Добавляем новые
                for tag_id in tag_ids:
                    cur.execute("""
                        INSERT INTO car_model_tags (model_id, tag_id)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                    """, (model_id, tag_id))
            
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
            
            # Удаление дубликатов с учетом тегов
            if action == 'remove_duplicates':
                # Шаг 1: Находим дубликаты (одинаковые brand_id, name и теги)
                cur.execute("""
                    WITH model_tags_agg AS (
                        SELECT 
                            m.id,
                            m.brand_id,
                            LOWER(m.name) as name_lower,
                            COALESCE(array_agg(cmt.tag_id ORDER BY cmt.tag_id) FILTER (WHERE cmt.tag_id IS NOT NULL), ARRAY[]::integer[]) as tag_ids
                        FROM car_models m
                        LEFT JOIN car_model_tags cmt ON m.id = cmt.model_id
                        GROUP BY m.id, m.brand_id, LOWER(m.name)
                    )
                    SELECT 
                        brand_id, 
                        name_lower, 
                        tag_ids,
                        MIN(id) as keep_id,
                        array_agg(id) as all_ids
                    FROM model_tags_agg
                    GROUP BY brand_id, name_lower, tag_ids
                    HAVING COUNT(*) > 1
                """)
                duplicate_groups = cur.fetchall()
                
                deleted_count = 0
                
                # Шаг 2: Для каждой группы дубликатов
                for group in duplicate_groups:
                    keep_id = group['keep_id']
                    all_ids = group['all_ids']
                    ids_to_remove = [id for id in all_ids if id != keep_id]
                    
                    # Переносим все связи на оставшуюся модель
                    for old_id in ids_to_remove:
                        cur.execute("""
                            UPDATE service_prices 
                            SET model_id = %s 
                            WHERE model_id = %s
                        """, (keep_id, old_id))
                        
                        # Удаляем связи тегов
                        cur.execute("DELETE FROM car_model_tags WHERE model_id = %s", (old_id,))
                        
                        # Удаляем дубликат
                        cur.execute("DELETE FROM car_models WHERE id = %s", (old_id,))
                        deleted_count += 1
                
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