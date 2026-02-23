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

    # 2. Получаем данные контрагента (ФИО, email)
    client_data = {'kontragent_key': kontragent_key}
    try:
        resp_k = requests.get(
            f"{odata_url}/Catalog_Контрагенты(guid'{kontragent_key}')?$format=json",
            auth=auth, headers={'Accept': 'application/json'}, timeout=10, verify=False
        )
        if resp_k.ok:
            k = resp_k.json()
            last = (k.get('Фамилия') or '').strip()
            first = (k.get('Имя') or '').strip()
            middle = (k.get('Отчество') or '').strip()
            full_name = ' '.join(filter(None, [last, first, middle])) or k.get('Description', '')
            client_data['name'] = full_name
            client_data['email'] = ''
            for ci in k.get('КонтактнаяИнформация', []):
                if ci.get('Тип') == 'АдресЭлектроннойПочты':
                    client_data['email'] = ci.get('Представление', '')
                    break
    except Exception:
        pass

    null_guid = '00000000-0000-0000-0000-000000000000'

    def resolve_car(auto_key: str) -> dict:
        result = {}
        if not auto_key or auto_key == null_guid:
            return result
        try:
            resp_a = requests.get(
                f"{odata_url}/Catalog_Автомобили(guid'{auto_key}')?$format=json",
                auth=auth, headers={'Accept': 'application/json'}, timeout=10, verify=False
            )
            if resp_a.ok:
                a = resp_a.json()
                result['avtomobil_key'] = auto_key
                result['car_full_name'] = (a.get('НаименованиеПолное') or a.get('Description') or '').strip()
                result['vin'] = (a.get('VIN') or a.get('НомерКузова') or '').strip()
                result['plate_number'] = (a.get('НомерГаражный') or a.get('ГосНомер') or '').strip()
                result['god_vypuska'] = str(a.get('ГодВыпуска') or '')[:4]
                maraka_key = a.get('Марка_Key')
                model_key_a = a.get('Модель_Key')
                if maraka_key and maraka_key != null_guid:
                    try:
                        rm = requests.get(
                            f"{odata_url}/Catalog_МаркиАвтомобилей(guid'{maraka_key}')?$format=json",
                            auth=auth, headers={'Accept': 'application/json'}, timeout=8, verify=False
                        )
                        if rm.ok:
                            result['car_brand'] = (rm.json().get('Description') or '').strip()
                    except Exception:
                        pass
                if model_key_a and model_key_a != null_guid:
                    try:
                        rmod = requests.get(
                            f"{odata_url}/Catalog_МоделиАвтомобилей(guid'{model_key_a}')?$format=json",
                            auth=auth, headers={'Accept': 'application/json'}, timeout=8, verify=False
                        )
                        if rmod.ok:
                            result['car_model'] = (rmod.json().get('Description') or '').strip()
                    except Exception:
                        pass
        except Exception:
            pass
        return result

    car_data = {}

    # 3. Ищем авто через Catalog_Автомобили — загружаем постранично и ищем по коду контрагента
    # Поле владельца в OData не фильтруется, поэтому грузим все авто и ищем по Description/Code
    # Также ищем через контактную информацию контрагента — берём первый Ref_Key из списка авто

    # Запрашиваем все авто с кодом контрагента в Description (иногда так бывает)
    # Основной способ — получить все авто и найти совпадение через Ref_Key нарядов

    # Получаем наряды контрагента (до 100)
    try:
        resp_zn = requests.get(
            f"{odata_url}/Document_ЗаказНаряд?$format=json&$top=100&$orderby=Date desc"
            f"&$filter=Контрагент_Key eq guid'{kontragent_key}'",
            auth=auth, headers={'Accept': 'application/json'}, timeout=15, verify=False
        )
        if resp_zn.ok:
            docs = resp_zn.json().get('value', [])
            # Собираем все уникальные Ref_Key нарядов
            all_refs = set(doc['Ref_Key'] for doc in docs if doc.get('Ref_Key'))

            # Для каждого наряда берём его табличную часть Автомобили через expand
            for doc in docs[:20]:  # Ограничиваем 20 нарядами
                ref = doc.get('Ref_Key')
                if not ref:
                    continue
                try:
                    resp_doc = requests.get(
                        f"{odata_url}/Document_ЗаказНаряд(guid'{ref}')?$format=json&$expand=Автомобили",
                        auth=auth, headers={'Accept': 'application/json'}, timeout=8, verify=False
                    )
                    if resp_doc.ok:
                        d = resp_doc.json()
                        auto_list = d.get('Автомобили') or []
                        vin = (d.get('VIN') or '').strip()
                        gos = (d.get('ГосНомер') or '').strip()
                        if auto_list:
                            auto_key = auto_list[0].get('Автомобиль_Key')
                            if auto_key and auto_key != null_guid:
                                car_data = resolve_car(auto_key)
                                if car_data:
                                    break
                        elif vin or gos:
                            car_data = {'vin': vin, 'plate_number': gos, 'car_full_name': '', 'car_brand': '', 'car_model': '', 'god_vypuska': ''}
                            break
                except Exception:
                    continue
    except Exception:
        pass

    # 4. Если не нашли — ищем через ЗаказНаряды клиента
    if not car_data:
        try:
            resp_zn = requests.get(
                f"{odata_url}/Document_ЗаказНаряд?$format=json&$top=100&$orderby=Date desc"
                f"&$filter=Контрагент_Key eq guid'{kontragent_key}'",
                auth=auth, headers={'Accept': 'application/json'}, timeout=20, verify=False
            )
            if resp_zn.ok:
                docs = resp_zn.json().get('value', [])
                doc_refs = []
                for doc in docs:
                    vin = (doc.get('VIN') or '').strip()
                    gos = (doc.get('ГосНомер') or '').strip()
                    auto_list = doc.get('Автомобили') or []
                    auto_key = None
                    if auto_list:
                        auto_key = auto_list[0].get('Автомобиль_Key')
                        if auto_key == null_guid:
                            auto_key = None
                    if vin or gos or auto_key:
                        doc_car = resolve_car(auto_key) if auto_key else {}
                        car_data = {
                            'vin': vin or doc_car.get('vin', ''),
                            'plate_number': gos or doc_car.get('plate_number', ''),
                            'avtomobil_key': auto_key,
                            'car_full_name': doc_car.get('car_full_name', ''),
                            'car_brand': doc_car.get('car_brand', ''),
                            'car_model': doc_car.get('car_model', ''),
                            'god_vypuska': doc_car.get('god_vypuska', ''),
                        }
                        break
                    ref = doc.get('Ref_Key')
                    if ref:
                        doc_refs.append(ref)

                # Ищем через Document_ЗаказНаряд_Автомобили по Ref_Key нарядов
                if not car_data and doc_refs:
                    for ref_key in doc_refs[:10]:
                        try:
                            resp_autos = requests.get(
                                f"{odata_url}/Document_ЗаказНаряд_Автомобили?$format=json"
                                f"&$filter=Ref_Key eq guid'{ref_key}'",
                                auth=auth, headers={'Accept': 'application/json'}, timeout=8, verify=False
                            )
                            if resp_autos.ok:
                                for a in resp_autos.json().get('value', []):
                                    auto_key = a.get('Автомобиль_Key')
                                    if auto_key and auto_key != null_guid:
                                        car_data = resolve_car(auto_key)
                                        if car_data:
                                            break
                            if car_data:
                                break
                        except Exception:
                            pass
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