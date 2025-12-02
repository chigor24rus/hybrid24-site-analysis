import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Получает список всех активных услуг с базовыми ценами
    Args: event - HTTP запрос, context - контекст выполнения
    Returns: HTTP response со списком услуг
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
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT DISTINCT ON (s.id) s.id, s.title, s.description, s.icon, s.duration, 
               MIN(sp.base_price) as min_price, sp.currency
        FROM services s
        JOIN service_prices sp ON s.id = sp.service_id
        WHERE s.is_active = true
        GROUP BY s.id, s.title, s.description, s.icon, s.duration, sp.currency
        ORDER BY s.id
    """)
    
    rows = cur.fetchall()
    services = []
    for row in rows:
        services.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'icon': row[3],
            'duration': row[4],
            'price': f"от {int(row[5]):,} {row[6]}".replace(',', ' ')
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'services': services})
    }