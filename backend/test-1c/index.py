import json
import os
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для тестирования интеграции с 1С через OData'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    odata_url = os.environ.get('ODATA_1C_URL')
    odata_user = os.environ.get('ODATA_1C_USER')
    odata_password = os.environ.get('ODATA_1C_PASSWORD')
    
    if not all([odata_url, odata_user, odata_password]):
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Не настроены параметры подключения к 1С (ODATA_1C_URL, ODATA_1C_USER, ODATA_1C_PASSWORD)'
            })
        }
    
    auth = HTTPBasicAuth(odata_user, odata_password)
    
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    ssl_verify = False
    doc_user = os.environ.get('ODATA_1C_DOC_USER', odata_user)
    doc_password = os.environ.get('ODATA_1C_DOC_PASSWORD', odata_password)
    doc_auth = HTTPBasicAuth(doc_user, doc_password)
    
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', 'ping')
        
        if method == 'GET':
            if action == 'ping':
                response = requests.get(
                    odata_url,
                    auth=auth,
                    timeout=10,
                    headers={'Accept': 'application/json'},
                    verify=ssl_verify
                )
                
                try:
                    data = response.json()
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': True,
                            'message': 'Подключение к 1С успешно',
                            'status_code': response.status_code,
                            'url': odata_url,
                            'available_entities': data.get('value', []) if isinstance(data, dict) else [],
                            'response_preview': str(data)[:500]
                        }, ensure_ascii=False)
                    }
                except:
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': True,
                            'message': 'Подключение к 1С успешно',
                            'status_code': response.status_code,
                            'url': odata_url,
                            'response_text': response.text[:500]
                        })
                    }
            
            elif action == 'metadata':
                import xml.etree.ElementTree as ET
                
                response = requests.get(
                    f"{odata_url}/$metadata",
                    auth=auth,
                    timeout=10,
                    verify=ssl_verify
                )
                
                try:
                    root = ET.fromstring(response.text)
                    namespaces = {
                        'edmx': 'http://schemas.microsoft.com/ado/2007/06/edmx',
                        'edm': 'http://schemas.microsoft.com/ado/2009/11/edm',
                        'm': 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'
                    }
                    
                    entity_types = []
                    for entity in root.findall('.//edm:EntityType', namespaces):
                        entity_name = entity.get('Name', 'Unknown')
                        properties = []
                        for prop in entity.findall('.//edm:Property', namespaces):
                            properties.append({
                                'name': prop.get('Name'),
                                'type': prop.get('Type'),
                                'nullable': prop.get('Nullable', 'true')
                            })
                        entity_types.append({
                            'name': entity_name,
                            'properties': properties[:20]
                        })
                    
                    entity_sets = []
                    for entity_set in root.findall('.//edm:EntitySet', namespaces):
                        entity_sets.append({
                            'name': entity_set.get('Name'),
                            'type': entity_set.get('EntityType')
                        })
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': True,
                            'message': 'Метаданные получены',
                            'entity_sets': entity_sets,
                            'entity_types': entity_types[:10],
                            'total_entities': len(entity_types),
                            'total_sets': len(entity_sets)
                        }, ensure_ascii=False)
                    }
                except Exception as parse_error:
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': True,
                            'message': 'Метаданные получены (raw)',
                            'metadata': response.text[:2000],
                            'full_length': len(response.text),
                            'parse_error': str(parse_error)
                        })
                    }
            
            elif action == 'services':
                response = requests.get(
                    f"{odata_url}/Catalog_Services",
                    auth=auth,
                    headers={'Accept': 'application/json'},
                    timeout=10,
                    verify=ssl_verify
                )
                
                data = response.json()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Список услуг получен',
                        'count': len(data.get('value', [])),
                        'services': data.get('value', [])[:10]
                    })
                }
            
            elif action == 'schema':
                import xml.etree.ElementTree as ET
                entity = query_params.get('entity', 'Document_ЗаявкаНаРемонт')
                response = requests.get(
                    f"{odata_url}/$metadata",
                    auth=auth,
                    timeout=15,
                    verify=ssl_verify
                )
                try:
                    root = ET.fromstring(response.text)
                    ns = {
                        'edmx': 'http://schemas.microsoft.com/ado/2007/06/edmx',
                        'edm': 'http://schemas.microsoft.com/ado/2009/11/edm',
                    }
                    fields = []
                    for et in root.findall('.//edm:EntityType', ns):
                        if et.get('Name') == entity:
                            for prop in et.findall('.//edm:Property', ns):
                                fields.append({
                                    'name': prop.get('Name'),
                                    'type': prop.get('Type'),
                                    'nullable': prop.get('Nullable', 'true')
                                })
                            break
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True,
                            'entity': entity,
                            'fields_count': len(fields),
                            'fields': fields
                        }, ensure_ascii=False)
                    }
                except Exception as e:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': False,
                            'error': str(e),
                            'raw': response.text[:500]
                        }, ensure_ascii=False)
                    }

            elif action == 'read_doc':
                response = requests.get(
                    f"{odata_url}/Document_ЗаявкаНаРемонт?$top=1&$format=json",
                    auth=doc_auth,
                    headers={'Accept': 'application/json'},
                    timeout=15,
                    verify=ssl_verify
                )
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'status_code': response.status_code,
                        'data': response.json() if response.ok else None,
                        'raw': response.text[:2000]
                    }, ensure_ascii=False)
                }

            elif action == 'read_org':
                response = requests.get(
                    f"{odata_url}/Catalog_Организации?$top=5&$format=json&$select=Ref_Key,Description",
                    auth=doc_auth,
                    headers={'Accept': 'application/json'},
                    timeout=15,
                    verify=ssl_verify
                )
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'status_code': response.status_code,
                        'data': response.json() if response.ok else None,
                        'raw': response.text[:2000]
                    }, ensure_ascii=False)
                }

            elif action == 'sample':
                entity = query_params.get('entity', 'Catalog_Автомобили')
                top = int(query_params.get('top', '2'))
                response = requests.get(
                    f"{odata_url}/{entity}?$top={top}&$format=json",
                    auth=doc_auth,
                    headers={'Accept': 'application/json'},
                    timeout=15,
                    verify=ssl_verify
                )
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': response.ok,
                        'status_code': response.status_code,
                        'entity': entity,
                        'data': response.json().get('value', []) if response.ok else None,
                        'raw': response.text[:3000]
                    }, ensure_ascii=False)
                }

            elif action == 'kontragent':
                import re
                phone = query_params.get('phone', '')
                def norm(p): return re.sub(r'\D', '', p or '')
                digits = norm(phone)
                tail = digits[-10:] if len(digits) >= 10 else digits
                resp_ci = requests.get(
                    f"{odata_url}/Catalog_Контрагенты_КонтактнаяИнформация?$format=json&$top=2000",
                    auth=doc_auth, headers={'Accept': 'application/json'}, timeout=15, verify=ssl_verify
                )
                kontragent_key = None
                if resp_ci.ok:
                    for item in resp_ci.json().get('value', []):
                        raw = item.get('Представление', '') or ''
                        it = norm(raw)[-10:]
                        if it and it == tail:
                            kontragent_key = item.get('ObjectId') or item.get('Ref_Key')
                            break
                if not kontragent_key:
                    return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'success': False, 'error': f'Контрагент не найден по телефону {phone}', 'tail': tail}, ensure_ascii=False)}
                resp_k = requests.get(
                    f"{odata_url}/Catalog_Контрагенты(guid'{kontragent_key}')?$format=json",
                    auth=doc_auth, headers={'Accept': 'application/json'}, timeout=15, verify=ssl_verify
                )
                resp_cars = requests.get(
                    f"{odata_url}/Catalog_Автомобили?$format=json&$top=10&$filter=Владелец_Key eq guid'{kontragent_key}'",
                    auth=doc_auth, headers={'Accept': 'application/json'}, timeout=15, verify=ssl_verify
                )
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'kontragent_key': kontragent_key,
                        'kontragent': resp_k.json() if resp_k.ok else resp_k.text[:500],
                        'cars_status': resp_cars.status_code,
                        'cars': resp_cars.json().get('value', []) if resp_cars.ok else resp_cars.text[:500]
                    }, ensure_ascii=False)
                }

            elif action == 'calls':
                phone = query_params.get('phone', '')
                if not phone:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'success': False,
                            'error': 'Не указан номер телефона (параметр phone)'
                        })
                    }
                
                # Получаем историю звонков по номеру телефона
                filter_query = f"$filter=substringof('{phone}', НомерТелефона)"
                response = requests.get(
                    f"{odata_url}/InformationRegister_сфпИсторияЗвонков?{filter_query}&$orderby=Period desc&$top=50",
                    auth=auth,
                    headers={'Accept': 'application/json'},
                    timeout=30,
                    verify=ssl_verify
                )
                
                data = response.json()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': f'История звонков для {phone}',
                        'count': len(data.get('value', [])),
                        'calls': data.get('value', [])
                    }, ensure_ascii=False)
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))

            parts = []
            if body.get('service_type'):
                parts.append(f"Услуга: {body['service_type']}")
            if body.get('car_brand'):
                parts.append(f"Марка: {body['car_brand']}")
            if body.get('car_model'):
                parts.append(f"Модель: {body['car_model']}")
            if body.get('preferred_date'):
                parts.append(f"Желаемая дата: {body['preferred_date']}")
            if body.get('preferred_time'):
                parts.append(f"Желаемое время: {body['preferred_time']}")
            if body.get('customer_email'):
                parts.append(f"Email: {body['customer_email']}")
            if body.get('comment'):
                parts.append(f"Комментарий: {body['comment']}")
            description = "\n".join(parts)

            doc_data = {
                "Date": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                "ОбращениеККлиенту": body.get('customer_name', ''),
                "ПредставлениеТелефонаСтрокой": body.get('customer_phone', ''),
                "АдресЭлектроннойПочтыСтрокой": body.get('customer_email', ''),
                "ОписаниеПричиныОбращения": description,
                "Комментарий": description,
            }

            response = requests.post(
                f"{odata_url}/Document_ЗаявкаНаРемонт",
                auth=doc_auth,
                headers={
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                json=doc_data,
                timeout=15,
                verify=ssl_verify
            )

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': response.status_code in [200, 201],
                    'status_code': response.status_code,
                    'message': 'Заявка создана в 1С' if response.status_code in [200, 201] else f'Ошибка {response.status_code}',
                    'data': response.json() if response.ok else None,
                    'raw': response.text[:1000]
                }, ensure_ascii=False)
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except requests.exceptions.Timeout:
        return {
            'statusCode': 504,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Превышено время ожидания ответа от 1С'
            })
        }
    
    except requests.exceptions.ConnectionError:
        return {
            'statusCode': 503,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Не удалось подключиться к серверу 1С'
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }