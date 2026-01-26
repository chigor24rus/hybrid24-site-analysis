import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    Отправляет email уведомление о новой заявке на service@hybrids24.ru
    """
    
    if event.get('httpMethod') == 'OPTIONS':
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
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        customer_name = body.get('customer_name', 'Не указано')
        customer_phone = body.get('customer_phone', 'Не указано')
        customer_email = body.get('customer_email', 'Не указано')
        service_type = body.get('service_type', 'Не указано')
        car_brand = body.get('car_brand', 'Не указано')
        car_model = body.get('car_model', 'Не указано')
        preferred_date = body.get('preferred_date', 'Не указано')
        preferred_time = body.get('preferred_time', 'Не указано')
        comment = body.get('comment', 'Нет комментариев')
        
        smtp_host = os.environ.get('SMTP_HOST')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_email = os.environ.get('SMTP_EMAIL')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        if not all([smtp_host, smtp_email, smtp_password]):
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'SMTP settings not configured'
                }),
                'isBase64Encoded': False
            }
        
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
              .footer {{ margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px; }}
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Новая заявка с сайта Hybrid24.ru</h2>
              </div>
              <div class="content">
                <div class="field">
                  <div class="field-label">📅 Дата и время заявки:</div>
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
                  <div class="field-value"><a href="mailto:{customer_email}">{customer_email}</a></div>
                </div>
                
                <div class="field">
                  <div class="field-label">🔧 Тип услуги:</div>
                  <div class="field-value">{service_type}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">🚗 Автомобиль:</div>
                  <div class="field-value">{car_brand} {car_model}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">📆 Предпочитаемая дата:</div>
                  <div class="field-value">{preferred_date}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">⏰ Предпочитаемое время:</div>
                  <div class="field-value">{preferred_time}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">💬 Комментарий:</div>
                  <div class="field-value">{comment}</div>
                </div>
              </div>
              <div class="footer">
                Это автоматическое уведомление с сайта Hybrid24.ru
              </div>
            </div>
          </body>
        </html>
        """
        
        html_part = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(html_part)
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Email sent successfully'
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
            'body': json.dumps({
                'success': False,
                'error': str(e)
            }),
            'isBase64Encoded': False
        }
