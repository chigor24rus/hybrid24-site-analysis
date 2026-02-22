import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get all bookings from database with filtering options
    Args: event with httpMethod, queryStringParameters for status filter
    Returns: HTTP response with bookings list
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        # Get query parameters
        params = event.get('queryStringParameters') or {}
        status_filter = params.get('status', '')
        
        # Connect to database
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Build query
        if status_filter:
            cur.execute(
                """
                SELECT id, customer_name, customer_phone, customer_email,
                       service_type, car_brand, car_model, preferred_date,
                       preferred_time, comment, status, created_at, updated_at,
                       synced_to_1c, synced_to_1c_at
                FROM bookings
                WHERE status = %s
                ORDER BY created_at DESC
                """,
                (status_filter,)
            )
        else:
            cur.execute(
                """
                SELECT id, customer_name, customer_phone, customer_email,
                       service_type, car_brand, car_model, preferred_date,
                       preferred_time, comment, status, created_at, updated_at,
                       synced_to_1c, synced_to_1c_at
                FROM bookings
                ORDER BY created_at DESC
                """
            )
        
        rows = cur.fetchall()
        
        # Convert to JSON-serializable format
        bookings = []
        for row in rows:
            booking = dict(row)
            # Convert datetime objects to ISO format strings
            if booking.get('created_at'):
                booking['created_at'] = booking['created_at'].isoformat()
            if booking.get('updated_at'):
                booking['updated_at'] = booking['updated_at'].isoformat()
            if booking.get('preferred_date'):
                booking['preferred_date'] = booking['preferred_date'].isoformat()
            if booking.get('synced_to_1c_at'):
                booking['synced_to_1c_at'] = booking['synced_to_1c_at'].isoformat()
            bookings.append(booking)
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'bookings': bookings,
                'total': len(bookings)
            })
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