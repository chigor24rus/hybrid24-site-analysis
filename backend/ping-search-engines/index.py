import json
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    '''Уведомляет поисковики об обновлении sitemap.xml'''
    
    method = event.get('httpMethod', 'GET')
    
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
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    sitemap_url = 'https://hybrid24.ru/sitemap.xml'
    results = {}
    
    # Пинг Google
    try:
        google_ping_url = f'https://www.google.com/ping?sitemap={urllib.parse.quote(sitemap_url)}'
        with urllib.request.urlopen(google_ping_url, timeout=10) as response:
            if response.status == 200:
                results['google'] = 'success'
            else:
                results['google'] = f'error: status {response.status}'
    except Exception as e:
        results['google'] = f'error: {str(e)}'
    
    # Пинг Yandex
    try:
        yandex_ping_url = f'https://webmaster.yandex.ru/ping?sitemap={urllib.parse.quote(sitemap_url)}'
        with urllib.request.urlopen(yandex_ping_url, timeout=10) as response:
            if response.status == 200:
                results['yandex'] = 'success'
            else:
                results['yandex'] = f'error: status {response.status}'
    except Exception as e:
        results['yandex'] = f'error: {str(e)}'
    
    # Пинг Bing
    try:
        bing_ping_url = f'https://www.bing.com/ping?sitemap={urllib.parse.quote(sitemap_url)}'
        with urllib.request.urlopen(bing_ping_url, timeout=10) as response:
            if response.status == 200:
                results['bing'] = 'success'
            else:
                results['bing'] = f'error: status {response.status}'
    except Exception as e:
        results['bing'] = f'error: {str(e)}'
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'message': 'Ping отправлен поисковикам',
            'sitemap_url': sitemap_url,
            'results': results
        })
    }
