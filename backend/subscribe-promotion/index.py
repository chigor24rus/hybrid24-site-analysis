import json
import os
import smtplib
import psycopg2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


def handler(event: dict, context) -> dict:
    """
    Подписка на акции: сохраняет email в БД и отправляет уведомление на service@hybrids24.ru
    """

    if event.get('httpMethod') == 'OPTIONS':
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

    body = json.loads(event.get('body', '{}'))
    email = body.get('email', '').strip().lower()

    if not email or '@' not in email:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': 'Некорректный email'})
        }

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()

    cursor.execute(
        f'SELECT id, is_active FROM {schema}.subscriptions WHERE email = %s',
        (email,)
    )
    existing = cursor.fetchone()

    if existing:
        if existing[1]:
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True, 'already': True, 'message': 'Вы уже подписаны на акции'})
            }
        else:
            cursor.execute(
                f'UPDATE {schema}.subscriptions SET is_active = TRUE WHERE email = %s',
                (email,)
            )
    else:
        cursor.execute(
            f'INSERT INTO {schema}.subscriptions (email) VALUES (%s)',
            (email,)
        )

    conn.commit()
    cursor.close()
    conn.close()

    _send_notification(email)

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'message': 'Подписка оформлена'})
    }


def _send_notification(subscriber_email: str):
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')

    if not all([smtp_host, smtp_email, smtp_password]):
        return

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Новый подписчик на акции — HEVSR'
    msg['From'] = smtp_email
    msg['To'] = 'service@hybrids24.ru'

    html = f"""
    <html><body style="font-family:Arial,sans-serif;color:#333;">
      <div style="max-width:500px;margin:0 auto;padding:20px;">
        <div style="background:#2563eb;color:white;padding:16px;border-radius:8px 8px 0 0;text-align:center;">
          <h2 style="margin:0;">Новый подписчик на акции</h2>
        </div>
        <div style="background:#f9fafb;padding:20px;border:1px solid #e5e7eb;border-radius:0 0 8px 8px;">
          <p><strong>Email:</strong> {subscriber_email}</p>
          <p><strong>Дата:</strong> {datetime.now().strftime('%d.%m.%Y %H:%M')}</p>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:12px;">
          Автоматическое уведомление сайта HEVSR
        </p>
      </div>
    </body></html>
    """

    msg.attach(MIMEText(html, 'html', 'utf-8'))

    with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
