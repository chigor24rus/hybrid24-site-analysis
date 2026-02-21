import json
import os
import smtplib
import psycopg2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

LOGO_URL = 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/bucket/979b7247-a981-48f4-9326-8c07c9b7658d.png'
SITE_URL = 'https://hybrid24.ru'
UNSUBSCRIBE_BASE = 'https://functions.poehali.dev/57151564-a5c5-4699-93d7-040cd4af8da6'

# Brand colors
C_PRIMARY = '#206EB5'
C_PRIMARY_DARK = '#1a5a99'
C_PRIMARY_LIGHT = '#e8f0f9'
C_TEXT = '#1a1a1a'
C_MUTED = '#6b7280'
C_BORDER = '#e5e7eb'
C_BG = '#f4f6f0'


def _email_wrapper(content_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:{C_BG};font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:{C_BG};padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.10);">

      <!-- HEADER -->
      <tr>
        <td style="background:linear-gradient(135deg,#1a5a99,#206EB5);padding:28px 32px;text-align:center;">
          <img src="{LOGO_URL}" alt="HEVSR" width="140" style="display:block;margin:0 auto 14px;max-width:140px;">
          <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;">Автосервис · Красноярск</p>
        </td>
      </tr>

      <!-- CONTENT -->
      {content_html}

      <!-- FOOTER -->
      <tr>
        <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid {C_BORDER};">
          <p style="color:{C_MUTED};font-size:12px;margin:0 0 6px;">Красноярск · hybrid24.ru · +7 (923) 016-67-50</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>"""


def _btn_primary(url: str, label: str) -> str:
    return f'<a href="{url}" style="display:inline-block;background:linear-gradient(135deg,{C_PRIMARY_DARK},{C_PRIMARY});color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:bold;">{label}</a>'


def _btn_outline(url: str, label: str) -> str:
    return f'<a href="{url}" style="display:inline-block;background:#ffffff;color:{C_PRIMARY_DARK};text-decoration:none;padding:12px 36px;border-radius:8px;font-size:15px;font-weight:bold;border:2px solid {C_PRIMARY};">{label}</a>'


def _unsubscribe_link(email: str) -> str:
    url = f'{UNSUBSCRIBE_BASE}?email={email}'
    return f'<a href="{url}" style="color:#d1d5db;font-size:11px;text-decoration:underline;">Отписаться от рассылки</a>'


def handler(event: dict, context) -> dict:
    """
    Подписка на акции: сохраняет email в БД, отправляет приветственное письмо подписчику
    и уведомление на service@hybrids24.ru
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
        html = f"""<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Отписка от рассылки</title></head>
<body style="margin:0;padding:0;background:{C_BG};font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:{C_BG};padding:60px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.10);">
      <tr><td style="background:linear-gradient(135deg,{C_PRIMARY_DARK},{C_PRIMARY});padding:28px 32px;text-align:center;">
        <img src="{LOGO_URL}" alt="HEVSR" width="120" style="display:block;margin:0 auto 12px;max-width:120px;">
        <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;">Автосервис · Красноярск</p>
      </td></tr>
      <tr><td style="padding:40px 32px;text-align:center;">
        <p style="font-size:48px;margin:0 0 16px;">✓</p>
        <h2 style="color:{C_TEXT};font-size:22px;margin:0 0 12px;">Вы отписались от рассылки</h2>
        <p style="color:{C_MUTED};font-size:15px;line-height:1.6;margin:0 0 28px;">
          Адрес <strong>{email}</strong> удалён из списка рассылки.<br>
          Вы больше не будете получать уведомления об акциях.
        </p>
        <a href="{SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,{C_PRIMARY_DARK},{C_PRIMARY});color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:bold;">На сайт →</a>
      </td></tr>
      <tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid {C_BORDER};">
        <p style="color:{C_MUTED};font-size:12px;margin:0;">Красноярск · hybrid24.ru · +7 (923) 016-67-50</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>"""
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/html; charset=utf-8'},
            'body': html
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


def _smtp_session():
    h = os.environ.get('SMTP_HOST')
    p = int(os.environ.get('SMTP_PORT', '465'))
    e = os.environ.get('SMTP_EMAIL')
    pw = os.environ.get('SMTP_PASSWORD')
    if not all([h, e, pw]):
        return None, None, None, None
    return h, p, e, pw


def _send_admin_notification(subscriber_email: str):
    h, p, e, pw = _smtp_session()
    if not h:
        return

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Новый подписчик на акции — HEVSR'
    msg['From'] = e
    msg['To'] = 'service@hybrid24.ru'

    content = f"""
      <tr><td style="padding:32px;">
        <h2 style="color:{C_TEXT};margin:0 0 16px;">Новый подписчик</h2>
        <table cellpadding="0" cellspacing="0" style="background:{C_PRIMARY_LIGHT};border-radius:8px;width:100%;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 8px;color:{C_TEXT};"><strong>Email:</strong> {subscriber_email}</p>
            <p style="margin:0;color:{C_MUTED};font-size:14px;"><strong>Дата:</strong> {datetime.now().strftime('%d.%m.%Y %H:%M')}</p>
          </td></tr>
        </table>
      </td></tr>
    """

    msg.attach(MIMEText(_email_wrapper(content), 'html', 'utf-8'))
    with smtplib.SMTP_SSL(h, p, timeout=10) as server:
        server.login(e, pw)
        server.send_message(msg)


def _send_welcome_email(subscriber_email: str):
    h, p, e, pw = _smtp_session()
    if not h:
        return

    promotions_url = f'{SITE_URL}/promotions'
    booking_url = f'{SITE_URL}/#booking'

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Вы подписались на акции HEVSR'
    msg['From'] = e
    msg['To'] = subscriber_email

    content = f"""
      <tr><td style="padding:32px;">
        <h2 style="color:{C_TEXT};margin:0 0 12px;">Вы подписаны на акции!</h2>
        <p style="color:{C_MUTED};font-size:15px;line-height:1.7;margin:0 0 20px;">
          Спасибо за подписку! Теперь вы будете первыми узнавать о выгодных предложениях
          и скидках на обслуживание автомобиля в HEVSR.
        </p>
        <table cellpadding="0" cellspacing="0" style="background:{C_PRIMARY_LIGHT};border-left:4px solid {C_PRIMARY};border-radius:0 8px 8px 0;width:100%;margin-bottom:24px;">
          <tr><td style="padding:16px 20px;">
            <p style="color:{C_PRIMARY_DARK};font-weight:bold;margin:0 0 10px;font-size:14px;">ЧТО ВАС ЖДЁТ:</p>
            <p style="color:{C_TEXT};margin:0 0 6px;font-size:14px;">✓&nbsp; Эксклюзивные скидки для подписчиков</p>
            <p style="color:{C_TEXT};margin:0 0 6px;font-size:14px;">✓&nbsp; Сезонные акции на ТО и ремонт</p>
            <p style="color:{C_TEXT};margin:0;font-size:14px;">✓&nbsp; Только 1–2 письма в месяц</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding-bottom:12px;">{_btn_primary(promotions_url, 'Смотреть текущие акции →')}</td></tr>
          <tr><td align="center" style="padding-bottom:20px;">{_btn_outline(booking_url, 'Записаться на обслуживание')}</td></tr>
          <tr><td align="center">{_unsubscribe_link(subscriber_email)}</td></tr>
        </table>
      </td></tr>
    """

    msg.attach(MIMEText(_email_wrapper(content), 'html', 'utf-8'))
    with smtplib.SMTP_SSL(h, p, timeout=10) as server:
        server.login(e, pw)
        server.send_message(msg)