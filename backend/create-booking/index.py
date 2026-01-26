import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Save customer booking request to database
    Args: event with httpMethod, body containing booking data
    Returns: HTTP response with booking confirmation
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
        
        # Extract booking data
        customer_name = body_data.get('name', '').strip()
        customer_phone = body_data.get('phone', '').strip()
        customer_email = body_data.get('email', '').strip()
        service_type = body_data.get('service', '').strip()
        car_brand = body_data.get('brand', '').strip()
        car_model = body_data.get('model', '').strip()
        preferred_date = body_data.get('date', '').strip()
        preferred_time = body_data.get('time', '').strip()
        comment = body_data.get('comment', '').strip()
        
        # Validation
        if not customer_name or not customer_phone:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Имя и телефон обязательны для заполнения'
                })
            }
        
        # Connect to database
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Insert booking
        cur.execute(
            """
            INSERT INTO bookings 
            (customer_name, customer_phone, customer_email, service_type, 
             car_brand, car_model, preferred_date, preferred_time, comment, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'new')
            RETURNING id, created_at
            """,
            (customer_name, customer_phone, customer_email, service_type,
             car_brand, car_model, preferred_date or None, preferred_time, comment)
        )
        
        result = cur.fetchone()
        booking_id = result['id']
        created_at = result['created_at'].isoformat() if result['created_at'] else None
        
        conn.commit()
        cur.close()
        conn.close()
        
        smtp_host = os.environ.get('SMTP_HOST')
        smtp_port_str = os.environ.get('SMTP_PORT', '587')
        smtp_email = os.environ.get('SMTP_EMAIL')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        if smtp_host and smtp_email and smtp_password:
            smtp_port = int(smtp_port_str)
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Заявка с сайта Hybrid24.ru'
            msg['From'] = smtp_email
            msg['To'] = 'service@hybrids24.ru'
            
            html_content = f"""
            <html>
              <head>
                <style>
                  body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                  .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                  .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                  .content {{ background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }}
                  .field {{ margin-bottom: 15px; }}
                  .field-label {{ font-weight: bold; color: #1f2937; }}
                  .field-value {{ color: #4b5563; margin-top: 5px; }}
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2>Новая заявка с сайта Hybrid24.ru</h2>
                  </div>
                  <div class="content">
                    <div class="field">
                      <div class="field-label">📅 Дата заявки:</div>
                      <div class="field-value">{datetime.now().strftime('%d.%m.%Y %H:%M:%S')}</div>
                    </div>
                    <div class="field">
                      <div class="field-label">👤 Имя клиента:</div>
                      <div class="field-value">{customer_name}</div>
                    </div>
                    <div class="field">
                      <div class="field-label">📱 Телефон:</div>
                      <div class="field-value"><a href="tel:{customer_phone}">{customer_phone}</a></div>
                    </div>
                    <div class="field">
                      <div class="field-label">📧 Email:</div>
                      <div class="field-value">{customer_email or 'Не указан'}</div>
                    </div>
                    <div class="field">
                      <div class="field-label">🔧 Тип услуги:</div>
                      <div class="field-value">{service_type or 'Не указано'}</div>
                    </div>
                    <div class="field">
                      <div class="field-label">🚗 Автомобиль:</div>
                      <div class="field-value">{car_brand} {car_model}</div>
                    </div>
                    <div class="field">
                      <div class="field-label">📆 Предпочитаемая дата:</div>
                      <div class="field-value">{preferred_date or 'Не указано'}</div>
                    </div>
                    <div class="field">
                      <div class="field-label">⏰ Время:</div>
                      <div class="field-value">{preferred_time or 'Не указано'}</div>
                    </div>
                    <div class="field">
                      <div class="field-label">💬 Комментарий:</div>
                      <div class="field-value">{comment or 'Нет'}</div>
                    </div>
                  </div>
                </div>
              </body>
            </html>
            """
            
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)
            
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            server.quit()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'booking_id': booking_id,
                'created_at': created_at,
                'message': 'Заявка успешно создана'
            })
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