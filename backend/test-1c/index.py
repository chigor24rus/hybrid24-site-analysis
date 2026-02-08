import json
import os
import requests
from requests.auth import HTTPBasicAuth

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
    
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', 'ping')
        
        if method == 'GET':
            if action == 'ping':
                response = requests.get(
                    odata_url,
                    auth=auth,
                    timeout=10,
                    headers={'Accept': 'application/json'}
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
                    timeout=10
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
                    timeout=10
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
                    timeout=30
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
            
            order_data = {
                'CustomerName': body.get('customer_name'),
                'CustomerPhone': body.get('customer_phone'),
                'CustomerEmail': body.get('customer_email'),
                'ServiceType': body.get('service_type'),
                'CarBrand': body.get('car_brand'),
                'CarModel': body.get('car_model'),
                'PreferredDate': body.get('preferred_date'),
                'PreferredTime': body.get('preferred_time'),
                'Comment': body.get('comment')
            }
            
            response = requests.post(
                f"{odata_url}/Document_Orders",
                auth=auth,
                headers={
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                json=order_data,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Заказ успешно создан в 1С',
                        'order': response.json()
                    })
                }
            else:
                return {
                    'statusCode': response.status_code,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': f'Ошибка создания заказа: {response.status_code}',
                        'details': response.text
                    })
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