import re
import requests
from requests.auth import HTTPBasicAuth


def normalize_phone(phone: str) -> str:
    """Оставляем только цифры"""
    return re.sub(r'\D', '', phone or '')


def find_kontragent_by_phone(odata_url: str, user: str, password: str, phone: str) -> str | None:
    """
    Ищет контрагента в 1С по номеру телефона через Catalog_Контрагенты_КонтактнаяИнформация.
    Возвращает Ref_Key контрагента или None.
    """
    digits = normalize_phone(phone)
    if not digits:
        return None

    # Ищем последние 10 цифр (без кода страны) для гибкого поиска
    search_digits = digits[-10:] if len(digits) >= 10 else digits

    try:
        resp = requests.get(
            f"{odata_url}/Catalog_Контрагенты_КонтактнаяИнформация"
            f"?$filter=contains(Представление,'{search_digits}')&$top=5&$format=json",
            auth=HTTPBasicAuth(user, password),
            headers={'Accept': 'application/json'},
            timeout=10,
            verify=False
        )
        if resp.status_code == 200:
            items = resp.json().get('value', [])
            if items:
                ref_key = items[0].get('Ref_Key')
                print(f"[1C] Найден контрагент по телефону {phone}: {ref_key}")
                return ref_key
            else:
                print(f"[1C] Контрагент по телефону {phone} не найден")
        else:
            print(f"[1C] Ошибка поиска контрагента: {resp.status_code} {resp.text[:200]}")
    except Exception as e:
        print(f"[1C] Исключение при поиске контрагента: {e}")

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
