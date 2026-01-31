import json
import os
from typing import Dict, Any
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage service prices - get, create, update, delete operations
    Args: event with httpMethod, body with price data
    Returns: HTTP response with operation result
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # GET all prices with brand and service names
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            brand_id = params.get('brand_id')
            service_id = params.get('service_id')
            
            query = """
                SELECT 
                    sp.id, sp.service_id, sp.brand_id, sp.model_id,
                    sp.base_price, sp.currency, sp.created_at, sp.updated_at,
                    s.title as service_title,
                    b.name as brand_name
                FROM service_prices sp
                JOIN services s ON sp.service_id = s.id
                JOIN brands b ON sp.brand_id = b.id
                WHERE 1=1
            """
            
            params_list = []
            if brand_id:
                query += " AND sp.brand_id = %s"
                params_list.append(brand_id)
            if service_id:
                query += " AND sp.service_id = %s"
                params_list.append(service_id)
            
            query += " ORDER BY b.name, s.title"
            
            if params_list:
                cur.execute(query, params_list)
            else:
                cur.execute(query)
            
            rows = cur.fetchall()
            
            prices = []
            for row in rows:
                price = dict(row)
                if price.get('created_at'):
                    price['created_at'] = price['created_at'].isoformat()
                if price.get('updated_at'):
                    price['updated_at'] = price['updated_at'].isoformat()
                if isinstance(price.get('base_price'), Decimal):
                    price['base_price'] = float(price['base_price'])
                prices.append(price)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'prices': prices,
                    'total': len(prices)
                })
            }
        
        # CREATE new price
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            service_id = body_data.get('service_id')
            brand_id = body_data.get('brand_id')
            base_price = body_data.get('base_price')
            currency = body_data.get('currency', '₽').strip()
            
            if not service_id or not brand_id or base_price is None:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'service_id, brand_id и base_price обязательны'})
                }
            
            # Check if price already exists
            cur.execute(
                """
                SELECT id FROM service_prices 
                WHERE service_id = %s AND brand_id = %s AND model_id IS NULL
                """,
                (service_id, brand_id)
            )
            existing = cur.fetchone()
            
            if existing:
                cur.close()
                conn.close()
                return {
                    'statusCode': 409,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Цена для этой комбинации услуги и бренда уже существует'})
                }
            
            cur.execute(
                """
                INSERT INTO service_prices (service_id, brand_id, base_price, currency)
                VALUES (%s, %s, %s, %s)
                RETURNING id, service_id, brand_id, base_price, currency
                """,
                (service_id, brand_id, base_price, currency)
            )
            
            result = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            price_data = dict(result)
            if isinstance(price_data.get('base_price'), Decimal):
                price_data['base_price'] = float(price_data['base_price'])
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'price': price_data,
                    'message': 'Цена создана'
                })
            }
        
        # UPDATE existing price
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            price_id = body_data.get('id')
            base_price = body_data.get('base_price')
            
            if not price_id or base_price is None:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'ID и base_price обязательны'})
                }
            
            cur.execute(
                """
                UPDATE service_prices
                SET base_price = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, service_id, brand_id, base_price, currency
                """,
                (base_price, price_id)
            )
            
            result = cur.fetchone()
            
            if not result:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Цена не найдена'})
                }
            
            conn.commit()
            cur.close()
            conn.close()
            
            price_data = dict(result)
            if isinstance(price_data.get('base_price'), Decimal):
                price_data['base_price'] = float(price_data['base_price'])
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'price': price_data,
                    'message': 'Цена обновлена'
                })
            }
        
        # DELETE price
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            price_id = body_data.get('id')
            
            if not price_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'ID цены обязателен'})
                }
            
            cur.execute("DELETE FROM service_prices WHERE id = %s RETURNING id", (price_id,))
            result = cur.fetchone()
            
            if not result:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Цена не найдена'})
                }
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'message': 'Цена удалена'
                })
            }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Метод не поддерживается'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'error': str(e),
                'message': 'Внутренняя ошибка сервера'
            })
        }