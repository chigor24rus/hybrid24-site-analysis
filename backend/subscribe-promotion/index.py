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

    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        email = params.get('email', '').strip().lower()
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
            f'UPDATE {schema}.subscriptions SET is_active = FALSE WHERE email = %s',
            (email,)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'message': 'Вы успешно отписались'})
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

    _send_admin_notification(email)
    _send_welcome_email(email)

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'message': 'Подписка оформлена'})
    }


def _smtp_connect():
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    if not all([smtp_host, smtp_email, smtp_password]):
        return None, None, None
    return smtp_host, smtp_port, smtp_email, smtp_password


def _send_admin_notification(subscriber_email: str):
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


def _send_welcome_email(subscriber_email: str):
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')

    if not all([smtp_host, smtp_email, smtp_password]):
        return

    unsubscribe_url = f'https://functions.poehali.dev/57151564-a5c5-4699-93d7-040cd4af8da6?email={subscriber_email}'
    promotions_url = 'https://hybrids24.ru/promotions'
    booking_url = 'https://hybrids24.ru/#booking'

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Вы подписались на акции HEVSR'
    msg['From'] = smtp_email
    msg['To'] = subscriber_email

    html = f"""
    <html><body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:32px;text-align:center;">
                <p style="color:#bfdbfe;font-size:13px;margin:0 0 8px;">HEVSR Автосервис · Красноярск</p>
                <h1 style="color:#ffffff;font-size:24px;margin:0;">Вы подписаны на акции!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px;">
                  Спасибо за подписку! Теперь вы будете первыми узнавать о выгодных предложениях
                  и скидках на обслуживание автомобиля в HEVSR.
                </p>
                <div style="background:#eff6ff;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                  <p style="color:#1e40af;font-weight:bold;margin:0 0 8px;">Что вас ждёт:</p>
                  <ul style="color:#374151;margin:0;padding-left:20px;line-height:1.8;">
                    <li>Эксклюзивные скидки для подписчиков</li>
                    <li>Сезонные акции на ТО и ремонт</li>
                    <li>Только 1–2 письма в месяц</li>
                  </ul>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding-bottom:12px;">
                      <a href="{promotions_url}" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#2563eb);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;">
                        Смотреть текущие акции →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <a href="{booking_url}" style="display:inline-block;background:#ffffff;color:#2563eb;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:bold;border:2px solid #2563eb;">
                        Записаться на обслуживание
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:12px;margin:0 0 6px;">
                  Красноярск · hybrids24.ru
                </p>
                <a href="{unsubscribe_url}" style="color:#d1d5db;font-size:11px;text-decoration:underline;">
                  Отписаться от рассылки
                </a>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body></html>
    """

    msg.attach(MIMEText(html, 'html', 'utf-8'))

    with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
        server.login(smtp_email, smtp_password)
        server.send_message(msg)