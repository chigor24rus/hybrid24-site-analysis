import json
import os
import zipfile
import io
from pathlib import Path

def handler(event: dict, context) -> dict:
    '''
    Автоматически добавляет статические HTML-копии страниц для SEO при скачивании билда.
    Принимает путь к билду, создаёт SEO-версии страниц и возвращает модифицированный архив.
    '''
    method = event.get('httpMethod', 'POST')
    
    # Handle CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
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
        # Получаем тело запроса
        body_raw = event.get('body')
        
        # Обработка разных форматов body
        if body_raw is None or body_raw == '':
            body = {}
        elif isinstance(body_raw, dict):
            # Если уже dict (из тестов)
            body = body_raw
        elif isinstance(body_raw, str):
            # Если строка, парсим JSON
            try:
                body = json.loads(body_raw)
            except json.JSONDecodeError:
                body = {}
        else:
            body = {}
        
        if 'buildZip' not in body or not body['buildZip']:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'buildZip required'}),
                'isBase64Encoded': False
            }
        
        # Декодируем zip
        import base64
        zip_bytes = base64.b64decode(body['buildZip'])
        
        # Читаем существующий архив
        input_zip = zipfile.ZipFile(io.BytesIO(zip_bytes), 'r')
        
        # Читаем index.html из архива
        index_html = input_zip.read('index.html').decode('utf-8')
        
        # Создаём новый архив с дополнительными файлами
        output_buffer = io.BytesIO()
        output_zip = zipfile.ZipFile(output_buffer, 'w', zipfile.ZIP_DEFLATED)
        
        # Копируем все существующие файлы
        for item in input_zip.filelist:
            output_zip.writestr(item, input_zip.read(item.filename))
        
        # Список маршрутов для SEO
        routes = [
            'services',
            'promotions',
            'reviews',
            'blog',
            'brands',
            'legal',
            'bonus-program',
            'warranty',
        ]
        
        # Создаём копии index.html для каждого маршрута
        for route in routes:
            output_zip.writestr(f'{route}/index.html', index_html)
        
        input_zip.close()
        output_zip.close()
        
        # Кодируем результат в base64
        result_bytes = output_buffer.getvalue()
        result_base64 = base64.b64encode(result_bytes).decode('utf-8')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'buildZip': result_base64,
                'message': 'SEO files generated successfully',
                'routes_added': len(routes)
            }),
            'isBase64Encoded': False
        }
        
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