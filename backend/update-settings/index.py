import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''Обновление настроек сайта (только для администраторов)'''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        headers = event.get('headers', {})
        auth_header = headers.get('X-Authorization') or headers.get('x-authorization') or headers.get('Authorization') or headers.get('authorization') or ''
        admin_password = os.environ.get('ADMIN_PASSWORD', 'hybrid24')
        
        if not auth_header or auth_header.replace('Bearer ', '') != admin_password:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }
        
        body = json.loads(event.get('body', '{}'))
        maintenance_mode = body.get('maintenanceMode', False)
        maintenance_end_time = body.get('maintenanceEndTime', '')
        
        conn = None
        try:
            dsn = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(dsn)
            cur = conn.cursor()
            
            cur.execute("""
                INSERT INTO site_settings (setting_key, setting_value, updated_at)
                VALUES ('maintenance_mode', %s, CURRENT_TIMESTAMP)
                ON CONFLICT (setting_key) 
                DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP
            """, ('true' if maintenance_mode else 'false',))
            
            cur.execute("""
                INSERT INTO site_settings (setting_key, setting_value, updated_at)
                VALUES ('maintenance_end_time', %s, CURRENT_TIMESTAMP)
                ON CONFLICT (setting_key) 
                DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP
            """, (maintenance_end_time,))
            
            conn.commit()
            cur.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'maintenanceMode': maintenance_mode,
                    'maintenanceEndTime': maintenance_end_time
                }),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                conn.close()
                
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }