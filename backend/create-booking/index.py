import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
from requests.auth import HTTPBasicAuth


def _send_to_1c(booking_data: dict, booking_id: int):
    odata_url = os.environ.get('ODATA_1C_URL', '').rstrip('/')
    odata_user = os.environ.get('ODATA_1C_USER')
    odata_password = os.environ.get('ODATA_1C_PASSWORD')

    if not all([odata_url, odata_user, odata_password]):
        return

    parts = []
    if booking_data.get('service'):
        parts.append(f"Услуга: {booking_data['service']}")
    if booking_data.get('brand'):
        parts.append(f"Марка: {booking_data['brand']}")
    if booking_data.get('model'):
        parts.append(f"Модель: {booking_data['model']}")
    if booking_data.get('date'):
        parts.append(f"Желаемая дата: {booking_data['date']}")
    if booking_data.get('time'):
        parts.append(f"Желаемое время: {booking_data['time']}")
    if booking_data.get('email'):
        parts.append(f"Email: {booking_data['email']}")
    parts.append(f"ID заявки сайта: {booking_id}")
    if booking_data.get('comment'):
        parts.append(f"Комментарий: {booking_data['comment']}")

    description = "\n".join(parts)
    date_str = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

    doc_data = {
        "Date": date_str,
        "Контрагент_Key": "00000000-0000-0000-0000-000000000000",
        "ИмяКлиента": booking_data.get('name', ''),
        "ТелефонКлиента": booking_data.get('phone', ''),
        "КомментарийКлиента": description,
        "ОписаниеНеисправности": description
    }

    try:
        requests.post(
            f"{odata_url}/Document_ЗаявкаНаРемонт",
            auth=HTTPBasicAuth(odata_user, odata_password),
            headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
            json=doc_data,
            timeout=10
        )
    except Exception:
        pass


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Сохраняет заявку клиента в БД и передаёт её в 1С через OData'''

    method: str = event.get('httpMethod', 'POST')

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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        body_data = json.loads(event.get('body', '{}'))

        customer_name = body_data.get('name', '').strip()
        customer_phone = body_data.get('phone', '').strip()
        customer_email = body_data.get('email', '').strip()
        service_type = body_data.get('service', '').strip()
        car_brand = body_data.get('brand', '').strip()
        car_model = body_data.get('model', '').strip()
        preferred_date = body_data.get('date', '').strip()
        preferred_time = body_data.get('time', '').strip()
        comment = body_data.get('comment', '').strip()

        if not customer_name or not customer_phone:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Имя и телефон обязательны для заполнения'})
            }

        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')

        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)

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

        _send_to_1c(body_data, booking_id)

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный формат данных'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }
