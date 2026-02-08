import json
import os
import requests

def handler(event: dict, context) -> dict:
    '''Планировщик синхронизации ZEON → FTP (запускается каждые 120 секунд)
    
    Триггер для автоматической синхронизации записей
    '''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    query_params = event.get('queryStringParameters', {}) or {}
    action = query_params.get('action', 'status')
    
    zeon_function_url = os.environ.get('ZEON_FUNCTION_URL')
    
    if not zeon_function_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'ZEON_FUNCTION_URL не настроен'
            })
        }
    
    if action == 'trigger':
        try:
            # Запускаем синхронизацию
            response = requests.get(zeon_function_url, timeout=300)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Синхронизация запущена',
                        'result': result
                    }, ensure_ascii=False)
                }
            else:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': f'Ошибка запуска синхронизации: {response.status_code}',
                        'details': response.text
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
    
    elif action == 'status':
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Планировщик ZEON работает',
                'zeon_function_url': zeon_function_url
            })
        }
    
    else:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Неизвестное действие. Используйте action=trigger или action=status'
            })
        }