import json
import os
import urllib.request
import urllib.parse
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    Отправляет уведомление о новой заявке в Telegram
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
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        
        if not bot_token or not chat_id:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Telegram settings not configured'
                }),
                'isBase64Encoded': False
            }
        
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
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if result.get('ok'):
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Telegram notification sent'
                    }),
                    'isBase64Encoded': False
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
                        'error': result.get('description', 'Telegram API error')
                    }),
                    'isBase64Encoded': False
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
            }),
            'isBase64Encoded': False
        }
