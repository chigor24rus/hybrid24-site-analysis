import json
import os
import smtplib
import psycopg2
from typing import Dict, Any
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


SITE_URL = 'https://hybrids24.ru'


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
    valid_text = f'до {valid_until}' if valid_until != 'Постоянно' else 'постоянно'

    sent = 0
    try:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15) as server:
            server.login(smtp_email, smtp_password)
            for email in subscribers:
                try:
                    msg = MIMEMultipart('alternative')
                    msg['Subject'] = f'Новая акция HEVSR: {title}'
                    msg['From'] = smtp_email
                    msg['To'] = email

                    html = f"""
                    <html><body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
                        <tr><td align="center">
                          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                            <tr>
                              <td style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:32px;text-align:center;">
                                <p style="color:#bfdbfe;font-size:13px;margin:0 0 8px;">HEVSR Автосервис · Красноярск</p>
                                <h1 style="color:#ffffff;font-size:24px;margin:0;">Новая акция для вас!</h1>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:32px;">
                                <div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
                                  <p style="font-size:28px;font-weight:bold;color:#1e40af;margin:0 0 4px;">{discount}</p>
                                  <p style="font-size:18px;font-weight:bold;color:#1e3a8a;margin:0;">{title}</p>
                                </div>
                                <p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">{description}</p>
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                  <tr>
                                    <td style="padding:8px 12px;background:#f9fafb;border-radius:6px;">
                                      <span style="color:#6b7280;font-size:13px;">Цена по акции:</span>
                                      <span style="color:#1e40af;font-weight:bold;font-size:16px;margin-left:8px;">{new_price}</span>
                                    </td>
                                    <td width="12"></td>
                                    <td style="padding:8px 12px;background:#f9fafb;border-radius:6px;">
                                      <span style="color:#6b7280;font-size:13px;">Действует:</span>
                                      <span style="color:#374151;font-weight:bold;font-size:14px;margin-left:8px;">{valid_text}</span>
                                    </td>
                                  </tr>
                                </table>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td align="center">
                                      <a href="{promotion_url}" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#2563eb);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;">
                                        Смотреть акцию →
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
                                <p style="color:#9ca3af;font-size:12px;margin:0;">
                                  Вы получили это письмо, так как подписались на акции HEVSR.<br>
                                  Красноярск · hybrids24.ru
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td></tr>
                      </table>
                    </body></html>
                    """

                    msg.attach(MIMEText(html, 'html', 'utf-8'))
                    server.send_message(msg)
                    sent += 1
                except Exception:
                    continue
    except Exception:
        pass

    return sent
