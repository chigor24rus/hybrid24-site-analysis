import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Save customer booking request to database
    Args: event with httpMethod, body containing booking data
    Returns: HTTP response with booking confirmation
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Parse request body
        body_data = json.loads(event.get('body', '{}'))
        
        # Extract booking data
        customer_name = body_data.get('name', '').strip()
        customer_phone = body_data.get('phone', '').strip()
        customer_email = body_data.get('email', '').strip()
        service_type = body_data.get('service', '').strip()
        car_brand = body_data.get('brand', '').strip()
        car_model = body_data.get('model', '').strip()
        preferred_date = body_data.get('date', '').strip()
        preferred_time = body_data.get('time', '').strip()
        comment = body_data.get('comment', '').strip()
        
        # Validation
        if not customer_name or not customer_phone:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Имя и телефон обязательны для заполнения'
                })
            }
        
        # Connect to database
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Insert booking
        cur.execute(
            """
            INSERT INTO bookings 
            (customer_name, customer_phone, customer_email, service_type, 
             car_brand, car_model, preferred_date, preferred_time, comment, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'new')
            RETURNING id, created_at
            """,
            (customer_name, customer_phone, customer_email, service_type,
             car_brand, car_model, preferred_date or None, preferred_time, comment)
        )
        
        result = cur.fetchone()
        booking_id = result['id']
        created_at = result['created_at'].isoformat() if result['created_at'] else None
        
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
                'booking_id': booking_id,
                'created_at': created_at,
                'message': 'Заявка успешно создана'
            })
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Неверный формат данных'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }