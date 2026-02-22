import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime


def handler(event: dict, context) -> dict:
    '''Повторная отправка заявки в 1С для заявок, которые не были синхронизированы'''

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
            'body': json.dumps({'success': False, 'error': 'Method not allowed'})
        }

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body) if raw_body.strip() else {}
    booking_id = body.get('booking_id')

    if not booking_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'booking_id обязателен'})
        }

    odata_url = os.environ.get('ODATA_1C_URL', '').rstrip('/')
    odata_user = os.environ.get('ODATA_1C_USER')
    odata_password = os.environ.get('ODATA_1C_PASSWORD')
    dsn = os.environ.get('DATABASE_URL')

    if not all([odata_url, odata_user, odata_password, dsn]):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Не настроены параметры подключения'})
        }

    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        """SELECT id, customer_name, customer_phone, customer_email,
                  service_type, car_brand, car_model, preferred_date,
                  preferred_time, comment
           FROM bookings WHERE id = %s""",
        (booking_id,)
    )
    booking = cur.fetchone()
    cur.close()
    conn.close()

    if not booking:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Заявка не найдена'})
        }

    parts = []
    if booking.get('service_type'):
        parts.append(f"Услуга: {booking['service_type']}")
    if booking.get('car_brand'):
        parts.append(f"Марка: {booking['car_brand']}")
    if booking.get('car_model'):
        parts.append(f"Модель: {booking['car_model']}")
    if booking.get('preferred_date'):
        parts.append(f"Желаемая дата: {str(booking['preferred_date'])}")
    if booking.get('preferred_time'):
        parts.append(f"Желаемое время: {booking['preferred_time']}")
    if booking.get('customer_email'):
        parts.append(f"Email: {booking['customer_email']}")
    parts.append(f"ID заявки сайта: {booking['id']}")
    if booking.get('comment'):
        parts.append(f"Комментарий: {booking['comment']}")

    description = "\n".join(parts)
    date_str = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

    doc_data = {
        "Date": date_str,
        "ОбращениеККлиенту": booking.get('customer_name', ''),
        "ПредставлениеТелефонаСтрокой": booking.get('customer_phone', ''),
        "АдресЭлектроннойПочтыСтрокой": booking.get('customer_email', ''),
        "ОписаниеПричиныОбращения": description,
        "Комментарий": description,
    }

    # Получаем ВидРемонта из справочника 1С
    vid_remont_key = None
    try:
        vr_resp = requests.get(
            f"{odata_url}/Catalog_ВидыРемонта?$top=1&$format=json",
            auth=HTTPBasicAuth(odata_user, odata_password),
            headers={'Accept': 'application/json'},
            timeout=10,
            verify=False
        )
        if vr_resp.status_code == 200:
            vr_data = vr_resp.json()
            items = vr_data.get('value', [])
            if items:
                vid_remont_key = items[0].get('Ref_Key')
                print(f"[1C] ВидРемонта_Key: {vid_remont_key} ({items[0].get('Description', '')})")
    except Exception as e:
        print(f"[1C] Ошибка получения ВидыРемонта: {e}")

    if vid_remont_key:
        doc_data["ВидРемонта_Key"] = vid_remont_key

    print(f"[1C] POST {odata_url}/Document_ЗаявкаНаРемонт")
    print(f"[1C] body: {json.dumps(doc_data, ensure_ascii=False)}")

    response = requests.post(
        f"{odata_url}/Document_ЗаявкаНаРемонт",
        auth=HTTPBasicAuth(odata_user, odata_password),
        headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
        json=doc_data,
        timeout=15,
        verify=False
    )

    print(f"[1C] status: {response.status_code}")
    print(f"[1C] response: {response.text[:2000]}")

    if response.status_code in (200, 201):
        conn2 = psycopg2.connect(dsn)
        cur2 = conn2.cursor()
        cur2.execute(
            "UPDATE bookings SET synced_to_1c = TRUE, synced_to_1c_at = NOW() WHERE id = %s",
            (booking_id,)
        )
        conn2.commit()
        cur2.close()
        conn2.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Заявка успешно передана в 1С'}, ensure_ascii=False)
        }
    else:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': f'1С вернула ошибку {response.status_code}',
                'detail': response.text[:300]
            }, ensure_ascii=False)
        }