import json
import os
import psycopg2
from typing import Dict, Any


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Получение списка подписчиков на акции (только для админа)
    """

    if event.get('httpMethod') == 'OPTIONS':
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

    method = event.get('httpMethod', 'GET')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()

    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        subscriber_id = body.get('id')

        if action == 'deactivate':
            cursor.execute(
                f'UPDATE {schema}.subscriptions SET is_active = FALSE WHERE id = %s',
                (subscriber_id,)
            )
        elif action == 'activate':
            cursor.execute(
                f'UPDATE {schema}.subscriptions SET is_active = TRUE WHERE id = %s',
                (subscriber_id,)
            )
        elif action == 'delete':
            cursor.execute(
                f'DELETE FROM {schema}.subscriptions WHERE id = %s',
                (subscriber_id,)
            )

        conn.commit()
        cursor.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True})
        }

    cursor.execute(
        f'SELECT id, email, created_at, is_active FROM {schema}.subscriptions ORDER BY created_at DESC'
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    subscribers = [
        {
            'id': r[0],
            'email': r[1],
            'created_at': r[2].strftime('%d.%m.%Y %H:%M') if r[2] else '',
            'is_active': r[3]
        }
        for r in rows
    ]

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'subscribers': subscribers, 'total': len(subscribers)})
    }
