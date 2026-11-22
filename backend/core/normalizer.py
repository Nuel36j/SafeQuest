"""Turn whatever a user typed into one canonical form per identifier.

Search and duplicate-merging both depend on this: "0803 123 4567", "+234 803 123 4567"
and "2348031234567" must all end up as the same identifier.

Standard library only, so it can be tested without the rest of the app.
"""
import re
from typing import Optional
from urllib.parse import urlsplit

MAX_LENGTH = 512

# Common Nigerian banks and money apps. Anything not listed falls back to a cleaned-up slug.
# Better long term: let the frontend send a bank code from a dropdown.
BANK_ALIASES = {
    "gtb": "gtbank", "gtbank": "gtbank", "guarantytrustbank": "gtbank", "guarantytrust": "gtbank",
    "access": "access", "accessbank": "access",
    "firstbank": "firstbank", "fbn": "firstbank", "firstbankofnigeria": "firstbank",
    "uba": "uba", "unitedbankforafrica": "uba",
    "zenith": "zenith", "zenithbank": "zenith",
    "fidelity": "fidelity", "fidelitybank": "fidelity",
    "fcmb": "fcmb", "firstcitymonumentbank": "fcmb",
    "sterling": "sterling", "sterlingbank": "sterling",
    "union": "union", "unionbank": "union",
    "wema": "wema", "wemabank": "wema", "alat": "wema",
    "stanbic": "stanbic", "stanbicibtc": "stanbic", "stanbicibtcbank": "stanbic",
    "polaris": "polaris", "polarisbank": "polaris",
    "keystone": "keystone", "keystonebank": "keystone",
    "ecobank": "ecobank",
    "opay": "opay", "paycom": "opay",
    "palmpay": "palmpay",
    "kuda": "kuda", "kudabank": "kuda", "kudamicrofinancebank": "kuda",
    "moniepoint": "moniepoint", "moniepointmfb": "moniepoint",
}


def normalize_identifier(id_type, value: str, bank: Optional[str] = None) -> str:
    """Return the canonical string for an identifier. Raises ValueError if it is invalid."""
    id_type = str(getattr(id_type, "value", id_type))
    value = (value or "").strip()
    if not value:
        raise ValueError("A value is required.")

    if id_type == "phone":
        result = _normalize_phone(value)
    elif id_type == "account":
        result = _normalize_account(value, bank)
    elif id_type == "url":
        result = _normalize_url(value)
    else:
        raise ValueError(f"Unsupported identifier type: {id_type}")

    if len(result) > MAX_LENGTH:
        raise ValueError("Value is too long.")
    return result


def _normalize_phone(raw: str) -> str:
    has_plus = raw.startswith("+")
    digits = re.sub(r"[^0-9]", "", raw)

    if digits.startswith("00"):  # 00234... is another way of writing +234...
        has_plus, digits = True, digits[2:]

    if has_plus or digits.startswith("234"):
        # People often write +234 0803... with the local leading 0 left in.
        if digits.startswith("2340") and len(digits) == 14:
            digits = "234" + digits[4:]
        if digits.startswith("234"):
            if len(digits) != 13:
                raise ValueError("Invalid Nigerian phone number.")
            return "+" + digits
        if 8 <= len(digits) <= 15:
            return "+" + digits
        raise ValueError("Invalid phone number.")

    if len(digits) == 11 and digits.startswith("0"):
        return "+234" + digits[1:]
    if len(digits) == 10 and digits[0] in "789":
        return "+234" + digits
    raise ValueError("Invalid phone number.")


def _normalize_account(raw: str, bank: Optional[str]) -> str:
    # The same 10 digits can exist at different banks, so the bank is part of the identity.
    if not bank or not bank.strip():
        raise ValueError("Bank name is required for account numbers.")
    digits = re.sub(r"[\s-]", "", raw)
    if not re.fullmatch(r"[0-9]{6,20}", digits):
        raise ValueError("Account number must be 6 to 20 digits.")
    slug = re.sub(r"[^a-z0-9]", "", bank.lower())
    if not slug:
        raise ValueError("Invalid bank name.")
    return f"{BANK_ALIASES.get(slug, slug)}:{digits}"


def _normalize_url(raw: str) -> str:
    s = raw.strip()
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.\-]*://", s):
        s = "http://" + s
    try:
        parts = urlsplit(s)
        host = parts.hostname
    except ValueError:
        raise ValueError("Invalid URL.")
    if parts.scheme not in ("http", "https") or not host or "." not in host:
        raise ValueError("Invalid URL.")

    host = host.lower().rstrip(".")
    try:
        host = host.encode("idna").decode("ascii")  # unicode look-alike domains become punycode
    except UnicodeError:
        raise ValueError("Invalid URL.")
    if host.startswith("www."):
        host = host[4:]

    # Keep host + path. Scheme, port, query string (tracking params) and fragment are dropped.
    return host + parts.path.rstrip("/")
