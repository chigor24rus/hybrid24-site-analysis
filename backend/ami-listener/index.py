import json
import os
import socket
import psycopg2
import re
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Слушатель AMI событий для сохранения маппинга linkedid → оригинальное имя файла
    
    Подключается к Asterisk AMI, слушает события MixMonitor и сохраняет
    связку linkedid и оригинального имени файла записи в БД.
    
    Параметры:
    - action=listen: Запуск прослушивания AMI (по умолчанию, ограничен таймаутом Cloud Function)
    - action=test: Тестовое подключение к AMI
    - timeout=60: Время прослушивания в секундах (макс 120 для Cloud Functions)
    """
    
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
    
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'listen')
    listen_timeout = int(params.get('timeout', '60'))  # По умолчанию 60 секунд
    
    # Получаем credentials
    db_dsn = os.environ.get('DATABASE_URL') or os.environ.get('DATABASE_DSN')
    ami_host = os.environ.get('AMI_HOST')
    ami_port = int(os.environ.get('AMI_PORT', '5038'))
    ami_user = os.environ.get('AMI_USERNAME')
    ami_secret = os.environ.get('AMI_SECRET')
    
    if not all([db_dsn, ami_host, ami_user, ami_secret]):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': 'Missing AMI credentials'
            })
        }
    
    # Тестовое подключение
    if action == 'test':
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(10)
            sock.connect((ami_host, ami_port))
            
            # Читаем приветствие
            greeting = sock.recv(1024).decode('utf-8')
            
            # Логин
            login_cmd = (
                f"Action: Login\r\n"
                f"Username: {ami_user}\r\n"
                f"Secret: {ami_secret}\r\n"
                f"\r\n"
            )
            sock.sendall(login_cmd.encode('utf-8'))
            
            # Читаем ответ
            response = sock.recv(4096).decode('utf-8')
            
            sock.close()
            
            # Проверяем успех авторизации
            is_success = 'Response: Success' in response
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': is_success,
                    'message': 'AMI login successful' if is_success else 'AMI login failed',
                    'greeting': greeting[:200],
                    'login_response': response[:500],
                    'debug_info': {
                        'ami_host': ami_host,
                        'ami_port': ami_port,
                        'ami_user': ami_user,
                        'ami_secret_length': len(ami_secret) if ami_secret else 0
                    }
                })
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': f'AMI connection failed: {str(e)}'
                })
            }
    
    # Основной режим: прослушивание событий
    saved_count = 0
    errors = []
    events_received = 0
    
    try:
        # Подключаемся к БД
        conn = psycopg2.connect(db_dsn)
        cursor = conn.cursor()
        
        # Подключаемся к AMI
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(listen_timeout)
        sock.connect((ami_host, ami_port))
        
        # Читаем приветствие
        greeting = sock.recv(1024).decode('utf-8')
        
        # Логин
        login_cmd = (
            f"Action: Login\r\n"
            f"Username: {ami_user}\r\n"
            f"Secret: {ami_secret}\r\n"
            f"\r\n"
        )
        sock.sendall(login_cmd.encode('utf-8'))
        
        # Читаем ответ на логин
        login_response = sock.recv(4096).decode('utf-8')
        
        if 'Success' not in login_response:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False,
                    'error': 'AMI login failed',
                    'response': login_response
                })
            }
        
        # Буфер для накопления данных
        buffer = ""
        
        # Слушаем события
        while True:
            try:
                data = sock.recv(4096).decode('utf-8', errors='ignore')
                if not data:
                    break
                
                buffer += data
                
                # Обрабатываем события (разделены двойным переводом строки)
                while '\r\n\r\n' in buffer:
                    event_text, buffer = buffer.split('\r\n\r\n', 1)
                    events_received += 1
                    
                    # Парсим событие
                    event = {}
                    for line in event_text.split('\r\n'):
                        if ':' in line:
                            key, value = line.split(':', 1)
                            event[key.strip()] = value.strip()
                    
                    # Ищем события MixMonitor (начало записи)
                    # или UserEvent с информацией о файле записи
                    if event.get('Event') in ['MixMonitorStart', 'MixMonitorStop', 'UserEvent']:
                        linkedid = event.get('Linkedid')
                        
                        # Извлекаем имя файла из разных полей
                        filename = (
                            event.get('MixMonitorFilename') or 
                            event.get('Filename') or 
                            event.get('File') or
                            ''
                        )
                        
                        # Если есть linkedid и filename
                        if linkedid and filename:
                            # Извлекаем только имя файла без пути
                            if '/' in filename:
                                filename = filename.split('/')[-1]
                            
                            # Убираем расширение если есть дубликаты
                            filename = re.sub(r'\.(wav|WAV|gsm|GSM)$', '', filename)
                            
                            # Добавляем расширение .wav если нет
                            if not filename.endswith(('.wav', '.mp3', '.gsm')):
                                filename += '.wav'
                            
                            try:
                                # Сохраняем в БД (игнорируем дубликаты)
                                cursor.execute('''
                                    INSERT INTO call_recordings_mapping 
                                    (linkedid, original_filename, channel, call_start)
                                    VALUES (%s, %s, %s, NOW())
                                    ON CONFLICT (linkedid) DO NOTHING
                                ''', (linkedid, filename, event.get('Channel', '')))
                                conn.commit()
                                
                                if cursor.rowcount > 0:
                                    saved_count += 1
                                    
                            except Exception as e:
                                errors.append(f'DB error for {linkedid}: {str(e)}')
                                conn.rollback()
                
            except socket.timeout:
                # Таймаут - это нормально, завершаем прослушивание
                break
            except Exception as e:
                errors.append(f'Socket error: {str(e)}')
                break
        
        # Закрываем соединения
        sock.close()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'saved': saved_count,
                'events_received': events_received,
                'listen_duration': listen_timeout,
                'errors': errors,
                'message': f'Saved {saved_count} mappings from {events_received} events'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'saved': saved_count,
                'events_received': events_received,
                'errors': errors
            })
        }