import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Получает отзывы организации с Яндекс.Карт через API
    Args: event - HTTP запрос с query параметром organization_id, context - контекст выполнения
    Returns: HTTP response со списком отзывов
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
    
    api_key = os.environ.get('YANDEX_MAPS_API_KEY')
    print(f"API Key present: {bool(api_key)}")
    
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'YANDEX_MAPS_API_KEY not configured'})
        }
    
    query_params = event.get('queryStringParameters') or {}
    organization_id = query_params.get('organization_id')
    
    if not organization_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'organization_id parameter is required'})
        }
    
    try:
        # Запрос к API Яндекс.Карт для получения отзывов организации
        url = f'https://search-maps.yandex.ru/v1/?apikey={api_key}&text={organization_id}&type=biz&results=1&lang=ru_RU'
        print(f"Requesting Yandex Maps API for org_id: {organization_id}")
        response = requests.get(url, timeout=10)
        print(f"Response status: {response.status_code}")
        response.raise_for_status()
        
        data = response.json()
        print(f"Found features: {len(data.get('features', []))}")
        
        if not data.get('features'):
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Organization not found', 'reviews': []})
            }
        
        org = data['features'][0]
        properties = org.get('properties', {})
        company_meta = properties.get('CompanyMetaData', {})
        
        # Получаем ID организации для запроса отзывов
        org_oid = company_meta.get('id', '')
        
        reviews = []
        
        # Запрос отзывов через API отзывов Яндекс.Карт
        reviews_url = f'https://api.content.market.yandex.ru/v1/review/list.json?business_id={org_oid}'
        
        try:
            reviews_response = requests.get(reviews_url, timeout=10)
            if reviews_response.status_code == 200:
                reviews_data = reviews_response.json()
                
                for review in reviews_data.get('reviews', [])[:10]:
                    reviews.append({
                        'id': review.get('id'),
                        'name': review.get('author', {}).get('name', 'Аноним'),
                        'rating': review.get('rating', 5),
                        'date': review.get('updatedTime', ''),
                        'text': review.get('text', ''),
                        'service': 'Яндекс.Карты'
                    })
        except Exception as e:
            # Если API отзывов недоступен, возвращаем базовую информацию
            rating = company_meta.get('rating', 0)
            reviews_count = company_meta.get('reviewsCount', 0)
            
            reviews.append({
                'id': 1,
                'name': 'Сводка с Яндекс.Карт',
                'rating': int(rating) if rating else 5,
                'date': 'Общая оценка',
                'text': f'Организация имеет рейтинг {rating} на основе {reviews_count} отзывов в Яндекс.Картах',
                'service': 'Яндекс.Карты'
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'reviews': reviews,
                'organization': {
                    'name': company_meta.get('name', ''),
                    'rating': company_meta.get('rating', 0),
                    'reviews_count': company_meta.get('reviewsCount', 0)
                }
            })
        }
    
    except requests.exceptions.RequestException as e:
        print(f"Request error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Failed to fetch reviews: {str(e)}'})
        }