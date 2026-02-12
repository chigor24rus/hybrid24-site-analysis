import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Нормализация названий брендов согласно официальной регистрации'''
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
    
    # Официальные названия брендов
    OFFICIAL_NAMES = {
        'faw': 'FAW',
        'gac': 'GAC',
        'byd': 'BYD',
        'baic': 'BAIC',
        'jac': 'JAC',
        'saic': 'SAIC',
        'jmc': 'JMC',
        'kgm': 'KGM',
        'mg': 'MG',
        'bmw': 'BMW',
        'gmc': 'GMC',
        'ram': 'RAM',
        'uaz': 'UAZ',
        'vaz': 'VAZ',
        'aito': 'AITO',
        'avatr': 'AVATR',
        'icar': 'iCAR',
        'dfsk': 'DFSK',
        'lynk co': 'Lynk & Co',
        'lynk & co': 'Lynk & Co',
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
    
    # Нормализация брендов
    cur.execute("SELECT id, name FROM brands")
    brands = cur.fetchall()
    
    brands_updated = 0
    errors = []
    
    for brand in brands:
        original_name = brand['name']
        name_lower = original_name.lower().strip()
        
        # Проверить официальное название
        if name_lower in OFFICIAL_NAMES:
            normalized_name = OFFICIAL_NAMES[name_lower]
        else:
            # Стандартная нормализация: первая буква заглавная
            normalized_name = original_name.title()
        
        if original_name != normalized_name:
            try:
                cur.execute(
                    "UPDATE brands SET name = %s WHERE id = %s",
                    (normalized_name, brand['id'])
                )
                brands_updated += 1
            except Exception as e:
                errors.append(f"Бренд {original_name}: {str(e)}")
    
    # Нормализация моделей (все буквы в верхний регистр)
    cur.execute("SELECT id, name FROM car_models")
    models = cur.fetchall()
    
    models_updated = 0
    
    for model in models:
        original_name = model['name']
        normalized_name = original_name.upper().strip()
        
        if original_name != normalized_name:
            try:
                cur.execute(
                    "UPDATE car_models SET name = %s WHERE id = %s",
                    (normalized_name, model['id'])
                )
                models_updated += 1
            except Exception as e:
                errors.append(f"Модель {original_name}: {str(e)}")
    
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
            'brands_updated': brands_updated,
            'models_updated': models_updated,
            'total_brands': len(brands),
            'total_models': len(models),
            'errors': errors
        })
    }