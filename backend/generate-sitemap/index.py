import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Генерация sitemap.xml для всех страниц сайта'''
    
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
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Подключение к БД
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        # Определяем схему
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        base_url = 'https://hevsr.ru'
        today = datetime.now().strftime('%Y-%m-%d')
        
        urls = []
        
        # Статические страницы
        static_pages = [
            {'loc': '/', 'priority': '1.0', 'changefreq': 'daily'},
            {'loc': '/services', 'priority': '0.9', 'changefreq': 'weekly'},
            {'loc': '/brands', 'priority': '0.9', 'changefreq': 'weekly'},
            {'loc': '/promotions', 'priority': '0.8', 'changefreq': 'daily'},
            {'loc': '/reviews', 'priority': '0.7', 'changefreq': 'weekly'},
            {'loc': '/blog', 'priority': '0.7', 'changefreq': 'daily'},
            {'loc': '/bonus-program', 'priority': '0.6', 'changefreq': 'monthly'},
            {'loc': '/warranty', 'priority': '0.6', 'changefreq': 'monthly'},
            {'loc': '/legal', 'priority': '0.5', 'changefreq': 'yearly'},
        ]
        
        for page in static_pages:
            urls.append(f'''  <url>
    <loc>{base_url}{page['loc']}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>''')
        
        # Бренды (без is_active, так как его нет в таблице)
        cur.execute(f"SELECT slug FROM {schema}.brands ORDER BY name")
        brands = cur.fetchall()
        
        for brand in brands:
            brand_slug = brand[0]
            urls.append(f'''  <url>
    <loc>{base_url}/brands/{brand_slug}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>''')
            
            # Модели бренда
            urls.append(f'''  <url>
    <loc>{base_url}/brands/{brand_slug}/models</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>''')
        
        # Получаем slug услуг один раз (есть is_active)
        cur.execute(f"SELECT id FROM {schema}.services WHERE is_active = true")
        services_data = cur.fetchall()
        service_ids = [s[0] for s in services_data]
        
        # Модели с услугами (без slug и is_active в car_models)
        cur.execute(f"""
            SELECT DISTINCT b.slug, m.id, m.name
            FROM {schema}.car_models m
            JOIN {schema}.brands b ON m.brand_id = b.id
            ORDER BY b.slug, m.name
        """)
        models = cur.fetchall()
        
        for brand_slug, model_id, model_name in models:
            # Создаем slug из имени модели
            model_slug = model_name.lower().replace(' ', '-').replace('/', '-')
            
            # Страница услуг модели
            urls.append(f'''  <url>
    <loc>{base_url}/brands/{brand_slug}/models/{model_slug}/services</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>''')
            
            # Конкретные услуги для модели
            for service_id in service_ids:
                urls.append(f'''  <url>
    <loc>{base_url}/brands/{brand_slug}/models/{model_slug}/services/{service_id}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>''')
        
        # Посты блога (используем id вместо slug, нет status/published_at)
        cur.execute(f"""
            SELECT id, updated_at 
            FROM {schema}.blog_posts 
            ORDER BY created_at DESC
        """)
        posts = cur.fetchall()
        
        for post_id, updated_at in posts:
            lastmod = updated_at.strftime('%Y-%m-%d') if updated_at else today
            urls.append(f'''  <url>
    <loc>{base_url}/blog/{post_id}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>''')
        
        cur.close()
        conn.close()
        
        # Формирование XML
        sitemap_xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>'''
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/xml',
                'Access-Control-Allow-Origin': '*'
            },
            'body': sitemap_xml
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
