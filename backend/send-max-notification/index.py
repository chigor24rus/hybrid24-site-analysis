import json
import os
import urllib.request
import urllib.parse
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    Отправляет уведомление о новой заявке в МАХ мессенджер
    """
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        customer_name = body.get('customer_name', 'Не указано')
        customer_phone = body.get('customer_phone', 'Не указано')
        customer_email = body.get('customer_email', 'Не указано')
        service_type = body.get('service_type', 'Не указано')
        car_brand = body.get('car_brand', 'Не указано')
        car_model = body.get('car_model', 'Не указано')
        preferred_date = body.get('preferred_date', 'Не указано')
        preferred_time = body.get('preferred_time', 'Не указано')
        comment = body.get('comment', 'Нет комментариев')
        
        bot_token = os.environ.get('MAX_BOT_TOKEN')
        chat_id = os.environ.get('MAX_CHAT_ID')
        
        # Подробное логирование для диагностики
        print(f'[MAX] bot_token exists: {bool(bot_token)}, length: {len(bot_token) if bot_token else 0}')
        print(f'[MAX] chat_id exists: {bool(chat_id)}, value: {chat_id}')
        
        if not bot_token or not chat_id:
            error_msg = f'MAX messenger settings not configured - token: {bool(bot_token)}, chat_id: {bool(chat_id)}'
            print(f'[MAX] ERROR: {error_msg}')
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': error_msg
                }),
                'isBase64Encoded': False
            }
        
        # Формат сообщения для МАХ мессенджера (поддерживает HTML разметку)
        message = f"""🔔 <b>Новая заявка с сайта Hybrid24.ru</b>

📅 <b>Дата и время:</b> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}

👤 <b>Имя:</b> {customer_name}
📱 <b>Телефон:</b> {customer_phone}
📧 <b>Email:</b> {customer_email}

🔧 <b>Тип услуги:</b> {service_type}
🚗 <b>Автомобиль:</b> {car_brand} {car_model}

📆 <b>Дата:</b> {preferred_date}
⏰ <b>Время:</b> {preferred_time}

💬 <b>Комментарий:</b>
{comment}"""
        
        # МАХ мессенджер использует Telegram Bot API
        url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        data = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        req = urllib.request.Request(
            url,
            data=urllib.parse.urlencode(data).encode('utf-8'),
            method='POST'
        )
        
        print(f'[MAX] Sending request to: {url[:50]}...')
        print(f'[MAX] Chat ID: {chat_id}')
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            print(f'[MAX] Response: {result}')
            
            if result.get('ok'):
                print('[MAX] ✓ Message sent successfully')
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'MAX notification sent'
                    }),
                    'isBase64Encoded': False
                }
            else:
                error_desc = result.get('description', 'MAX messenger API error')
                print(f'[MAX] ✗ API Error: {error_desc}')
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': error_desc
                    }),
                    'isBase64Encoded': False
                }
        
    except Exception as e:
        print(f'[MAX] ✗ Exception: {str(e)}')
        import traceback
        print(f'[MAX] Traceback: {traceback.format_exc()}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            }),
            'isBase64Encoded': False
        }