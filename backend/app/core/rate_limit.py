import time
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from threading import Lock
from typing import Optional
from fastapi import Request, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.core.audit import log_audit_event

class InMemoryRateLimiter:
    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.client_records = defaultdict(list)
        self.lock = Lock()

    def check(self, key: str):
        now = time.time()
        with self.lock:
            timestamps = self.client_records[key]
            # Prune timestamps older than window
            cutoff = now - self.window_seconds
            valid_timestamps = [t for t in timestamps if t > cutoff]
            if len(valid_timestamps) >= self.requests_limit:
                retry_after = int(valid_timestamps[0] + self.window_seconds - now) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Please wait {retry_after} seconds before trying again.",
                    headers={"Retry-After": str(retry_after)}
                )
            valid_timestamps.append(now)
            self.client_records[key] = valid_timestamps

# Rate limiters for different sensitive workflows
login_limiter = InMemoryRateLimiter(requests_limit=10, window_seconds=60)          # 10 attempts per minute
admin_login_limiter = InMemoryRateLimiter(requests_limit=5, window_seconds=60)     # 5 admin login attempts per minute
sos_limiter = InMemoryRateLimiter(requests_limit=5, window_seconds=60)             # 5 SOS triggers per minute
register_limiter = InMemoryRateLimiter(requests_limit=8, window_seconds=60)        # 8 registrations per minute
refresh_limiter = InMemoryRateLimiter(requests_limit=20, window_seconds=60)        # 20 refresh token calls per minute
location_limiter = InMemoryRateLimiter(requests_limit=30, window_seconds=60)       # 30 location pings per minute
ai_limiter = InMemoryRateLimiter(requests_limit=15, window_seconds=60)             # 15 AI risk queries per minute
password_reset_limiter = InMemoryRateLimiter(requests_limit=5, window_seconds=60) # 5 reset requests per minute

def get_client_ip(request: Request) -> str:
    """Extract real client IP considering forward headers."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def rate_limit_login(request: Request):
    client_ip = get_client_ip(request)
    login_limiter.check(f"login_{client_ip}")

def rate_limit_admin_login(request: Request):
    client_ip = get_client_ip(request)
    admin_login_limiter.check(f"admin_login_{client_ip}")

def rate_limit_sos(request: Request):
    client_ip = get_client_ip(request)
    sos_limiter.check(f"sos_{client_ip}")

def rate_limit_register(request: Request):
    client_ip = get_client_ip(request)
    register_limiter.check(f"register_{client_ip}")

def rate_limit_refresh(request: Request):
    client_ip = get_client_ip(request)
    refresh_limiter.check(f"refresh_{client_ip}")

def rate_limit_location(request: Request):
    client_ip = get_client_ip(request)
    location_limiter.check(f"loc_{client_ip}")

def rate_limit_ai(request: Request):
    client_ip = get_client_ip(request)
    ai_limiter.check(f"ai_{client_ip}")

def rate_limit_password_reset(request: Request):
    client_ip = get_client_ip(request)
    password_reset_limiter.check(f"reset_{client_ip}")

def check_account_lockout(user: Optional[User]) -> None:
    """Check if account is temporarily locked due to repeated failed login attempts."""
    if not user:
        return
    if user.locked_until:
        now = datetime.now(timezone.utc)
        locked_until = user.locked_until
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        if now < locked_until:
            wait_seconds = int((locked_until - now).total_seconds()) + 1
            wait_minutes = max(1, wait_seconds // 60)
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Account temporarily locked due to excessive failed sign-in attempts. Please try again in {wait_minutes} minute(s)."
            )

def handle_failed_login(db: Session, user: Optional[User], email: str, client_ip: str) -> None:
    """Increment failed login attempts and lock account if threshold is reached."""
    if not user:
        return
    user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
    if user.failed_login_attempts >= settings.MAX_FAILED_LOGIN_ATTEMPTS:
        user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCOUNT_LOCKOUT_MINUTES)
        log_audit_event(
            db,
            "AUTH_ACCOUNT_LOCKED",
            f"Account locked for {settings.ACCOUNT_LOCKOUT_MINUTES}m after {user.failed_login_attempts} failed attempts: {email}",
            user.id,
            client_ip
        )
    db.commit()

def handle_successful_login(db: Session, user: User) -> None:
    """Reset failed login attempts counter on successful authentication."""
    if user.failed_login_attempts != 0 or user.locked_until is not None:
        user.failed_login_attempts = 0
        user.locked_until = None
        db.commit()
