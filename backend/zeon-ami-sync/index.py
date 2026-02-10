import json
import os
import psycopg2
import paramiko
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Синхронизация записей звонков ZEON через AMI с сохранением оригинальных имён файлов"""
    
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
    
    # Параметры из query string
    params = event.get('queryStringParameters') or {}
    dry_run = params.get('dry_run') == 'true'
    skip_ftp = params.get('skip_ftp') == 'true'
    date_filter = params.get('date')  # YYYY-MM-DD
    max_per_run = int(params.get('limit', '10'))
    
    # Получаем переменные окружения
    db_dsn = os.environ.get('DATABASE_URL') or os.environ.get('DATABASE_DSN')
    ami_host = os.environ.get('AMI_HOST')
    ami_port = int(os.environ.get('AMI_PORT', '5038'))
    ami_user = os.environ.get('AMI_USERNAME')
    ami_secret = os.environ.get('AMI_SECRET')
    ami_recordings_path = os.environ.get('AMI_RECORDINGS_PATH', '/var/spool/asterisk/monitor/')
    
    sftp_host = os.environ.get('SFTP_HOST')
    sftp_port = int(os.environ.get('SFTP_PORT', '22'))
    sftp_user = os.environ.get('SFTP_USER')
    sftp_password = os.environ.get('SFTP_PASSWORD')
    sftp_path = os.environ.get('SFTP_PATH', '/recordings')
    
    # Проверка обязательных параметров
    if not all([db_dsn, ami_host, ami_user, ami_secret]):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': 'Missing required AMI credentials'
            })
        }
    
    synced_count = 0
    skipped_count = 0
    errors = []
    
    try:
        # Подключаемся к БД
        # Убираем параметры из DSN если есть
        if '?' in db_dsn:
            db_dsn_clean = db_dsn.split('?')[0]
        else:
            db_dsn_clean = db_dsn
        
        conn = psycopg2.connect(db_dsn_clean)
        cursor = conn.cursor()
        
        # Подключаемся к серверу Asterisk через SSH
        # Для получения списка файлов записей напрямую с сервера
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(
            hostname=ami_host,
            port=22,  # SSH порт
            username=ami_user,
            password=ami_secret,
            timeout=10
        )
        sftp_source = ssh.open_sftp()
        
        # Получаем список файлов из папки с записями
        recordings_list = []
        try:
            files = sftp_source.listdir_attr(ami_recordings_path)
            for file_attr in files:
                if file_attr.filename.endswith(('.mp3', '.wav', '.gsm')):
                    # Фильтр по дате если указан
                    if date_filter:
                        file_date = datetime.fromtimestamp(file_attr.st_mtime).strftime('%Y-%m-%d')
                        if file_date != date_filter:
                            continue
                    
                    recordings_list.append({
                        'filename': file_attr.filename,
                        'size': file_attr.st_size,
                        'mtime': file_attr.st_mtime,
                        'path': ami_recordings_path + file_attr.filename
                    })
        except Exception as e:
            errors.append(f'Error listing recordings: {str(e)}')
            recordings_list = []
        
        # Сортируем по дате модификации (старые первыми)
        recordings_list.sort(key=lambda x: x['mtime'])
        
        # Ограничиваем количество
        recordings_list = recordings_list[:max_per_run]
        
        # Подключаемся к целевому SFTP (только если не dry_run и не skip_ftp)
        sftp_dest = None
        ssh_dest = None
        sftp_error = None
        
        if not dry_run and not skip_ftp:
            try:
                ssh_dest = paramiko.SSHClient()
                ssh_dest.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                ssh_dest.connect(
                    hostname=sftp_host,
                    port=sftp_port,
                    username=sftp_user,
                    password=sftp_password,
                    timeout=10
                )
                sftp_dest = ssh_dest.open_sftp()
                
                # Создаём директорию если не существует
                try:
                    sftp_dest.stat(sftp_path)
                except FileNotFoundError:
                    parts = sftp_path.strip('/').split('/')
                    current = ''
                    for part in parts:
                        current += f'/{part}'
                        try:
                            sftp_dest.stat(current)
                        except FileNotFoundError:
                            sftp_dest.mkdir(current)
            except Exception as e:
                sftp_error = f'SFTP connection failed: {str(e)}'
                sftp_dest = None
                if ssh_dest:
                    ssh_dest.close()
        elif skip_ftp:
            sftp_error = 'SFTP skipped (skip_ftp=true)'
        
        # Обрабатываем каждую запись
        for recording in recordings_list:
            if synced_count >= max_per_run:
                break
            
            filename = recording['filename']
            file_size = recording['size']
            file_path = recording['path']
            
            # Проверяем, не синхронизирована ли уже эта запись по имени файла
            cursor.execute(
                'SELECT id FROM zeon_recordings_sync WHERE file_name = %s',
                (filename,)
            )
            
            if cursor.fetchone():
                skipped_count += 1
                continue
            
            try:
                # Извлекаем данные из имени файла (если формат стандартный)
                # Пример: 20250115_143022_79231234567.mp3
                recording_id = filename  # Используем имя файла как ID
                call_date_str = datetime.fromtimestamp(recording['mtime']).strftime('%Y-%m-%d %H:%M:%S')
                
                # Пытаемся извлечь телефон из имени файла
                phone_number = ''
                if '_' in filename:
                    parts = filename.replace('.mp3', '').replace('.wav', '').split('_')
                    if len(parts) >= 3:
                        phone_number = parts[2]
                
                # Копируем файл на целевой SFTP
                if not dry_run and sftp_dest:
                    remote_path = f'{sftp_path}/{filename}'
                    
                    # Скачиваем во временный буфер и загружаем
                    with sftp_source.file(file_path, 'rb') as source_file:
                        sftp_dest.putfo(source_file, remote_path)
                    
                    actual_file_size = file_size
                else:
                    actual_file_size = file_size if not dry_run else 0
                
                # Записываем в БД
                if not dry_run:
                    cursor.execute(
                        '''INSERT INTO zeon_recordings_sync 
                           (recording_id, call_id, phone_number, duration, file_name, file_size, ftp_path, call_date)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)''',
                        (recording_id, '', phone_number, 0, filename, actual_file_size, 
                         f'{sftp_path}/{filename}', call_date_str)
                    )
                    conn.commit()
                
                synced_count += 1
                
            except Exception as e:
                error_msg = f'Error processing {filename}: {str(e)}'
                errors.append(error_msg)
                continue
        
        # Закрываем соединения
        if sftp_source:
            sftp_source.close()
        if ssh:
            ssh.close()
        if sftp_dest:
            sftp_dest.close()
        if ssh_dest:
            ssh_dest.close()
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'synced': synced_count,
                'skipped': skipped_count,
                'total_found': len(recordings_list),
                'errors': errors,
                'sftp_status': sftp_error or 'Connected',
                'method': 'AMI',
                'dry_run': dry_run
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'synced': synced_count,
                'errors': errors
            })
        }