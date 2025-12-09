import json
import os
import psycopg2
from typing import Dict, Any, Optional

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление статьями блога: получение, создание, обновление, удаление
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name и др.
    Returns: HTTP response dict с данными статей
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            post_id = params.get('id')
            
            if post_id:
                cursor.execute('''
                    SELECT id, title, excerpt, category, icon, image, date, read_time, 
                           intro, sections, conclusion
                    FROM blog_posts WHERE id = %s
                ''', (post_id,))
                row = cursor.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'Статья не найдена'}),
                        'isBase64Encoded': False
                    }
                
                post = {
                    'id': row[0],
                    'title': row[1],
                    'excerpt': row[2],
                    'category': row[3],
                    'icon': row[4],
                    'image': row[5],
                    'date': row[6],
                    'readTime': row[7],
                    'content': {
                        'intro': row[8],
                        'sections': row[9],
                        'conclusion': row[10]
                    }
                }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'post': post}),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute('''
                    SELECT id, title, excerpt, category, icon, image, date, read_time
                    FROM blog_posts ORDER BY date DESC
                ''')
                rows = cursor.fetchall()
                
                posts = [
                    {
                        'id': row[0],
                        'title': row[1],
                        'excerpt': row[2],
                        'category': row[3],
                        'icon': row[4],
                        'image': row[5],
                        'date': row[6],
                        'readTime': row[7]
                    }
                    for row in rows
                ]
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'posts': posts}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO blog_posts 
                (title, excerpt, category, icon, image, date, read_time, intro, sections, conclusion)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body_data['title'],
                body_data['excerpt'],
                body_data['category'],
                body_data.get('icon', 'FileText'),
                body_data['image'],
                body_data['date'],
                body_data['readTime'],
                body_data['content']['intro'],
                json.dumps(body_data['content']['sections']),
                body_data['content']['conclusion']
            ))
            
            post_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'id': post_id, 'message': 'Статья создана'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            post_id = body_data.get('id')
            
            if not post_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'ID статьи обязателен'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE blog_posts SET
                    title = %s,
                    excerpt = %s,
                    category = %s,
                    icon = %s,
                    image = %s,
                    date = %s,
                    read_time = %s,
                    intro = %s,
                    sections = %s,
                    conclusion = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body_data['title'],
                body_data['excerpt'],
                body_data['category'],
                body_data.get('icon', 'FileText'),
                body_data['image'],
                body_data['date'],
                body_data['readTime'],
                body_data['content']['intro'],
                json.dumps(body_data['content']['sections']),
                body_data['content']['conclusion'],
                post_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Статья обновлена'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            post_id = params.get('id')
            
            if not post_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'ID статьи обязателен'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM blog_posts WHERE id = %s', (post_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Статья удалена'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
