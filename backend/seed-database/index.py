import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Заполняет базу данных начальными данными (бренды, услуги, цены)
    Args: event - HTTP запрос, context - контекст выполнения
    Returns: HTTP response с результатом
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    brands_data = [
        ('Toyota', 'toyota', 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/4e08abc9-6dc7-4175-88e7-4506631ccebe.jpg', 'Специализированное обслуживание автомобилей Toyota. Оригинальные запчасти, сертифицированные мастера.'),
        ('Honda', 'honda', 'https://via.placeholder.com/150x150/ffffff/666666?text=Honda', 'Профессиональное обслуживание Honda. Японская надежность и технологии.'),
        ('Nissan', 'nissan', 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/94c95c26-2e2d-4849-929a-bbc56961a2b5.jpg', 'Специализированное обслуживание Nissan. Японское качество и надежность.'),
        ('Lexus', 'lexus', 'https://via.placeholder.com/150x150/ffffff/666666?text=Lexus', 'Премиальное обслуживание Lexus. Роскошь и качество.'),
        ('Mazda', 'mazda', 'https://via.placeholder.com/150x150/ffffff/666666?text=Mazda', 'Качественное обслуживание Mazda. Технологии SKYACTIV.'),
        ('Mitsubishi', 'mitsubishi', 'https://via.placeholder.com/150x150/ffffff/666666?text=Mitsubishi', 'Надежное обслуживание Mitsubishi. Японские технологии.'),
        ('Subaru', 'subaru', 'https://via.placeholder.com/150x150/ffffff/666666?text=Subaru', 'Обслуживание Subaru. Оппозитные двигатели и полный привод.'),
        ('Suzuki', 'suzuki', 'https://via.placeholder.com/150x150/ffffff/666666?text=Suzuki', 'Обслуживание Suzuki. Компактные и надежные автомобили.'),
        ('Acura', 'acura', 'https://via.placeholder.com/150x150/ffffff/666666?text=Acura', 'Премиальное обслуживание Acura. Технологии Honda премиум-класса.'),
        ('Hyundai', 'hyundai', 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/b96818be-6317-4095-a3eb-ed039af61550.jpg', 'Качественное обслуживание Hyundai. Корейские технологии, доступные цены.'),
        ('Kia', 'kia', 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/97ee8ca9-4c2a-4454-81ee-3c05a54f2661.jpg', 'Профессиональное обслуживание Kia. Современный сервис для современных автомобилей.'),
        ('Haval', 'haval', 'https://via.placeholder.com/150x150/ffffff/666666?text=Haval', 'Обслуживание Haval. Современные китайские SUV.'),
        ('Geely', 'geely', 'https://via.placeholder.com/150x150/ffffff/666666?text=Geely', 'Обслуживание Geely. Надежные китайские автомобили.'),
        ('Changan', 'changan', 'https://via.placeholder.com/150x150/ffffff/666666?text=Changan', 'Обслуживание Changan. Современные технологии.'),
        ('Belgee', 'belgee', 'https://via.placeholder.com/150x150/ffffff/666666?text=Belgee', 'Обслуживание Belgee. Современные белорусско-китайские автомобили.'),
        ('Lifan', 'lifan', 'https://via.placeholder.com/150x150/ffffff/666666?text=Lifan', 'Обслуживание Lifan. Доступные китайские автомобили.'),
        ('Jetour', 'jetour', 'https://via.placeholder.com/150x150/ffffff/666666?text=Jetour', 'Обслуживание Jetour. Современные кроссоверы от Chery.'),
        ('Tank', 'tank', 'https://via.placeholder.com/150x150/ffffff/666666?text=Tank', 'Обслуживание Tank. Премиальные внедорожники Great Wall.'),
        ('Exeed', 'exeed', 'https://via.placeholder.com/150x150/ffffff/666666?text=Exeed', 'Обслуживание Exeed. Премиальный суббренд Chery.'),
        ('Omoda', 'omoda', 'https://via.placeholder.com/150x150/ffffff/666666?text=Omoda', 'Обслуживание Omoda. Молодежный бренд Chery.'),
        ('GAC', 'gac', 'https://via.placeholder.com/150x150/ffffff/666666?text=GAC', 'Обслуживание GAC. Инновационные китайские автомобили.'),
        ('Li AUTO', 'li auto', 'https://via.placeholder.com/150x150/ffffff/666666?text=Li+AUTO', 'Обслуживание Li AUTO. Премиальные электрические кроссоверы.'),
        ('JAC', 'jac', 'https://via.placeholder.com/150x150/ffffff/666666?text=JAC', 'Обслуживание JAC. Надежные китайские автомобили.'),
        ('Voyah', 'voyah', 'https://via.placeholder.com/150x150/ffffff/666666?text=Voyah', 'Обслуживание Voyah. Премиальные электромобили Dongfeng.'),
        ('Zeekr', 'zeekr', 'https://via.placeholder.com/150x150/ffffff/666666?text=Zeekr', 'Обслуживание Zeekr. Высокотехнологичные электромобили Geely.'),
        ('Hongqi', 'hongqi', 'https://via.placeholder.com/150x150/ffffff/666666?text=Hongqi', 'Обслуживание Hongqi. Премиальные китайские автомобили.'),
        ('FAW', 'faw', 'https://via.placeholder.com/150x150/ffffff/666666?text=FAW', 'Обслуживание FAW. Крупнейший китайский автопроизводитель.'),
        ('Dongfeng', 'dongfeng', 'https://via.placeholder.com/150x150/ffffff/666666?text=Dongfeng', 'Обслуживание Dongfeng. Один из крупнейших автопроизводителей Китая.'),
        ('Jaecoo', 'jaecoo', 'https://via.placeholder.com/150x150/ffffff/666666?text=Jaecoo', 'Обслуживание Jaecoo. Премиальный внедорожный бренд Chery.'),
        ('Bestune', 'bestune', 'https://via.placeholder.com/150x150/ffffff/666666?text=Bestune', 'Обслуживание Bestune. Современный бренд FAW Group.'),
        ('Chery', 'chery', 'https://via.placeholder.com/150x150/ffffff/666666?text=Chery', 'Обслуживание Chery. Проверенные китайские автомобили.')
    ]
    
    for brand in brands_data:
        cur.execute(
            "INSERT INTO brands (name, slug, logo_url, description) VALUES (%s, %s, %s, %s) ON CONFLICT (slug) DO NOTHING",
            brand
        )
    
    services_data = [
        ('Техническое обслуживание', 'Комплексная проверка и обслуживание автомобиля', 'Wrench', '2 часа'),
        ('Диагностика двигателя', 'Компьютерная диагностика и выявление неисправностей', 'Settings', '1 час'),
        ('Замена масла', 'Замена моторного масла и масляного фильтра', 'Droplet', '30 мин'),
        ('Шиномонтаж', 'Сезонная замена шин, балансировка', 'Disc', '1 час'),
        ('Ремонт ходовой', 'Диагностика и ремонт подвески автомобиля', 'Construction', '3 часа'),
        ('Кузовной ремонт', 'Восстановление кузова после ДТП', 'Car', 'от 1 дня')
    ]
    
    for service in services_data:
        cur.execute(
            "INSERT INTO services (title, description, icon, duration) VALUES (%s, %s, %s, %s)",
            service
        )
    
    cur.execute("SELECT id FROM services")
    service_ids = [row[0] for row in cur.fetchall()]
    
    cur.execute("SELECT id FROM brands")
    brand_ids = [row[0] for row in cur.fetchall()]
    
    base_prices = [3500, 1500, 1200, 2000, 5000, 10000]
    
    for brand_id in brand_ids:
        for idx, service_id in enumerate(service_ids):
            cur.execute(
                "INSERT INTO service_prices (service_id, brand_id, base_price) VALUES (%s, %s, %s)",
                (service_id, brand_id, base_prices[idx])
            )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': 'База данных успешно заполнена',
            'brands_count': len(brands_data),
            'services_count': len(services_data)
        })
    }
