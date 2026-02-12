"""
API для загрузки моделей из CSV/JSON файла
"""
import json
import os
import csv
import io
import base64
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'POST')
    
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Only POST allowed'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        body = json.loads(event.get('body', '{}'))
        file_content = body.get('file')
        file_type = body.get('type', 'csv')
        brand_id = body.get('brand_id')
        
        if not file_content or not brand_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'file и brand_id обязательны'})
            }
        
        # Decode base64 file
        file_data = base64.b64decode(file_content)
        file_text = file_data.decode('utf-8')
        
        models = []
        
        if file_type == 'csv':
            csv_reader = csv.DictReader(io.StringIO(file_text))
            for row in csv_reader:
                tags_raw = row.get('tags') or row.get('Tags') or row.get('Теги') or ''
                tags = [t.strip() for t in tags_raw.split(',') if t.strip()] if tags_raw else []
                
                models.append({
                    'name': row.get('name') or row.get('Name') or row.get('Название'),
                    'year_from': row.get('year_from') or row.get('Year From') or row.get('Год с'),
                    'year_to': row.get('year_to') or row.get('Year To') or row.get('Год по'),
                    'tags': tags
                })
        elif file_type == 'json':
            data = json.loads(file_text)
            models = data if isinstance(data, list) else data.get('models', [])
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Поддерживаются только CSV и JSON'})
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        added = 0
        skipped = 0
        errors = []
        
        for model in models:
            name = model.get('name')
            if not name:
                skipped += 1
                continue
            
            year_from = model.get('year_from')
            year_to = model.get('year_to')
            tags = model.get('tags', [])
            
            try:
                cur.execute("""
                    INSERT INTO car_models (brand_id, name, year_from, year_to)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (brand_id, name) DO UPDATE SET
                        year_from = EXCLUDED.year_from,
                        year_to = EXCLUDED.year_to
                    RETURNING id
                """, (brand_id, name, year_from, year_to))
                
                result = cur.fetchone()
                if result:
                    model_id = result['id']
                    
                    # Добавляем теги к модели
                    for tag_name in tags:
                        # Получаем или создаем тег
                        cur.execute("""
                            INSERT INTO model_tags (name)
                            VALUES (%s)
                            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                            RETURNING id
                        """, (tag_name,))
                        tag_result = cur.fetchone()
                        tag_id = tag_result['id']
                        
                        # Связываем модель с тегом
                        cur.execute("""
                            INSERT INTO car_model_tags (model_id, tag_id)
                            VALUES (%s, %s)
                            ON CONFLICT (model_id, tag_id) DO NOTHING
                        """, (model_id, tag_id))
                    
                    added += 1
                else:
                    skipped += 1
            except Exception as e:
                errors.append(f'{name}: {str(e)}')
                skipped += 1
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'added': added,
                'skipped': skipped,
                'errors': errors
            })
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