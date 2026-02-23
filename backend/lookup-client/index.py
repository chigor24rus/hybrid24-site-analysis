import json
import os
import re
import requests
from requests.auth import HTTPBasicAuth
from typing import Dict, Any


def normalize_phone(phone: str) -> str:
    return re.sub(r'\D', '', phone or '')


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Ищет клиента в 1С по номеру телефона, возвращает ФИО и последний автомобиль'''

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    params = event.get('queryStringParameters') or {}
    phone = params.get('phone', '').strip()

    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Укажите номер телефона'})
        }

    odata_url = os.environ.get('ODATA_1C_URL', '').rstrip('/')
    user = os.environ.get('ODATA_1C_DOC_USER') or os.environ.get('ODATA_1C_USER')
    password = os.environ.get('ODATA_1C_DOC_PASSWORD') or os.environ.get('ODATA_1C_PASSWORD')

    if not all([odata_url, user, password]):
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'found': False, 'error': '1С не настроена'})
        }

    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    auth = HTTPBasicAuth(user, password)

    digits = normalize_phone(phone)
    tail = digits[-10:] if len(digits) >= 10 else digits

    # 1. Ищем контрагента по телефону
    try:
        resp = requests.get(
            f"{odata_url}/Catalog_Контрагенты_КонтактнаяИнформация?$format=json&$top=2000",
            auth=auth, headers={'Accept': 'application/json'}, timeout=15, verify=False
        )
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'found': False, 'error': f'Ошибка подключения к 1С: {str(e)}'})
        }

    kontragent_key = None
    if resp.ok:
        for item in resp.json().get('value', []):
            raw = item.get('Представление', '') or ''
            item_tail = normalize_phone(raw)[-10:]
            if item_tail and item_tail == tail:
                kontragent_key = item.get('ObjectId') or item.get('Ref_Key')
                break

    if not kontragent_key:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'found': False})
        }

    # 2. Получаем данные контрагента
    client_data = {'kontragent_key': kontragent_key}
    try:
        resp_k = requests.get(
            f"{odata_url}/Catalog_Контрагенты(guid'{kontragent_key}')?$format=json",
            auth=auth, headers={'Accept': 'application/json'}, timeout=10, verify=False
        )
        if resp_k.ok:
            k = resp_k.json()
            # Собираем ФИО
            last = (k.get('Фамилия') or '').strip()
            first = (k.get('Имя') or '').strip()
            middle = (k.get('Отчество') or '').strip()
            full_name = ' '.join(filter(None, [last, first, middle])) or k.get('Description', '')
            client_data['name'] = full_name
            client_data['email'] = ''
            # Ищем email в контактной информации
            for ci in k.get('КонтактнаяИнформация', []):
                if ci.get('Тип') == 'АдресЭлектроннойПочты':
                    client_data['email'] = ci.get('Представление', '')
                    break
    except Exception:
        pass

    # 3. Ищем последние заявки на ремонт этого клиента → берём автомобиль
    car_data = {}
    try:
        resp_d = requests.get(
            f"{odata_url}/Document_ЗаявкаНаРемонт?$format=json&$top=50&$orderby=Date desc"
            f"&$filter=Контрагент_Key eq guid'{kontragent_key}' or Заказчик_Key eq guid'{kontragent_key}'",
            auth=auth, headers={'Accept': 'application/json'}, timeout=15, verify=False
        )
        if resp_d.ok:
            docs = resp_d.json().get('value', [])
            for doc in docs:
                vin = (doc.get('VIN') or '').strip()
                gos = (doc.get('ГосНомер') or '').strip()
                auto_key = doc.get('Автомобиль_Key')
                model_key = doc.get('Модель_Key')
                god = doc.get('ГодВыпуска')

                if vin or gos or auto_key:
                    car_data['vin'] = vin
                    car_data['plate_number'] = gos
                    car_data['avtomobil_key'] = auto_key
                    car_data['god_vypuska'] = god[:4] if god else ''

                    # Расшифровываем автомобиль по ключу
                    if auto_key and auto_key != '00000000-0000-0000-0000-000000000000':
                        try:
                            resp_a = requests.get(
                                f"{odata_url}/Catalog_Автомобили(guid'{auto_key}')?$format=json",
                                auth=auth, headers={'Accept': 'application/json'}, timeout=10, verify=False
                            )
                            if resp_a.ok:
                                a = resp_a.json()
                                car_data['car_full_name'] = (a.get('НаименованиеПолное') or a.get('Description') or '').strip()
                                car_data['vin'] = car_data['vin'] or (a.get('VIN') or '').strip()
                                car_data['plate_number'] = car_data['plate_number'] or (a.get('НомерГаражный') or '').strip()
                                maraka_key = a.get('Марка_Key')
                                model_key_a = a.get('Модель_Key')
                                # Расшифруем марку и модель
                                if maraka_key and maraka_key != '00000000-0000-0000-0000-000000000000':
                                    try:
                                        rm = requests.get(
                                            f"{odata_url}/Catalog_МаркиАвтомобилей(guid'{maraka_key}')?$format=json",
                                            auth=auth, headers={'Accept': 'application/json'}, timeout=8, verify=False
                                        )
                                        if rm.ok:
                                            car_data['car_brand'] = (rm.json().get('Description') or '').strip()
                                    except Exception:
                                        pass
                                if model_key_a and model_key_a != '00000000-0000-0000-0000-000000000000':
                                    try:
                                        rmod = requests.get(
                                            f"{odata_url}/Catalog_МоделиАвтомобилей(guid'{model_key_a}')?$format=json",
                                            auth=auth, headers={'Accept': 'application/json'}, timeout=8, verify=False
                                        )
                                        if rmod.ok:
                                            car_data['car_model'] = (rmod.json().get('Description') or '').strip()
                                    except Exception:
                                        pass
                        except Exception:
                            pass
                    break
    except Exception:
        pass

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'found': True,
            'kontragent_key': kontragent_key,
            'name': client_data.get('name', ''),
            'email': client_data.get('email', ''),
            'car': car_data
        }, ensure_ascii=False)
    }
