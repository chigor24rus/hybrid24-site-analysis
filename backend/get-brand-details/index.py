import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Получает детальную информацию о бренде и его услугах с ценами
    Args: event - HTTP запрос с параметром slug бренда, context - контекст выполнения
    Returns: HTTP response с данными бренда и услугами
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
    
    params = event.get('queryStringParameters', {}) or {}
    slug = params.get('slug', '')
    
    if not slug:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Slug parameter is required'})
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
        SELECT id, name, slug, logo_url, description
        FROM brands
        WHERE slug = %s
    """, (slug,))
    
    brand_row = cur.fetchone()
    
    if not brand_row:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Brand not found'})
        }
    
    brand = {
        'id': brand_row[0],
        'name': brand_row[1],
        'slug': brand_row[2],
        'logo': brand_row[3],
        'description': brand_row[4]
    }
    
    cur.execute("""
        SELECT s.id, s.title, s.description, s.icon, s.duration, sp.base_price, sp.currency
        FROM services s
        JOIN service_prices sp ON s.id = sp.service_id
        WHERE sp.brand_id = %s AND s.is_active = true
        ORDER BY s.id
    """, (brand['id'],))
    
    services_rows = cur.fetchall()
    services = []
    for row in services_rows:
        services.append({
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'icon': row[3],
            'duration': row[4],
            'price': f"от {int(row[5]):,} {row[6]}".replace(',', ' ')
        })
    
    cur.execute("""
        SELECT id, name, year_from, year_to
        FROM car_models
        WHERE brand_id = %s
        ORDER BY name
    """, (brand['id'],))
    
    models_rows = cur.fetchall()
    models = []
    for row in models_rows:
        year_range = ''
        if row[2] and row[3]:
            year_range = f"{row[2]}-{row[3]}"
        elif row[2]:
            year_range = f"с {row[2]}"
        elif row[3]:
            year_range = f"до {row[3]}"
        
        models.append({
            'id': row[0],
            'name': row[1],
            'year_range': year_range
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'brand': brand,
            'services': services,
            'models': models
        })
    }