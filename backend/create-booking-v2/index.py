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
    doc_user = os.environ.get('ODATA_1C_DOC_USER') or os.environ.get('ODATA_1C_USER')
    doc_password = os.environ.get('ODATA_1C_DOC_PASSWORD') or os.environ.get('ODATA_1C_PASSWORD')

    if not all([odata_url, doc_user, doc_password]):
        return

    def find_marketing_by_name(name):
        if not name:
            return None
        try:
            resp = requests.get(
                f"{odata_url}/Catalog_МаркетинговыеПрограммы?$format=json&$top=500",
                auth=HTTPBasicAuth(doc_user, doc_password),
                headers={'Accept': 'application/json'}, timeout=10, verify=False
            )
            if resp.ok:
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
    if booking_data.get('car_full_name'):
        parts.append(f"Автомобиль: {booking_data['car_full_name']}")
    elif booking_data.get('brand'):
        parts.append(f"Марка: {booking_data['brand']}")
        if booking_data.get('model'):
            parts.append(f"Модель: {booking_data['model']}")
    if booking_data.get('vin'):
        parts.append(f"VIN: {booking_data['vin']}")
    if booking_data.get('plate_number'):
        parts.append(f"Гос.Номер: {booking_data['plate_number']}")
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
        "ОбращениеККлиенту": booking_data.get('name', ''),
        "ПредставлениеТелефонаСтрокой": booking_data.get('phone', ''),
        "АдресЭлектроннойПочтыСтрокой": booking_data.get('email', ''),
        "ОписаниеПричиныОбращения": description,
        "Комментарий": description,
    }

    # Контрагент из 1С (если найден при создании заявки)
    kontragent_key = booking_data.get('kontragent_key')
    if kontragent_key and kontragent_key != '00000000-0000-0000-0000-000000000000':
        doc_data["Заказчик_Key"] = kontragent_key
        doc_data["Контрагент_Key"] = kontragent_key

    # Автомобиль из 1С
    avtomobil_key = booking_data.get('avtomobil_key')
    if avtomobil_key and avtomobil_key != '00000000-0000-0000-0000-000000000000':
        doc_data["Автомобиль_Key"] = avtomobil_key

    # VIN и госномер
    if booking_data.get('vin'):
        doc_data["VIN"] = booking_data['vin']
    if booking_data.get('plate_number'):
        doc_data["ГосНомер"] = booking_data['plate_number']

    # Маркетинговая программа (акция)
    if booking_data.get('promotion'):
        marketing_key = find_marketing_by_name(booking_data['promotion'])
        if marketing_key:
            doc_data["МаркетинговаяПрограмма_Key"] = marketing_key

    try:
        response = requests.post(
            f"{odata_url}/Document_ЗаявкаНаРемонт",
            auth=HTTPBasicAuth(doc_user, doc_password),
            headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
            json=doc_data,
            timeout=15,
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
    '''Создаёт заявку в БД с данными из 1С и отправляет обратно в 1С'''

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

        # Основные поля
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

        # Поля из 1С (заполняются фронтендом после lookup-client)
        kontragent_key = (body_data.get('kontragent_key') or '').strip()
        avtomobil_key = (body_data.get('avtomobil_key') or '').strip()
        car_full_name = (body_data.get('car_full_name') or '').strip()
        plate_number = (body_data.get('plate_number') or '').strip()
        vin = (body_data.get('vin') or '').strip()
        car_year = (body_data.get('car_year') or '').strip()
        client_found_in_1c = bool(kontragent_key)

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
             car_brand, car_model, preferred_date, preferred_time, comment, status,
             kontragent_key, avtomobil_key, car_full_name, plate_number, vin, car_year, client_found_in_1c)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'new',
                    %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at, promotion
            """,
            (name, phone, email, service, promotion, brand, model, date or None, time, comment,
             kontragent_key, avtomobil_key, car_full_name, plate_number, vin, car_year, client_found_in_1c)
        )

        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        booking_id = result['id']
        _send_to_1c({
            'name': name, 'phone': phone, 'email': email,
            'service': service, 'promotion': promotion,
            'brand': brand, 'model': model,
            'date': date, 'time': time, 'comment': comment,
            'kontragent_key': kontragent_key,
            'avtomobil_key': avtomobil_key,
            'car_full_name': car_full_name,
            'plate_number': plate_number,
            'vin': vin,
        }, booking_id, dsn)

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
