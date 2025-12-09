import json
import os
import urllib.request
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Автоматическая синхронизация отзывов с 2ГИС по расписанию
    Вызывается ежедневно для обновления отзывов в базе
    '''
    
    dgis_function_url = 'https://functions.poehali.dev/25254b30-6bfe-4a37-aa27-58095863d1df'
    
    try:
        req = urllib.request.Request(
            dgis_function_url,
            method='POST',
            headers={
                'Content-Type': 'application/json'
            },
            data=b''
        )
        
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            result = json.loads(error_body) if error_body else {}
        
        if result.get('success'):
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({
                    'success': True,
                    'message': 'Синхронизация завершена',
                    'added': result.get('added', 0),
                    'updated': result.get('updated', 0),
                    'visible': result.get('visible', 0),
                    'hidden': result.get('hidden', 0),
                    'total': result.get('total', 0)
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({
                    'success': False,
                    'error': result.get('error', 'Ошибка синхронизации')
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }