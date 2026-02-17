import json
import os
import base64
import io
import urllib.request
import boto3
from PIL import Image, ImageDraw, ImageFont


def handler(event, context):
    """Генерация баннера 900x480 с текстом поверх фонового изображения"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    bg_url = "https://cdn.poehali.dev/projects/06c15a5e-698d-45c4-8ef4-b26fa9657aca/files/3dad99c5-53f8-4968-b348-0a669495451c.jpg"

    req = urllib.request.Request(bg_url)
    with urllib.request.urlopen(req) as resp:
        bg_data = resp.read()

    bg = Image.open(io.BytesIO(bg_data))
    w, h = bg.size
    target_ratio = 900 / 480
    current_ratio = w / h
    if current_ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        bg = bg.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        bg = bg.crop((0, top, w, top + new_h))
    bg = bg.resize((900, 480), Image.LANCZOS)

    overlay = Image.new('RGBA', (900, 480), (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)

    draw_overlay.rectangle([(0, 0), (900, 480)], fill=(0, 30, 70, 160))
    draw_overlay.rectangle([(0, 340), (900, 480)], fill=(220, 80, 20, 220))

    bg = bg.convert('RGBA')
    bg = Image.alpha_composite(bg, overlay)
    bg = bg.convert('RGB')

    draw = ImageDraw.Draw(bg)

    try:
        font_url = "https://github.com/google/fonts/raw/main/ofl/roboto/Roboto%5Bwdth%2Cwght%5D.ttf"
        req_font = urllib.request.Request(font_url)
        with urllib.request.urlopen(req_font) as resp:
            font_data = resp.read()

        font_title = ImageFont.truetype(io.BytesIO(font_data), 52)
        font_subtitle = ImageFont.truetype(io.BytesIO(font_data), 36)
        font_discount = ImageFont.truetype(io.BytesIO(font_data), 120)
        font_action = ImageFont.truetype(io.BytesIO(font_data), 34)
    except Exception:
        font_title = ImageFont.load_default()
        font_subtitle = font_title
        font_discount = font_title
        font_action = font_title

    title = "КОМПЛЕКСНАЯ ДИАГНОСТИКА"
    subtitle = "ПОДВЕСКИ"
    discount = "-20%"
    action_text = "на устранение замечаний"

    draw.text((450, 60), title, fill=(255, 255, 255), font=font_title, anchor="mt")
    draw.text((450, 130), subtitle, fill=(255, 200, 50), font=font_title, anchor="mt")

    draw.text((450, 220), discount, fill=(255, 255, 255), font=font_discount, anchor="mt")

    draw.text((450, 390), action_text, fill=(255, 255, 255), font=font_action, anchor="mt")
    draw.text((450, 440), "hybrid24.ru", fill=(255, 200, 50), font=font_subtitle, anchor="mt")

    output = io.BytesIO()
    bg.save(output, format='JPEG', quality=92)
    output.seek(0)

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

    s3.put_object(
        Bucket='files',
        Key='Image/banner-suspension-v2.jpg',
        Body=output.read(),
        ContentType='image/jpeg'
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/Image/banner-suspension-v2.jpg"

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'success': True,
            'url': cdn_url,
            'message': 'Баннер 900x480 успешно создан'
        })
    }