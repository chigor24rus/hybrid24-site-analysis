import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Нормализация названий брендов: первая буква заглавная, остальные строчные'''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
            'body': json.dumps({'error': 'DATABASE_URL не настроен'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Получить все бренды
    cur.execute("SELECT id, name FROM brands")
    brands = cur.fetchall()
    
    updated_count = 0
    errors = []
    
    for brand in brands:
        original_name = brand['name']
        # Нормализация: первая буква заглавная, остальные строчные
        normalized_name = original_name.title()
        
        if original_name != normalized_name:
            try:
                cur.execute(
                    "UPDATE brands SET name = %s WHERE id = %s",
                    (normalized_name, brand['id'])
                )
                updated_count += 1
            except Exception as e:
                errors.append(f"{original_name}: {str(e)}")
    
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
            'updated': updated_count,
            'total': len(brands),
            'errors': errors
        })
    }
