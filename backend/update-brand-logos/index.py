import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Обновляет логотипы всех брендов в базе данных с автолого.рф
    Args: event - HTTP запрос, context - контекст выполнения
    Returns: HTTP response с результатом
    '''
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
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    logos_map = {
        'toyota': 'https://avtologo.ru/foto/Toyota.png',
        'honda': 'https://avtologo.ru/foto/Honda.png',
        'nissan': 'https://avtologo.ru/foto/Nissan.png',
        'lexus': 'https://avtologo.ru/foto/Lexus.png',
        'mazda': 'https://avtologo.ru/foto/Mazda.png',
        'mitsubishi': 'https://avtologo.ru/foto/Mitsubishi.png',
        'subaru': 'https://avtologo.ru/foto/Subaru.png',
        'suzuki': 'https://avtologo.ru/foto/Suzuki.png',
        'acura': 'https://avtologo.ru/foto/Acura.png',
        'hyundai': 'https://avtologo.ru/foto/Hyundai.png',
        'kia': 'https://avtologo.ru/foto/Kia.png',
        'haval': 'https://avtologo.ru/foto/Haval.png',
        'geely': 'https://avtologo.ru/foto/Geely.png',
        'changan': 'https://avtologo.ru/foto/Changan.png',
        'belgee': 'https://avtologo.ru/foto/Belgee.png',
        'lifan': 'https://avtologo.ru/foto/Lifan.png',
        'jetour': 'https://avtologo.ru/foto/Jetour.png',
        'tank': 'https://avtologo.ru/foto/Tank.png',
        'exeed': 'https://avtologo.ru/foto/Exeed.png',
        'omoda': 'https://avtologo.ru/foto/Omoda.png',
        'gac': 'https://avtologo.ru/foto/GAC.png',
        'li auto': 'https://avtologo.ru/foto/Li-Auto.png',
        'jac': 'https://avtologo.ru/foto/JAC.png',
        'voyah': 'https://avtologo.ru/foto/Voyah.png',
        'zeekr': 'https://avtologo.ru/foto/Zeekr.png',
        'hongqi': 'https://avtologo.ru/foto/Hongqi.png',
        'faw': 'https://avtologo.ru/foto/FAW.png',
        'dongfeng': 'https://avtologo.ru/foto/Dongfeng.png',
        'jaecoo': 'https://avtologo.ru/foto/Jaecoo.png',
        'bestune': 'https://avtologo.ru/foto/Bestune.png',
        'chery': 'https://avtologo.ru/foto/Chery.png'
    }
    
    updated_count = 0
    
    for slug, logo_url in logos_map.items():
        cur.execute(
            "UPDATE brands SET logo_url = %s WHERE slug = %s",
            (logo_url, slug)
        )
        if cur.rowcount > 0:
            updated_count += 1
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': f'Обновлено логотипов: {updated_count}',
            'updated_count': updated_count
        })
    }