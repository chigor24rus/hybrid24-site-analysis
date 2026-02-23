import json
import os
import re
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
from requests.auth import HTTPBasicAuth


def _send_to_1c(booking_data: dict, booking_id: int, dsn: str):
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    odata_url = os.environ.get('ODATA_1C_URL', '').rstrip('/')
    odata_user = os.environ.get('ODATA_1C_USER')
    odata_password = os.environ.get('ODATA_1C_PASSWORD')

    if not all([odata_url, odata_user, odata_password]):
        return

    def normalize_phone(phone):
        return re.sub(r'\D', '', phone or '')

    def find_kontragent_by_phone(url, user, pwd, phone):
        digits = normalize_phone(phone)
        if not digits:
            return None
        search_tail = digits[-10:] if len(digits) >= 10 else digits
        try:
            resp = requests.get(
                f"{url}/Catalog_Контрагенты_КонтактнаяИнформация?$format=json&$top=2000",
                auth=HTTPBasicAuth(user, pwd),
                headers={'Accept': 'application/json'},
                timeout=10,
                verify=False
            )
            if resp.status_code == 200:
                for item in resp.json().get('value', []):
                    raw = item.get('Представление', '') or ''
                    item_tail = normalize_phone(raw)[-10:]
                    if item_tail and item_tail == search_tail:
                        return item.get('ObjectId') or item.get('Ref_Key')
        except Exception:
            pass
        return None

    def find_marketing_by_name(url, user, pwd, name):
        if not name:
            return None
        try:
            resp = requests.get(
                f"{url}/Catalog_МаркетинговыеПрограммы?$format=json&$top=500",
                auth=HTTPBasicAuth(user, pwd),
                headers={'Accept': 'application/json'},
                timeout=10,
                verify=False
            )
            if resp.status_code == 200:
                name_lower = name.lower().strip()
                for item in resp.json().get('value', []):
                    desc = (item.get('Description') or '').lower().strip()
                    if desc and (desc == name_lower or name_lower in desc or desc in name_lower):
                        return item.get('Ref_Key')
        except Exception:
            pass
        return None

    parts = []
    if booking_data.get('phone'):
        parts.append(f"Телефон: {booking_data['phone']}")
    if booking_data.get('service'):
        parts.append(f"Услуга: {booking_data['service']}")
    if booking_data.get('promotion'):
        parts.append(f"Акция: {booking_data['promotion']}")
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

    doc_user = os.environ.get('ODATA_1C_DOC_USER', odata_user)
    doc_password = os.environ.get('ODATA_1C_DOC_PASSWORD', odata_password)

    doc_data = {
        "Date": date_str,
        "ОбращениеККлиенту": booking_data.get('name', ''),
        "ПредставлениеТелефонаСтрокой": booking_data.get('phone', ''),
        "АдресЭлектроннойПочтыСтрокой": booking_data.get('email', ''),
        "ОписаниеПричиныОбращения": description,
        "Комментарий": description,
    }

    kontragent_key = find_kontragent_by_phone(odata_url, doc_user, doc_password, booking_data.get('phone', ''))
    if kontragent_key:
        doc_data["Заказчик_Key"] = kontragent_key
        doc_data["Контрагент_Key"] = kontragent_key

    promotion_name = booking_data.get('promotion', '')
    if promotion_name:
        marketing_key = find_marketing_by_name(odata_url, doc_user, doc_password, promotion_name)
        if marketing_key:
            doc_data["МаркетинговаяПрограмма_Key"] = marketing_key

    try:
        response = requests.post(
            f"{odata_url}/Document_ЗаявкаНаРемонт",
            auth=HTTPBasicAuth(doc_user, doc_password),
            headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
            json=doc_data,
            timeout=10,
            verify=False
        )
        synced = response.status_code in (200, 201)
    except Exception:
        synced = False

    if synced:
        try:
            conn2 = psycopg2.connect(dsn)
            cur2 = conn2.cursor()
            cur2.execute(
                "UPDATE bookings SET synced_to_1c = TRUE, synced_to_1c_at = NOW() WHERE id = %s",
                (booking_id,)
            )
            conn2.commit()
            cur2.close()
            conn2.close()
        except Exception:
            pass


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Создаёт заявку в БД и отправляет в 1С'''

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

        booking_id = result['id']
        _send_to_1c(
            {'name': name, 'phone': phone, 'email': email, 'service': service,
             'promotion': promotion, 'brand': brand, 'model': model,
             'date': date, 'time': time, 'comment': comment},
            booking_id, dsn
        )

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'booking_id': booking_id,
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
