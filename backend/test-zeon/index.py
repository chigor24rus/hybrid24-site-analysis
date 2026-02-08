import json
import os
import requests
import psycopg2
import hashlib
from urllib.parse import urlencode
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
        'outbound_ip': {'status': 'unchecked', 'message': ''},
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
    
    try:
        ip_response = requests.get('https://api.ipify.org?format=json', timeout=5)
        if ip_response.status_code == 200:
            ip_data = ip_response.json()
            results['outbound_ip'] = {
                'status': 'ok',
                'message': f'Исходящий IP: {ip_data.get("ip")}'
            }
        else:
            results['outbound_ip'] = {'status': 'warning', 'message': 'Не удалось определить IP'}
    except Exception as e:
        results['outbound_ip'] = {'status': 'warning', 'message': f'Ошибка: {str(e)}'}
    
    if zeon_api_url and zeon_api_key:
        try:
            api_endpoint = zeon_api_url.rstrip('/') + '/api/v2/start.php'
            
            # Проверяем подключение через ping
            params = {
                'topic': 'base',
                'method': 'get-calls-last-id'
            }
            query_string = urlencode(sorted(params.items()))
            hash_string = query_string + zeon_api_key
            params['hash'] = hashlib.md5(hash_string.encode()).hexdigest()
            
            response = requests.post(api_endpoint, data=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('result') == 1:
                    last_id = data.get('id', 0)
                    results['zeon_api'] = {
                        'status': 'ok',
                        'message': f'Подключено. Последний ID звонка: {last_id}'
                    }
                else:
                    results['zeon_api'] = {
                        'status': 'error',
                        'message': f'API error: {data.get("text", "unknown")}'
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
            ftp = FTP(timeout=10)
            ftp.connect(ftp_host, 21)
            ftp.login(ftp_user, ftp_password)
            ftp.set_pasv(True)
            
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