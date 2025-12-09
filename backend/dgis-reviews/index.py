import json
import os
import psycopg2
from typing import Dict, Any, List
from datetime import datetime
import urllib.request
import urllib.parse

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Синхронизация отзывов с 2ГИС API
    GET - получить список отзывов из базы
    POST - синхронизировать отзывы с 2ГИС
    '''
    
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        return get_reviews_from_db()
    elif method == 'POST':
        return sync_reviews_from_dgis()
    else:
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

def get_reviews_from_db() -> Dict[str, Any]:
    '''Получить отзывы из базы данных'''
    conn = None
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute('''
            SELECT id, customer_name, rating, review_date, review_text, service_name, source, source_id
            FROM reviews
            WHERE is_visible = TRUE
            ORDER BY review_date DESC
        ''')
        
        reviews = []
        for row in cur.fetchall():
            review_date = row[3]
            formatted_date = review_date.strftime('%d.%m.%Y') if review_date else ''
            
            reviews.append({
                'id': row[0],
                'name': row[1],
                'rating': row[2],
                'date': formatted_date,
                'text': row[4],
                'service': row[5],
                'source': row[6] if row[6] else 'manual',
                'source_id': row[7]
            })
        
        cur.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'reviews': reviews, 'count': len(reviews)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    finally:
        if conn:
            conn.close()

def sync_reviews_from_dgis() -> Dict[str, Any]:
    '''Синхронизировать отзывы с 2ГИС API'''
    api_key = os.environ.get('DGIS_API_KEY')
    org_id = os.environ.get('DGIS_ORG_ID')
    
    if not api_key:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'DGIS_API_KEY не настроен',
                'message': 'Добавьте API ключ 2ГИС в секреты проекта'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if not org_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'DGIS_ORG_ID не настроен',
                'message': 'Добавьте ID организации 2ГИС в секреты проекта'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        reviews_data = fetch_dgis_reviews(api_key, org_id)
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        added_count = 0
        updated_count = 0
        hidden_count = 0
        visible_count = 0
        
        for review in reviews_data:
            source_id = review.get('id', '')
            rating = review.get('rating', 5)
            is_visible = rating >= 4
            
            if not is_visible:
                hidden_count += 1
            else:
                visible_count += 1
            
            cur.execute('''
                SELECT id FROM reviews WHERE source = '2gis' AND source_id = %s
            ''', (source_id,))
            
            existing = cur.fetchone()
            
            if existing:
                cur.execute('''
                    UPDATE reviews
                    SET customer_name = %s, rating = %s, review_date = %s, review_text = %s, service_name = %s, is_visible = %s, updated_at = NOW()
                    WHERE source = '2gis' AND source_id = %s
                ''', (
                    review.get('name', 'Клиент'),
                    rating,
                    review.get('date_obj'),
                    review.get('text', ''),
                    review.get('service', 'Отзыв с 2ГИС'),
                    is_visible,
                    source_id
                ))
                updated_count += 1
            else:
                cur.execute('''
                    INSERT INTO reviews (customer_name, rating, review_date, review_text, service_name, source, source_id, is_visible, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, '2gis', %s, %s, NOW(), NOW())
                ''', (
                    review.get('name', 'Клиент'),
                    rating,
                    review.get('date_obj'),
                    review.get('text', ''),
                    review.get('service', 'Отзыв с 2ГИС'),
                    source_id,
                    is_visible
                ))
                added_count += 1
        
        conn.commit()
        cur.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'added': added_count,
                'updated': updated_count,
                'total': len(reviews_data),
                'visible': visible_count,
                'hidden': hidden_count
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    finally:
        if conn:
            conn.close()

def fetch_dgis_reviews(api_key: str, org_id: str) -> List[Dict[str, Any]]:
    '''Получить отзывы из 2ГИС API'''
    
    base_url = 'https://catalog.api.2gis.com/3.0/items'
    params = {
        'id': org_id,
        'key': api_key,
        'fields': 'items.reviews'
    }
    
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    req = urllib.request.Request(url)
    req.add_header('Accept', 'application/json')
    
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode('utf-8'))
    
    reviews = []
    items = data.get('result', {}).get('items', [])
    
    if items and len(items) > 0:
        org_reviews = items[0].get('reviews', [])
        
        for review in org_reviews:
            date_str = review.get('date_created', '')
            date_obj = parse_date_to_db(date_str)
            
            reviews.append({
                'id': review.get('id', ''),
                'name': review.get('user', {}).get('name', 'Клиент'),
                'rating': review.get('rating', 5),
                'date': format_date(date_str),
                'date_obj': date_obj,
                'text': review.get('text', ''),
                'service': 'Отзыв с 2ГИС'
            })
    
    return reviews

def format_date(date_str: str) -> str:
    '''Форматировать дату из ISO в DD.MM.YYYY'''
    if not date_str:
        return datetime.now().strftime('%d.%m.%Y')
    
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return dt.strftime('%d.%m.%Y')
    except:
        return datetime.now().strftime('%d.%m.%Y')

def parse_date_to_db(date_str: str):
    '''Парсить дату ISO в формат для PostgreSQL DATE'''
    if not date_str:
        return datetime.now().date()
    
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return dt.date()
    except:
        return datetime.now().date()