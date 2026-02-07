import json
import os
import re
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.request
import boto3

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Автоматическая загрузка логотипов брендов из Car Logos Dataset (GitHub)'''
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
    
    if method != 'POST':
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
            'body': json.dumps({'error': 'DATABASE_URL не настроен'})
        }
    
    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    
    data_url = 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/data.json'
    
    try:
        with urllib.request.urlopen(data_url) as response:
            dataset = json.loads(response.read().decode())
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка загрузки датасета: {str(e)}'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT id, name FROM brands")
    brands = cur.fetchall()
    
    uploaded_count = 0
    skipped_count = 0
    errors = []
    
    brand_mapping = {}
    for item in dataset:
        brand_name = item.get('name', '')
        brand_mapping[brand_name.lower()] = item
    
    for brand in brands:
        brand_id = brand['id']
        brand_name = brand['name']
        brand_lower = brand_name.lower()
        
        logo_data = brand_mapping.get(brand_lower)
        
        if not logo_data:
            for dataset_name in brand_mapping.keys():
                if brand_lower in dataset_name or dataset_name in brand_lower:
                    logo_data = brand_mapping[dataset_name]
                    break
        
        if not logo_data:
            skipped_count += 1
            errors.append(f'{brand_name}: логотип не найден в датасете')
            continue
        
        image_data = logo_data.get('image', {})
        logo_url = image_data.get('optimized') or image_data.get('original') or image_data.get('thumb')
        
        if not logo_url:
            skipped_count += 1
            errors.append(f'{brand_name}: URL логотипа отсутствует')
            continue
        
        try:
            with urllib.request.urlopen(logo_url) as response:
                logo_content = response.read()
            
            file_ext = logo_url.split('.')[-1]
            s3_key = f'brands/{brand_id}.{file_ext}'
            
            content_type = 'image/png' if file_ext == 'png' else 'image/jpeg'
            
            s3.put_object(
                Bucket='files',
                Key=s3_key,
                Body=logo_content,
                ContentType=content_type
            )
            
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"
            
            cur.execute(
                "UPDATE brands SET logo_url = %s WHERE id = %s",
                (cdn_url, brand_id)
            )
            
            uploaded_count += 1
            
        except Exception as e:
            skipped_count += 1
            errors.append(f'{brand_name}: {str(e)}')
    
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
            'uploaded': uploaded_count,
            'skipped': skipped_count,
            'total_brands': len(brands),
            'errors': errors[:10] if errors else []
        })
    }