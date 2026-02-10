import json
import os
import psycopg2
import paramiko

def handler(event: dict, context) -> dict:
    '''Удаление записей звонков из БД и SFTP за определенный период
    
    Позволяет удалить записи за выбранный временной интервал
    '''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Метод не поддерживается. Используйте POST'
            })
        }
    
    # Получаем параметры
    db_dsn = os.environ.get('DATABASE_URL') or os.environ.get('DATABASE_DSN')
    sftp_host = os.environ.get('SFTP_HOST')
    sftp_port = int(os.environ.get('SFTP_PORT', '22'))
    sftp_user = os.environ.get('SFTP_USER')
    sftp_password = os.environ.get('SFTP_PASSWORD')
    sftp_path = '/home/u524567/Zeon/rec'
    
    if not db_dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'DATABASE_URL не настроен'
            })
        }
    
    try:
        # Парсим body
        body_data = event.get('body', '{}')
        if isinstance(body_data, dict):
            body = body_data
        elif isinstance(body_data, str):
            body = json.loads(body_data) if body_data.strip() else {}
        else:
            body = {}
        
        date_from = body.get('date_from') if isinstance(body, dict) else None
        date_to = body.get('date_to') if isinstance(body, dict) else None
        delete_from_sftp = body.get('delete_from_sftp', False) if isinstance(body, dict) else False
        
        if not date_from or not date_to:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Требуются параметры date_from и date_to'
                })
            }
        
        conn = psycopg2.connect(db_dsn)
        cursor = conn.cursor()
        
        # Получаем записи для удаления
        cursor.execute('''
            SELECT file_name, ftp_path
            FROM zeon_recordings_sync
            WHERE call_date >= %s AND call_date <= %s
        ''', (f'{date_from} 00:00:00', f'{date_to} 23:59:59'))
        
        files_to_delete = cursor.fetchall()
        deleted_count = len(files_to_delete)
        sftp_deleted = 0
        sftp_errors = []
        
        # Удаляем файлы с SFTP если запрошено
        if delete_from_sftp and sftp_host and sftp_user and sftp_password:
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
                
                for file_name, ftp_path_full in files_to_delete:
                    try:
                        # Удаляем файл
                        remote_path = f'{sftp_path}/{file_name}'
                        sftp.remove(remote_path)
                        sftp_deleted += 1
                    except Exception as e:
                        sftp_errors.append(f'{file_name}: {str(e)}')
                
                sftp.close()
                ssh.close()
            except Exception as e:
                sftp_errors.append(f'SFTP connection error: {str(e)}')
        
        # Удаляем записи из БД
        cursor.execute('''
            DELETE FROM zeon_recordings_sync
            WHERE call_date >= %s AND call_date <= %s
        ''', (f'{date_from} 00:00:00', f'{date_to} 23:59:59'))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        result = {
            'success': True,
            'deleted_from_db': deleted_count,
            'message': f'Удалено записей из БД: {deleted_count}'
        }
        
        if delete_from_sftp:
            result['deleted_from_sftp'] = sftp_deleted
            result['message'] += f', удалено файлов с SFTP: {sftp_deleted}'
            if sftp_errors:
                result['sftp_errors'] = sftp_errors
        
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