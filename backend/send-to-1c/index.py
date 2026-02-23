import json
import os
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime
from utils_1c import find_kontragent_by_phone, get_vid_remonta, find_marketing_program_by_name

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def handler(event: dict, context) -> dict:
    '''Отправляет заявку с сайта в 1С через OData как Document_ЗаявкаНаРемонт'''

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

    odata_url = os.environ.get('ODATA_1C_URL', '').rstrip('/')
    doc_user = os.environ.get('ODATA_1C_DOC_USER') or os.environ.get('ODATA_1C_USER')
    doc_password = os.environ.get('ODATA_1C_DOC_PASSWORD') or os.environ.get('ODATA_1C_PASSWORD')

    if not all([odata_url, doc_user, doc_password]):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Не настроены параметры подключения к 1С'})
        }

    body = json.loads(event.get('body', '{}'))

    customer_name = body.get('name', '').strip()
    customer_phone = body.get('phone', '').strip()
    customer_email = body.get('email', '').strip()
    service_type = body.get('service', '').strip()
    promotion = body.get('promotion', '').strip()
    car_brand = body.get('brand', '').strip()
    car_model = body.get('model', '').strip()
    preferred_date = body.get('date', '').strip()
    preferred_time = body.get('time', '').strip()
    comment = body.get('comment', '').strip()
    booking_id = body.get('booking_id')

    if not customer_name or not customer_phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Имя и телефон обязательны'})
        }

    auth = HTTPBasicAuth(doc_user, doc_password)
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}

    description_parts = []
    if customer_phone:
        description_parts.append(f"Телефон: {customer_phone}")
    if service_type:
        description_parts.append(f"Услуга: {service_type}")
    if promotion:
        description_parts.append(f"Акция: {promotion}")
    if car_brand:
        description_parts.append(f"Марка: {car_brand}")
    if car_model:
        description_parts.append(f"Модель: {car_model}")
    if preferred_date:
        description_parts.append(f"Желаемая дата: {preferred_date}")
    if preferred_time:
        description_parts.append(f"Желаемое время: {preferred_time}")
    if customer_email:
        description_parts.append(f"Email: {customer_email}")
    if booking_id:
        description_parts.append(f"ID заявки сайта: {booking_id}")
    if comment:
        description_parts.append(f"Комментарий: {comment}")

    description = "\n".join(description_parts)
    date_str = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

    doc_data = {
        "Date": date_str,
        "ОбращениеККлиенту": customer_name,
        "ПредставлениеТелефонаСтрокой": customer_phone,
        "АдресЭлектроннойПочтыСтрокой": customer_email,
        "ОписаниеПричиныОбращения": description,
        "Комментарий": description,
    }

    # Ищем контрагента по телефону
    kontragent_info = find_kontragent_by_phone(odata_url, doc_user, doc_password, customer_phone)
    kontragent_key = None
    if kontragent_info:
        kontragent_key = kontragent_info.get('kontragent_key')
        if kontragent_key:
            doc_data["Заказчик_Key"] = kontragent_key
            doc_data["Контрагент_Key"] = kontragent_key

    # Ищем маркетинговую программу (акцию) по названию
    if promotion:
        marketing_key = find_marketing_program_by_name(odata_url, doc_user, doc_password, promotion)
        if marketing_key:
            doc_data["МаркетинговаяПрограмма_Key"] = marketing_key

    # Получаем Вид ремонта
    vid_remont_key = get_vid_remonta(odata_url, doc_user, doc_password)
    if vid_remont_key:
        doc_data["ВидРемонта_Key"] = vid_remont_key

    print(f"[1C] POST {odata_url}/Document_ЗаявкаНаРемонт")
    print(f"[1C] body: {json.dumps(doc_data, ensure_ascii=False)}")

    response = requests.post(
        f"{odata_url}/Document_ЗаявкаНаРемонт",
        auth=auth,
        headers=headers,
        json=doc_data,
        timeout=15,
        verify=False
    )

    print(f"[1C] status: {response.status_code}")
    print(f"[1C] response: {response.text[:500]}")

    if response.status_code in (200, 201):
        try:
            result = response.json()
        except Exception:
            result = {}
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Заявка передана в 1С',
                '1c_ref': result.get('Ref_Key') or result.get('ref_key', ''),
                '1c_number': result.get('Number', ''),
                'kontragent_found': kontragent_info is not None
            }, ensure_ascii=False)
        }
    else:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': f'1С вернула ошибку {response.status_code}',
                'detail': response.text[:500]
            }, ensure_ascii=False)
        }