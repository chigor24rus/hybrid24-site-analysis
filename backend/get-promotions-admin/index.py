import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Получение списка всех акций для админки
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, title, description, discount, old_price, new_price, 
               valid_until, icon, details, is_active, created_at, updated_at
        FROM promotions
        ORDER BY created_at DESC
    ''')
    
    rows = cursor.fetchall()
    promotions = []
    
    for row in rows:
        promotions.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'discount': row[3],
            'old_price': row[4],
            'new_price': row[5],
            'valid_until': row[6],
            'icon': row[7],
            'details': row[8],
            'is_active': row[9],
            'created_at': row[10].isoformat() if row[10] else None,
            'updated_at': row[11].isoformat() if row[11] else None
        })
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'promotions': promotions}),
        'isBase64Encoded': False
    }
