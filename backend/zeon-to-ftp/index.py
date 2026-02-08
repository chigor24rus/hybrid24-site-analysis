import json
import os
import requests
import psycopg2
import hashlib
from urllib.parse import urlencode
from ftplib import FTP
from datetime import datetime
from io import BytesIO

def handler(event: dict, context) -> dict:
    '''Автоматический перенос записей звонков из ZEON API на FTP-сервер
    
    Синхронизирует записи звонков из ZEON на FTP каждые 120 секунд
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
    
    # Получаем параметры из секретов
    zeon_api_url = os.environ.get('ZEON_API_URL')
    zeon_api_key = os.environ.get('ZEON_API_KEY')
    ftp_host = os.environ.get('FTP_HOST')
    ftp_user = os.environ.get('FTP_USER')
    ftp_password = os.environ.get('FTP_PASSWORD')
    ftp_path = os.environ.get('FTP_PATH', '/')
    db_dsn = os.environ.get('DATABASE_URL') or os.environ.get('DATABASE_DSN')
    
    missing_secrets = []
    if not zeon_api_url:
        missing_secrets.append('ZEON_API_URL')
    if not zeon_api_key:
        missing_secrets.append('ZEON_API_KEY')
    if not ftp_host:
        missing_secrets.append('FTP_HOST')
    if not ftp_user:
        missing_secrets.append('FTP_USER')
    if not ftp_password:
        missing_secrets.append('FTP_PASSWORD')
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
    errors = []
    
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
        
        # Сначала получаем последний ID звонка
        last_id_params = {
            'topic': 'base',
            'method': 'get-calls-last-id'
        }
        
        last_id_response = requests.post(
            api_endpoint, 
            data=last_id_params,
            headers={'Authorization': f'Bearer {zeon_api_key}'},
            timeout=10
        )
        
        if last_id_response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': f'Ошибка получения last-id: {last_id_response.status_code}',
                    'details': last_id_response.text[:500]
                })
            }
        
        last_id_data = last_id_response.json()
        if last_id_data.get('result') != 1:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Ошибка получения last-id',
                    'api_response': last_id_data
                }, ensure_ascii=False)
            }
        
        last_id = last_id_data.get('id', 0)
        
        # Получаем звонки, начиная с ID минус 1000 (примерно последние ~неделя)
        start_id = max(1, last_id - 1000)
        
        params = {
            'topic': 'base',
            'method': 'get-calls',
            'id': str(start_id),
            'limit': '1000',
            'disposition': 'any'
        }
        
        # Получаем список записей с Bearer авторизацией
        recordings_response = requests.post(
            api_endpoint,
            data=params,
            headers={'Authorization': f'Bearer {zeon_api_key}'},
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
                    'api_response': recordings
                }, ensure_ascii=False)
            }
        
        # Подключаемся к FTP
        ftp = FTP(timeout=30)
        ftp.connect(ftp_host, 21)
        ftp.login(ftp_user, ftp_password)
        ftp.set_pasv(True)
        
        # Переходим в нужную директорию
        try:
            ftp.cwd(ftp_path)
        except:
            # Создаём директорию если не существует
            ftp.mkd(ftp_path)
            ftp.cwd(ftp_path)
        
        # Обрабатываем каждый звонок с записью
        for call in recordings.get('data', []):
            link = call.get('link')  # ID файла записи
            if not link:
                continue  # Пропускаем звонки без записи
            
            recording_id = str(link)
            call_id = call.get('linkedid', '')
            phone_number = call.get('client', '')
            duration = int(call.get('talktime', 0))
            
            # Проверяем, не синхронизирована ли уже эта запись
            cursor.execute(
                'SELECT id FROM zeon_recordings_sync WHERE recording_id = %s',
                (recording_id,)
            )
            
            if cursor.fetchone():
                skipped_count += 1
                continue
            
            try:
                # Скачиваем файл записи через get-mp3
                file_params = {
                    'topic': 'base',
                    'method': 'get-mp3',
                    'link': link
                }
                
                file_response = requests.post(
                    api_endpoint,
                    data=file_params,
                    headers={'Authorization': f'Bearer {zeon_api_key}'},
                    timeout=120,
                    stream=True
                )
                
                if file_response.status_code != 200:
                    errors.append(f'Ошибка скачивания {recording_id}: {file_response.status_code}')
                    continue
                
                # Формируем имя файла
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                file_name = f'{timestamp}_{call_id}_{phone_number}.mp3'
                
                # Загружаем на FTP
                file_content = file_response.content
                file_size = len(file_content)
                
                ftp.storbinary(f'STOR {file_name}', BytesIO(file_content))
                
                # Сохраняем информацию о синхронизации в БД
                cursor.execute('''
                    INSERT INTO zeon_recordings_sync 
                    (recording_id, call_id, phone_number, duration, file_name, file_size, ftp_path)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                ''', (recording_id, call_id, phone_number, duration, file_name, file_size, f'{ftp_path}/{file_name}'))
                conn.commit()
                
                synced_count += 1
                
            except Exception as e:
                errors.append(f'Ошибка обработки {recording_id}: {str(e)}')
                continue
        
        ftp.quit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'synced': synced_count,
                'skipped': skipped_count,
                'errors': errors,
                'total_calls': len(recordings.get('data', [])),
                'calls_with_recordings': sum(1 for call in recordings.get('data', []) if call.get('link')),
                'id_range': f"{start_id} — {last_id}"
            }, ensure_ascii=False)
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