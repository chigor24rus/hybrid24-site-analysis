import json
import os
import smtplib
import psycopg2
from typing import Dict, Any
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


SITE_URL = 'https://hybrid24.ru'
LOGO_URL = 'https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/bucket/979b7247-a981-48f4-9326-8c07c9b7658d.png'
UNSUBSCRIBE_BASE = 'https://functions.poehali.dev/57151564-a5c5-4699-93d7-040cd4af8da6'
C_PRIMARY = '#206EB5'
C_PRIMARY_DARK = '#1a5a99'
C_PRIMARY_LIGHT = '#e8f0f9'
C_MUTED = '#6b7280'
C_TEXT = '#1a1a1a'
C_BORDER = '#e5e7eb'
C_BG = '#f4f6f0'


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Обновление существующей акции. Если акция активируется — рассылает уведомление подписчикам.
    '''
    method: str = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    body = json.loads(event.get('body', '{}'))

    promotion_id = body.get('id')
    title = body.get('title', '')
    description = body.get('description', '')
    discount = body.get('discount', '')
    old_price = body.get('old_price', '')
    new_price = body.get('new_price', '')
    valid_until = body.get('valid_until', '')
    icon = body.get('icon', 'Percent')
    details = body.get('details', '')
    is_active = body.get('is_active', True)

    if not promotion_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing promotion ID'}),
            'isBase64Encoded': False
        }

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()

    cursor.execute(
        f'SELECT is_active FROM {schema}.promotions WHERE id = %s',
        (promotion_id,)
    )
    row = cursor.fetchone()
    was_active = row[0] if row else True

    cursor.execute(f'''
        UPDATE {schema}.promotions
        SET title = %s, description = %s, discount = %s, old_price = %s,
            new_price = %s, valid_until = %s, icon = %s, details = %s,
            is_active = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    ''', (title, description, discount, old_price, new_price, valid_until,
          icon, details, is_active, promotion_id))

    conn.commit()

    sent_count = 0
    just_activated = is_active and not was_active
    if just_activated:
        cursor.execute(
            f'SELECT email FROM {schema}.subscriptions WHERE is_active = TRUE'
        )
        subscribers = [r[0] for r in cursor.fetchall()]
        if subscribers:
            sent_count = _send_promotion_emails(
                subscribers, title, description, discount, new_price, valid_until
            )

    cursor.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'emails_sent': sent_count}),
        'isBase64Encoded': False
    }


def _email_wrapper(content_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:{C_BG};font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:{C_BG};padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.10);">
      <tr>
        <td style="background:linear-gradient(135deg,#1a5a99,#206EB5);padding:28px 32px;text-align:center;">
          <img src="{LOGO_URL}" alt="HEVSR" width="140" style="display:block;margin:0 auto 14px;max-width:140px;">
          <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;">Автосервис · Красноярск</p>
        </td>
      </tr>
      {content_html}
      <tr>
        <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid {C_BORDER};">
          <p style="color:{C_MUTED};font-size:12px;margin:0;">Красноярск · hybrid24.ru · +7 (923) 016-67-50</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>"""


def _send_promotion_emails(
    subscribers: list,
    title: str,
    description: str,
    discount: str,
    new_price: str,
    valid_until: str
) -> int:
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')

    if not all([smtp_host, smtp_email, smtp_password]):
        return 0

    promotion_url = f'{SITE_URL}/promotions'
    booking_url = f'{SITE_URL}/#booking'
    valid_text = f'до {valid_until}' if valid_until != 'Постоянно' else 'постоянно'

    sent = 0
    try:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15) as server:
            server.login(smtp_email, smtp_password)
            for email in subscribers:
                try:
                    unsubscribe_url = f'{UNSUBSCRIBE_BASE}?email={email}'
                    msg = MIMEMultipart('alternative')
                    msg['Subject'] = f'Новая акция HEVSR: {title}'
                    msg['From'] = smtp_email
                    msg['To'] = email

                    content = f"""
                    <tr><td style="padding:32px;">
                      <div style="background:{C_PRIMARY_LIGHT};border-left:4px solid {C_PRIMARY};border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:20px;">
                        <p style="font-size:30px;font-weight:bold;color:{C_PRIMARY_DARK};margin:0 0 4px;">{discount}</p>
                        <p style="font-size:18px;font-weight:bold;color:{C_TEXT};margin:0;">{title}</p>
                      </div>
                      <p style="color:{C_MUTED};line-height:1.7;margin:0 0 20px;font-size:15px;">{description}</p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                        <tr>
                          <td style="padding:10px 14px;background:#f9fafb;border-radius:8px;width:48%;">
                            <p style="color:{C_MUTED};font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Цена по акции</p>
                            <p style="color:{C_PRIMARY_DARK};font-weight:bold;font-size:17px;margin:0;">{new_price}</p>
                          </td>
                          <td width="4%"></td>
                          <td style="padding:10px 14px;background:#f9fafb;border-radius:8px;width:48%;">
                            <p style="color:{C_MUTED};font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px;">Действует</p>
                            <p style="color:{C_TEXT};font-weight:bold;font-size:15px;margin:0;">{valid_text}</p>
                          </td>
                        </tr>
                      </table>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr><td align="center" style="padding-bottom:12px;">
                          <a href="{promotion_url}" style="display:inline-block;background:linear-gradient(135deg,{C_PRIMARY_DARK},{C_PRIMARY});color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:bold;">Смотреть акцию →</a>
                        </td></tr>
                        <tr><td align="center" style="padding-bottom:20px;">
                          <a href="{booking_url}" style="display:inline-block;background:#ffffff;color:{C_PRIMARY_DARK};text-decoration:none;padding:12px 36px;border-radius:8px;font-size:15px;font-weight:bold;border:2px solid {C_PRIMARY};">Записаться на обслуживание</a>
                        </td></tr>
                        <tr><td align="center">
                          <a href="{unsubscribe_url}" style="color:#d1d5db;font-size:11px;text-decoration:underline;">Отписаться от рассылки</a>
                        </td></tr>
                      </table>
                    </td></tr>
                    """

                    msg.attach(MIMEText(_email_wrapper(content), 'html', 'utf-8'))
                    server.send_message(msg)
                    sent += 1
                except Exception:
                    continue
    except Exception:
        pass

    return sent