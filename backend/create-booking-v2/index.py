import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Сохраняет заявку в БД (v2 с поддержкой акции)'''

    if event.get('httpMethod') == 'OPTIONS':
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

    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        import base64
        raw_body = event.get('body') or '{}'
        if event.get('isBase64Encoded'):
            raw_body = base64.b64decode(raw_body).decode('utf-8')
        if isinstance(raw_body, dict):
            body_data = raw_body
        else:
            body_data = json.loads(raw_body)

        name = (body_data.get('name') or '').strip()
        phone = (body_data.get('phone') or '').strip()
        email = (body_data.get('email') or '').strip()
        service = (body_data.get('service') or '').strip()
        promotion = (body_data.get('promotion') or '').strip()
        brand = (body_data.get('brand') or '').strip()
        model = (body_data.get('model') or '').strip()
        date = (body_data.get('date') or '').strip()
        time = (body_data.get('time') or '').strip()
        comment = (body_data.get('comment') or '').strip()

        if not name or not phone:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Имя и телефон обязательны'})
            }

        dsn = os.environ['DATABASE_URL']
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute(
            """
            INSERT INTO bookings
            (customer_name, customer_phone, customer_email, service_type, promotion,
             car_brand, car_model, preferred_date, preferred_time, comment, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'new')
            RETURNING id, created_at, promotion
            """,
            (name, phone, email, service, promotion, brand, model, date or None, time, comment)
        )

        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'booking_id': result['id'],
                'promotion': result['promotion'],
                'created_at': result['created_at'].isoformat(),
                'message': 'Заявка успешно создана'
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
