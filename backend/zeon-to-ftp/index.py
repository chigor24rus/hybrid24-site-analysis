import json
import os
import requests
import psycopg2
import hashlib
from urllib.parse import urlencode
import paramiko
from datetime import datetime
from io import BytesIO

def handler(event: dict, context) -> dict:
    '''Автоматический перенос записей звонков из ZEON API на FTP-сервер
    
    Синхронизирует записи звонков из ZEON на FTP каждые 120 секунд
    '''
    
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters', {}) or {}
    dry_run = query_params.get('dry_run') == 'true'
    skip_ftp = query_params.get('skip_ftp') == 'true'  # Пропустить FTP загрузку
    
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
    
    # Получаем параметры из секретов
    zeon_api_url = os.environ.get('ZEON_API_URL')
    zeon_api_key = os.environ.get('ZEON_API_KEY')
    sftp_host = os.environ.get('SFTP_HOST')
    sftp_port = int(os.environ.get('SFTP_PORT', '22'))
    sftp_user = os.environ.get('SFTP_USER')
    sftp_password = os.environ.get('SFTP_PASSWORD')
    sftp_path = os.environ.get('SFTP_PATH', '/records')
    db_dsn = os.environ.get('DATABASE_URL') or os.environ.get('DATABASE_DSN')
    
    missing_secrets = []
    if not zeon_api_url:
        missing_secrets.append('ZEON_API_URL')
    if not zeon_api_key:
        missing_secrets.append('ZEON_API_KEY')
    if not sftp_host:
        missing_secrets.append('SFTP_HOST')
    if not sftp_user:
        missing_secrets.append('SFTP_USER')
    if not sftp_password:
        missing_secrets.append('SFTP_PASSWORD')
    if not db_dsn:
        missing_secrets.append('DATABASE_URL')
    
    if missing_secrets:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': f'Не настроены секреты: {", ".join(missing_secrets)}'
            })
        }
    
    synced_count = 0
    skipped_count = 0
    no_recording_count = 0
    errors = []
    max_per_run = 10  # Максимум файлов за один запуск
    
    try:
        # Подключаемся к БД
        conn = psycopg2.connect(db_dsn)
        cursor = conn.cursor()
        
        # Создаём таблицу если не существует
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS zeon_recordings_sync (
                id SERIAL PRIMARY KEY,
                recording_id VARCHAR(255) UNIQUE NOT NULL,
                call_id VARCHAR(255),
                phone_number VARCHAR(50),
                duration INTEGER,
                file_name VARCHAR(500),
                file_size INTEGER,
                synced_at TIMESTAMP DEFAULT NOW(),
                ftp_path TEXT
            )
        ''')
        conn.commit()
        
        # Получаем список звонков из ZEON API
        from datetime import datetime, timedelta
        
        api_endpoint = zeon_api_url.rstrip('/') + '/zeon/api/v2/start.php'
        
        # Сначала узнаем какие методы доступны
        from urllib.parse import quote
        list_params = {
            'method': 'get-method-list'
        }
        # MD5 авторизация от URL-encoded строки (RFC3986)
        sorted_list_params = sorted(list_params.items())
        query_string = urlencode(sorted_list_params, quote_via=quote)
        hash_string = query_string + zeon_api_key
        list_params['hash'] = hashlib.md5(hash_string.encode()).hexdigest()
        
        list_response = requests.post(api_endpoint, data=list_params, timeout=10)
        available_methods = []
        if list_response.status_code == 200:
            list_data = list_response.json()
            if list_data.get('result') == 1:
                available_methods = list_data.get('data', [])
        
        # Получаем звонки за определенный период
        from datetime import datetime, timedelta
        
        # Если передана дата, синхронизируем записи за эту дату
        sync_date = query_params.get('date')
        if sync_date:
            try:
                # Парсим дату в формате YYYY-MM-DD
                target_date = datetime.strptime(sync_date, '%Y-%m-%d')
                start_date = target_date.replace(hour=0, minute=0, second=0)
                end_date = target_date.replace(hour=23, minute=59, second=59)
            except ValueError:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': 'Неверный формат даты. Используйте YYYY-MM-DD'
                    })
                }
        else:
            # По умолчанию за последние 1 день (7 дней в production)
            end_date = datetime.now()
            days_back = 1 if dry_run else 7
            start_date = end_date - timedelta(days=days_back)
        
        # ВНИМАНИЕ: Порядок параметров ВАЖЕН для hash!
        # Используем OrderedDict и точно такой же порядок, как в примере поддержки
        from collections import OrderedDict
        
        params = OrderedDict([
            ('topic', 'base'),
            ('method', 'get-calls'),
            ('start', start_date.strftime('%Y-%m-%d %H:%M:%S')),
            ('end', end_date.strftime('%Y-%m-%d %H:%M:%S'))
        ])
        
        # MD5 авторизация от URL-encoded строки (RFC3986)
        # urlencode с quote_via=quote кодирует пробелы как %20 (не +)
        from urllib.parse import quote
        query_string = urlencode(params, quote_via=quote)
        # Hash считается от URL-encoded строки + API key
        hash_string = query_string + zeon_api_key
        hash_value = hashlib.md5(hash_string.encode()).hexdigest()
        params['hash'] = hash_value
        
        # DEBUG: Логируем параметры для отладки
        debug_info = {
            'query_string': query_string,
            'hash': hash_value,
            'start': params['start'],
            'end': params['end']
        }
        
        recordings_response = requests.post(
            api_endpoint,
            data=params,
            timeout=30
        )
        
        if recordings_response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': f'Ошибка получения списка записей: {recordings_response.status_code}',
                    'details': recordings_response.text
                })
            }
        
        try:
            recordings = recordings_response.json()
        except json.JSONDecodeError as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'ZEON API вернул не JSON',
                    'details': f'Ответ: {recordings_response.text[:500]}'
                })
            }
        
        # Логируем что вернул ZEON
        if recordings.get('result') != 1:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': f'ZEON API error: {recordings.get("text", "unknown")}',
                    'api_response': recordings,
                    'available_methods': available_methods,
                    'debug': debug_info
                }, ensure_ascii=False)
            }
        
        # Подключаемся к SFTP (только если не dry_run и не skip_ftp)
        sftp = None
        ssh = None
        sftp_error = None
        if not dry_run and not skip_ftp:
            try:
                ssh = paramiko.SSHClient()
                ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                ssh.connect(
                    hostname=sftp_host,
                    port=sftp_port,
                    username=sftp_user,
                    password=sftp_password,
                    timeout=10
                )
                sftp = ssh.open_sftp()
                
                # Создаём директорию если не существует
                try:
                    sftp.stat(sftp_path)
                except FileNotFoundError:
                    # Создаём все промежуточные директории
                    parts = sftp_path.strip('/').split('/')
                    current = ''
                    for part in parts:
                        current += f'/{part}'
                        try:
                            sftp.stat(current)
                        except FileNotFoundError:
                            sftp.mkdir(current)
            except Exception as e:
                sftp_error = f'SFTP connection failed: {str(e)}'
                sftp = None
                if ssh:
                    ssh.close()
        elif skip_ftp:
            sftp_error = 'SFTP skipped (skip_ftp=true)'
        
        # Обрабатываем каждый звонок с записью (с лимитом)
        for call in recordings.get('data', []):
            # Останавливаемся если достигли лимита
            if synced_count >= max_per_run:
                break
            
            link = call.get('link')  # ID файла записи
            if not link:
                no_recording_count += 1
                continue  # Пропускаем звонки без записи
            
            recording_id = str(link)
            call_id = call.get('linkedid', '')
            phone_number = call.get('client', '')
            call_date_str = call.get('calldate', '')  # Дата звонка из ZEON
            
            # talktime может быть строкой "00:00:05" или числом
            talktime_raw = call.get('talktime', '0')
            if isinstance(talktime_raw, str) and ':' in talktime_raw:
                # Формат HH:MM:SS → секунды
                parts = talktime_raw.split(':')
                duration = int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
            else:
                duration = int(talktime_raw)
            
            # Проверяем, не синхронизирована ли уже эта запись
            cursor.execute(
                'SELECT id FROM zeon_recordings_sync WHERE recording_id = %s',
                (recording_id,)
            )
            
            if cursor.fetchone():
                skipped_count += 1
                continue
            
            try:
                # Формируем имя файла с датой звонка из ZEON
                if call_date_str:
                    try:
                        # calldate в формате "YYYY-MM-DD HH:MM:SS"
                        call_datetime = datetime.strptime(call_date_str, '%Y-%m-%d %H:%M:%S')
                        timestamp = call_datetime.strftime('%Y%m%d_%H%M%S')
                    except ValueError:
                        # Если формат неожиданный, используем текущее время
                        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                else:
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                
                file_name = f'{timestamp}_{call_id}_{phone_number}.mp3'
                file_size = 0
                
                # Скачиваем и загружаем только если не dry_run и SFTP доступен
                if not dry_run and sftp:
                    # Скачиваем файл записи через get-mp3
                    # ВНИМАНИЕ: Порядок параметров ВАЖЕН для hash!
                    from collections import OrderedDict
                    file_params = OrderedDict([
                        ('link', link),
                        ('method', 'get-mp3'),
                        ('topic', 'base')
                    ])
                    
                    # MD5 авторизация от URL-encoded строки (RFC3986)
                    from urllib.parse import quote
                    query_string = urlencode(file_params, quote_via=quote)
                    hash_string = query_string + zeon_api_key
                    hash_value = hashlib.md5(hash_string.encode()).hexdigest()
                    file_params['hash'] = hash_value
                    
                    file_response = requests.post(
                        api_endpoint,
                        data=file_params,
                        timeout=120,
                        stream=True
                    )
                    
                    if file_response.status_code != 200:
                        errors.append(f'Ошибка скачивания {recording_id}: {file_response.status_code}')
                        continue
                    
                    # Загружаем на SFTP
                    file_content = file_response.content
                    file_size = len(file_content)
                    
                    remote_path = f'{sftp_path}/{file_name}'
                    sftp.putfo(BytesIO(file_content), remote_path)
                
                # Сохраняем информацию о синхронизации в БД
                cursor.execute('''
                    INSERT INTO zeon_recordings_sync 
                    (recording_id, call_id, phone_number, duration, file_name, file_size, ftp_path)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                ''', (recording_id, call_id, phone_number, duration, file_name, file_size, f'{sftp_path}/{file_name}'))
                conn.commit()
                
                synced_count += 1
                
            except Exception as e:
                errors.append(f'Ошибка обработки {recording_id}: {str(e)}')
                continue
        
        if sftp:
            sftp.close()
        if ssh:
            ssh.close()
        cursor.close()
        conn.close()
        
        total_calls = len(recordings.get('data', []))
        calls_with_recordings = sum(1 for call in recordings.get('data', []) if call.get('link'))
        
        result = {
            'success': True,
            'synced': synced_count,
            'skipped': skipped_count,
            'no_recording': no_recording_count,
            'errors': errors,
            'total_calls': total_calls,
            'calls_with_recordings': calls_with_recordings,
            'message': f'Обработано {synced_count} из {calls_with_recordings} записей. Пропущено: {skipped_count} (уже синхронизированы), {no_recording_count} (без записи)'
        }
        
        if sftp_error:
            result['sftp_warning'] = sftp_error
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result, ensure_ascii=False)
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