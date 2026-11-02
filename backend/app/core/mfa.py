import base64
import hashlib
import hmac
import secrets
import struct
import time
from typing import Optional

def generate_totp_secret() -> str:
    """Generate a high-entropy 160-bit Base32 TOTP secret string."""
    random_bytes = secrets.token_bytes(20)
    return base64.b32encode(random_bytes).decode("utf-8").replace("=", "")

def generate_backup_code() -> str:
    """Generate a single-use 10-character alphanumeric admin emergency backup code."""
    part1 = secrets.token_hex(3).upper()
    part2 = secrets.token_hex(3).upper()
    return f"ADM-{part1}-{part2}"

def compute_totp(secret_b32: str, step_offset: int = 0, time_step: int = 30) -> str:
    """Compute 6-digit TOTP code for a given secret at current time + step_offset."""
    # Ensure correct padding for base32 decoding
    secret_cleaned = secret_b32.strip().replace(" ", "").upper()
    missing_padding = len(secret_cleaned) % 8
    if missing_padding:
        secret_cleaned += "=" * (8 - missing_padding)
    
    key = base64.b32decode(secret_cleaned, casefold=True)
    counter = int(time.time() // time_step) + step_offset
    msg = struct.pack(">Q", counter)
    digest = hmac.new(key, msg, hashlib.sha1).digest()
    offset = digest[19] & 0x0F
    code_int = (struct.unpack(">I", digest[offset:offset + 4])[0] & 0x7FFFFFFF) % 1000000
    return f"{code_int:06d}"

def verify_totp(secret_b32: str, code: str, window: int = 1) -> bool:
    """
    Verify TOTP code within +/- `window` time steps (default +/- 30 seconds clock drift tolerance).
    """
    if not secret_b32 or not code:
        return False
    code_cleaned = code.strip()
    for offset in range(-window, window + 1):
        try:
            expected = compute_totp(secret_b32, step_offset=offset)
            if hmac.compare_digest(expected, code_cleaned):
                return True
        except Exception:
            continue
    return False

def get_totp_uri(secret_b32: str, email: str, issuer: str = "SHAKTISHIELD AI") -> str:
    """Generate standardized otpauth URI for QR code integration."""
    return f"otpauth://totp/{issuer}:{email}?secret={secret_b32}&issuer={issuer}&algorithm=SHA1&digits=6&period=30"

