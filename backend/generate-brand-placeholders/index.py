import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3

def generate_svg_placeholder(letter: str, brand_name: str) -> str:
    '''Генерация SVG заглушки с первой буквой бренда'''
    colors = [
        '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', 
        '#F59E0B', '#EF4444', '#06B6D4', '#6366F1'
    ]
    
    color_index = sum(ord(c) for c in brand_name) % len(colors)
    bg_color = colors[color_index]
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="{bg_color}" rx="20"/>
  <text x="100" y="135" font-family="Arial, sans-serif" font-size="120" font-weight="bold" 
        text-anchor="middle" fill="white">{letter.upper()}</text>
</svg>'''
    return svg

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Генерация SVG заглушек для брендов без логотипов'''
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
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT id, name, logo_url FROM brands WHERE logo_url IS NULL OR logo_url = ''")
    brands_without_logos = cur.fetchall()
    
    generated_count = 0
    errors = []
    
    for brand in brands_without_logos:
        brand_id = brand['id']
        brand_name = brand['name']
        
        first_letter = brand_name[0] if brand_name else 'X'
        
        try:
            svg_content = generate_svg_placeholder(first_letter, brand_name)
            
            s3_key = f'brands/{brand_id}.svg'
            
            s3.put_object(
                Bucket='files',
                Key=s3_key,
                Body=svg_content.encode('utf-8'),
                ContentType='image/svg+xml'
            )
            
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"
            
            cur.execute(
                "UPDATE brands SET logo_url = %s WHERE id = %s",
                (cdn_url, brand_id)
            )
            
            generated_count += 1
            
        except Exception as e:
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
            'generated': generated_count,
            'total_brands': len(brands_without_logos),
            'errors': errors[:10] if errors else []
        })
    }
