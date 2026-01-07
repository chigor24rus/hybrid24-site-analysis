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
                models.append({
                    'name': row.get('name') or row.get('Name') or row.get('Название'),
                    'year_from': row.get('year_from') or row.get('Year From') or row.get('Год с'),
                    'year_to': row.get('year_to') or row.get('Year To') or row.get('Год по')
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
            
            try:
                cur.execute("""
                    INSERT INTO car_models (brand_id, name, year_from, year_to)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (brand_id, name) DO NOTHING
                """, (brand_id, name, year_from, year_to))
                
                if cur.rowcount > 0:
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