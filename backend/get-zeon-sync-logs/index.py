import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''Получение логов синхронизации ZEON → FTP'''
    
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
    
    db_dsn = os.environ.get('DATABASE_DSN')
    
    if not db_dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'DATABASE_DSN не настроен'
            })
        }
    
    try:
        conn = psycopg2.connect(db_dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query_params = event.get('queryStringParameters', {}) or {}
        limit = int(query_params.get('limit', 100))
        offset = int(query_params.get('offset', 0))
        phone = query_params.get('phone', '')
        
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
        
        # Получаем статистику
        cursor.execute('''
            SELECT 
                COUNT(*) as total_recordings,
                SUM(file_size) as total_size,
                MAX(synced_at) as last_sync,
                MIN(synced_at) as first_sync
            FROM zeon_recordings_sync
        ''')
        stats = cursor.fetchone()
        
        # Получаем записи
        where_clause = ''
        params = []
        
        if phone:
            where_clause = 'WHERE phone_number LIKE %s'
            params.append(f'%{phone}%')
        
        query = f'''
            SELECT 
                id,
                recording_id,
                call_id,
                phone_number,
                duration,
                file_name,
                file_size,
                synced_at,
                ftp_path
            FROM zeon_recordings_sync
            {where_clause}
            ORDER BY synced_at DESC
            LIMIT %s OFFSET %s
        '''
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        recordings = cursor.fetchall()
        
        # Конвертируем datetime в строки
        for rec in recordings:
            if rec['synced_at']:
                rec['synced_at'] = rec['synced_at'].isoformat()
        
        if stats['last_sync']:
            stats['last_sync'] = stats['last_sync'].isoformat()
        if stats['first_sync']:
            stats['first_sync'] = stats['first_sync'].isoformat()
        
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
                'stats': dict(stats),
                'recordings': [dict(rec) for rec in recordings],
                'pagination': {
                    'limit': limit,
                    'offset': offset,
                    'total': stats['total_recordings']
                }
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
