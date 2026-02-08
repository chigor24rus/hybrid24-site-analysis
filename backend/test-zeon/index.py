import json
import os
import requests
import psycopg2
from ftplib import FTP

def handler(event: dict, context) -> dict:
    '''Диагностика подключений ZEON: API, FTP, БД'''
    
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
    
    results = {
        'zeon_api': {'status': 'unchecked', 'message': ''},
        'ftp': {'status': 'unchecked', 'message': ''},
        'database': {'status': 'unchecked', 'message': ''},
        'secrets': {}
    }
    
    zeon_api_url = os.environ.get('ZEON_API_URL')
    zeon_api_key = os.environ.get('ZEON_API_KEY')
    ftp_host = os.environ.get('FTP_HOST')
    ftp_user = os.environ.get('FTP_USER')
    ftp_password = os.environ.get('FTP_PASSWORD')
    ftp_path = os.environ.get('FTP_PATH', '/')
    db_dsn = os.environ.get('DATABASE_URL') or os.environ.get('DATABASE_DSN')
    
    results['secrets'] = {
        'ZEON_API_URL': 'set' if zeon_api_url else 'missing',
        'ZEON_API_KEY': 'set' if zeon_api_key else 'missing',
        'FTP_HOST': 'set' if ftp_host else 'missing',
        'FTP_USER': 'set' if ftp_user else 'missing',
        'FTP_PASSWORD': 'set' if ftp_password else 'missing',
        'FTP_PATH': ftp_path,
        'DATABASE_URL': 'set' if db_dsn else 'missing'
    }
    
    if zeon_api_url and zeon_api_key:
        try:
            headers = {
                'Authorization': f'Bearer {zeon_api_key}',
                'Accept': 'application/json'
            }
            response = requests.get(zeon_api_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results['zeon_api'] = {
                    'status': 'ok',
                    'message': f'Подключено. Найдено записей: {len(data.get("data", []))}'
                }
            else:
                results['zeon_api'] = {
                    'status': 'error',
                    'message': f'HTTP {response.status_code}: {response.text[:200]}'
                }
        except Exception as e:
            results['zeon_api'] = {
                'status': 'error',
                'message': str(e)
            }
    else:
        results['zeon_api'] = {
            'status': 'error',
            'message': 'ZEON_API_URL или ZEON_API_KEY не настроены'
        }
    
    if ftp_host and ftp_user and ftp_password:
        try:
            ftp = FTP(ftp_host, timeout=10)
            ftp.login(ftp_user, ftp_password)
            
            try:
                ftp.cwd(ftp_path)
                files = ftp.nlst()
                results['ftp'] = {
                    'status': 'ok',
                    'message': f'Подключено. Файлов в {ftp_path}: {len(files)}'
                }
            except:
                results['ftp'] = {
                    'status': 'warning',
                    'message': f'Подключено, но директория {ftp_path} не найдена (будет создана)'
                }
            
            ftp.quit()
        except Exception as e:
            results['ftp'] = {
                'status': 'error',
                'message': str(e)
            }
    else:
        results['ftp'] = {
            'status': 'error',
            'message': 'FTP_HOST, FTP_USER или FTP_PASSWORD не настроены'
        }
    
    if db_dsn:
        try:
            conn = psycopg2.connect(db_dsn)
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM information_schema.tables WHERE table_name = %s', ('zeon_recordings_sync',))
            table_exists = cursor.fetchone()[0] > 0
            
            if table_exists:
                cursor.execute('SELECT COUNT(*) FROM zeon_recordings_sync')
                count = cursor.fetchone()[0]
                results['database'] = {
                    'status': 'ok',
                    'message': f'Подключено. Записей в БД: {count}'
                }
            else:
                results['database'] = {
                    'status': 'warning',
                    'message': 'Подключено. Таблица zeon_recordings_sync будет создана при первой синхронизации'
                }
            
            cursor.close()
            conn.close()
        except Exception as e:
            results['database'] = {
                'status': 'error',
                'message': str(e)
            }
    else:
        results['database'] = {
            'status': 'error',
            'message': 'DATABASE_DSN не настроен'
        }
    
    all_ok = all(
        results[key]['status'] in ['ok', 'warning'] 
        for key in ['zeon_api', 'ftp', 'database']
    )
    
    return {
        'statusCode': 200 if all_ok else 500,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': all_ok,
            'results': results
        }, ensure_ascii=False)
    }