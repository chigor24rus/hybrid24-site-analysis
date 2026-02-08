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
    
    Синхронизирует записи звонков каждые 120 секунд
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
    
    if not all([zeon_api_url, zeon_api_key, ftp_host, ftp_user, ftp_password, db_dsn]):
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Не настроены параметры подключения (ZEON_API_URL, ZEON_API_KEY, FTP_HOST, FTP_USER, FTP_PASSWORD, DATABASE_URL)'
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
        
        # Получаем список записей из ZEON API
        # Формируем параметры запроса
        params = {
            'topic': 'rec',
            'method': 'recordings'
        }
        
        # Создаём хеш для авторизации
        query_string = urlencode(sorted(params.items()))
        hash_string = query_string + zeon_api_key
        params['hash'] = hashlib.md5(hash_string.encode()).hexdigest()
        
        # Получаем список записей
        api_endpoint = zeon_api_url.rstrip('/') + '/api/v2/start.php'
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
        
        # Обрабатываем каждую запись
        for recording in recordings.get('data', []):
            recording_id = recording.get('id')
            call_id = recording.get('call_id')
            phone_number = recording.get('phone_number')
            duration = recording.get('duration', 0)
            
            # Проверяем, не синхронизирована ли уже эта запись
            cursor.execute(
                'SELECT id FROM zeon_recordings_sync WHERE recording_id = %s',
                (recording_id,)
            )
            
            if cursor.fetchone():
                skipped_count += 1
                continue
            
            try:
                # Скачиваем файл записи
                file_response = requests.get(
                    f'{zeon_api_url}/{recording_id}/file',
                    headers=headers,
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
                'total_processed': len(recordings.get('data', []))
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