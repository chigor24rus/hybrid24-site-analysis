import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Создание новой акции
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body = json.loads(event.get('body', '{}'))
    
    title = body.get('title', '')
    description = body.get('description', '')
    discount = body.get('discount', '')
    old_price = body.get('old_price', '')
    new_price = body.get('new_price', '')
    valid_until = body.get('valid_until', '')
    icon = body.get('icon', 'Percent')
    details = body.get('details', '')
    is_active = body.get('is_active', True)
    
    if not all([title, description, discount, new_price, valid_until, details]):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO promotions 
        (title, description, discount, old_price, new_price, valid_until, icon, details, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    ''', (title, description, discount, old_price, new_price, valid_until, icon, details, is_active))
    
    promotion_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'id': promotion_id}),
        'isBase64Encoded': False
    }
