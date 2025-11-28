import json
import os
import base64
import uuid
from typing import Dict, Any
import boto3
from botocore.exceptions import ClientError

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Upload image file to S3 storage and return public URL
    Args: event with httpMethod POST, body with base64 encoded image
    Returns: HTTP response with image URL
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
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
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Parse request body
        body_data = json.loads(event.get('body', '{}'))
        
        image_data = body_data.get('image', '')
        filename = body_data.get('filename', 'image.png')
        
        if not image_data:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Изображение обязательно'})
            }
        
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64
        try:
            image_bytes = base64.b64decode(image_data)
        except Exception:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Неверный формат изображения'})
            }
        
        # Validate file size (max 5MB)
        if len(image_bytes) > 5 * 1024 * 1024:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Размер файла не должен превышать 5 МБ'})
            }
        
        # Generate unique filename
        file_ext = filename.split('.')[-1] if '.' in filename else 'png'
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        # Get S3 credentials from environment
        s3_access_key = os.environ.get('S3_ACCESS_KEY')
        s3_secret_key = os.environ.get('S3_SECRET_KEY')
        s3_bucket = os.environ.get('S3_BUCKET', 'poehali-uploads')
        s3_region = os.environ.get('S3_REGION', 'ru-central1')
        s3_endpoint = os.environ.get('S3_ENDPOINT', 'https://storage.yandexcloud.net')
        
        if not s3_access_key or not s3_secret_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'S3 credentials not configured'})
            }
        
        # Upload to S3
        s3_client = boto3.client(
            's3',
            endpoint_url=s3_endpoint,
            aws_access_key_id=s3_access_key,
            aws_secret_access_key=s3_secret_key,
            region_name=s3_region
        )
        
        # Determine content type
        content_type = 'image/png'
        if file_ext.lower() in ['jpg', 'jpeg']:
            content_type = 'image/jpeg'
        elif file_ext.lower() == 'gif':
            content_type = 'image/gif'
        elif file_ext.lower() == 'svg':
            content_type = 'image/svg+xml'
        elif file_ext.lower() == 'webp':
            content_type = 'image/webp'
        
        s3_client.put_object(
            Bucket=s3_bucket,
            Key=f'brands/{unique_filename}',
            Body=image_bytes,
            ContentType=content_type,
            ACL='public-read'
        )
        
        # Generate public URL
        image_url = f"{s3_endpoint}/{s3_bucket}/brands/{unique_filename}"
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'url': image_url,
                'message': 'Изображение загружено'
            })
        }
        
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка загрузки в S3: {str(e)}'})
        }
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Неверный формат данных'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }
