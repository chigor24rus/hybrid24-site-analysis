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

💬 <b>Комментарий:</b> {comment}"""
        
        # МАХ мессенджер использует свой API platform-api.max.ru
        # Получатель указывается в query параметрах (user_id или chat_id)
        
        # Парсим chat_id для МАХ API
        # Формат может быть: "id245900919213_1_bot" или просто число "123456789"
        print(f'[MAX] Parsing chat_id: {chat_id}')
        
        # Если chat_id - это просто число, используем как chat_id
        if chat_id.isdigit():
            query_params = f'chat_id={chat_id}'
            print(f'[MAX] Using numeric chat_id')
        # Если формат "id{число}_..." - пробуем извлечь user_id
        elif chat_id.startswith('id'):
            try:
                # Извлекаем все числа после "id" и до первого "_"
                user_id_str = chat_id.split('_')[0].replace('id', '')
                
                # Проверяем что получилось число
                if user_id_str.isdigit():
                    query_params = f'user_id={user_id_str}'
                    print(f'[MAX] Extracted user_id: {user_id_str}')
                else:
                    # Если не число - используем весь chat_id
                    query_params = f'chat_id={chat_id}'
                    print(f'[MAX] Failed to extract user_id, using original chat_id')
            except Exception as e:
                query_params = f'chat_id={chat_id}'
                print(f'[MAX] Error parsing chat_id: {e}, using original')
        else:
            # Неизвестный формат - используем как chat_id
            query_params = f'chat_id={chat_id}'
            print(f'[MAX] Unknown format, using as chat_id')
        
        url = f'https://platform-api.max.ru/messages?{query_params}'
        
        # Формат body для МАХ API (без chat_id - он в query параметрах)
        payload = {
            'text': message,
            'format': 'html'
        }
        
        headers_dict = {
            'Authorization': bot_token,
            'Content-Type': 'application/json'
        }
        
        print(f'[MAX] Sending request to: {url}')
        print(f'[MAX] Original chat_id: {chat_id}')
        print(f'[MAX] Query params: {query_params}')
        print(f'[MAX] Token length: {len(bot_token)}')
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers_dict,
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            response_text = response.read().decode('utf-8')
            result = json.loads(response_text) if response_text else {}
            
            print(f'[MAX] Response status: {response.status}')
            print(f'[MAX] Response: {result}')
            
            if response.status == 200 or response.status == 201:
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
                error_desc = result.get('error', result.get('message', 'MAX messenger API error'))
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
        
    except urllib.error.HTTPError as e:
        # Читаем детальное сообщение об ошибке от API
        error_body = e.read().decode('utf-8') if e.fp else ''
        print(f'[MAX] ✗ HTTP Error {e.code}: {e.reason}')
        print(f'[MAX] Error details: {error_body}')
        
        try:
            error_json = json.loads(error_body) if error_body else {}
            error_message = error_json.get('error', error_json.get('message', f'HTTP {e.code}: {e.reason}'))
        except:
            error_message = f'HTTP {e.code}: {e.reason} - {error_body}'
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': error_message
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