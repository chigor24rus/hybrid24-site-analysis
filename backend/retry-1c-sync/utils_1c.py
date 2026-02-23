import re
import json
import requests
from requests.auth import HTTPBasicAuth


def normalize_phone(phone: str) -> str:
    """Оставляем только цифры"""
    return re.sub(r'\D', '', phone or '')


def find_kontragent_by_phone(odata_url: str, user: str, password: str, phone: str) -> dict | None:
    """
    Ищет контрагента в 1С по номеру телефона.
    ObjectId в записи КонтактнаяИнформация — это Ref_Key самого контрагента.
    Возвращает dict с ключом kontragent_key, или None.
    """
    digits = normalize_phone(phone)
    if not digits:
        return None

    search_tail = digits[-10:] if len(digits) >= 10 else digits

    try:
        resp = requests.get(
            f"{odata_url}/Catalog_Контрагенты_КонтактнаяИнформация?$format=json&$top=2000",
            auth=HTTPBasicAuth(user, password),
            headers={'Accept': 'application/json'},
            timeout=15,
            verify=False
        )
        if resp.status_code == 200:
            items = resp.json().get('value', [])
            for item in items:
                raw = item.get('Представление', '') or ''
                item_digits = normalize_phone(raw)
                item_tail = item_digits[-10:] if len(item_digits) >= 10 else item_digits
                if item_tail and item_tail == search_tail:
                    kontragent_key = item.get('ObjectId') or item.get('Ref_Key')
                    print(f"[1C] Найден контрагент по телефону {phone}: ObjectId={item.get('ObjectId')} Ref_Key={item.get('Ref_Key')} ('{raw}')")
                    return {'kontragent_key': kontragent_key}

            print(f"[1C] Контрагент по телефону {phone} ({search_tail}) не найден среди {len(items)} записей")
        else:
            print(f"[1C] Ошибка КонтактнаяИнформация: {resp.status_code}")
    except Exception as e:
        print(f"[1C] Исключение при поиске контрагента: {e}")

    return None


def find_marketing_program_by_name(odata_url: str, user: str, password: str, promotion_name: str) -> str | None:
    """
    Ищет маркетинговую программу в 1С по названию (частичное совпадение).
    Возвращает Ref_Key или None.
    """
    if not promotion_name:
        return None

    try:
        resp = requests.get(
            f"{odata_url}/Catalog_МаркетинговыеПрограммы?$format=json&$top=500",
            auth=HTTPBasicAuth(user, password),
            headers={'Accept': 'application/json'},
            timeout=10,
            verify=False
        )
        if resp.status_code != 200:
            print(f"[1C] Ошибка загрузки маркетинговых программ: {resp.status_code}")
            return None

        items = resp.json().get('value', [])
        promo_lower = promotion_name.lower().strip()
        for item in items:
            desc = (item.get('Description') or '').lower().strip()
            if desc and (desc == promo_lower or promo_lower in desc or desc in promo_lower):
                key = item.get('Ref_Key')
                print(f"[1C] Найдена маркетинговая программа '{promotion_name}': {key} ('{item.get('Description')}')")
                return key

        print(f"[1C] Маркетинговая программа '{promotion_name}' не найдена среди {len(items)} записей")
    except Exception as e:
        print(f"[1C] Исключение при поиске маркетинговой программы: {e}")

    return None


def get_vid_remonta(odata_url: str, user: str, password: str) -> str | None:
    """Получает первый доступный Вид ремонта из справочника 1С"""
    try:
        resp = requests.get(
            f"{odata_url}/Catalog_ВидыРемонта?$top=1&$format=json",
            auth=HTTPBasicAuth(user, password),
            headers={'Accept': 'application/json'},
            timeout=10,
            verify=False
        )
        if resp.status_code == 200:
            items = resp.json().get('value', [])
            if items:
                key = items[0].get('Ref_Key')
                print(f"[1C] ВидРемонта_Key: {key} ({items[0].get('Description', '')})")
                return key
    except Exception as e:
        print(f"[1C] Ошибка получения ВидыРемонта: {e}")
    return None