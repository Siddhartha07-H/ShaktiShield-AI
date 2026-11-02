import jwt
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User
from app.models.token import RefreshToken, RevokedToken

def get_password_hasher() -> PasswordHasher:
    """Return an Argon2id hasher tailored for production security or fast test execution."""
    if getattr(settings, "TESTING", False):
        return PasswordHasher(
            time_cost=1,
            memory_cost=1024,
            parallelism=1,
            hash_len=32,
            salt_len=16
        )
    return PasswordHasher(
        time_cost=settings.ARGON2_TIME_COST,
        memory_cost=settings.ARGON2_MEMORY_COST,
        parallelism=settings.ARGON2_PARALLELISM,
        hash_len=32,
        salt_len=16
    )

hasher = get_password_hasher()
security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hash a password using Argon2id."""
    return hasher.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against Argon2 hash."""
    try:
        return hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False

def hash_token(raw_token: str) -> str:
    """Compute SHA-256 digest of an opaque token (refresh tokens, invitation codes)."""
    return hashlib.sha256(raw_token.strip().encode("utf-8")).hexdigest()

def hash_invitation_code(code: str) -> str:
    """Compute SHA-256 digest of an admin invitation code."""
    return hash_token(code)

def generate_invitation_code(prefix: str = "SHAKTI-ADM-") -> str:
    """Generate a high-entropy, single-use administrator invitation code (128 bits entropy)."""
    random_part = secrets.token_hex(16).upper()
    return f"{prefix}{random_part}"

def generate_opaque_token(nbytes: int = 32) -> str:
    """Generate a cryptographically secure URL-safe opaque token."""
    return secrets.token_urlsafe(nbytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a short-lived signed JWT access token containing a unique jti."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    jti = secrets.token_hex(16)
    to_encode.update({
        "exp": expire,
        "iat": now,
        "jti": jti,
        "type": "access"
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_mfa_challenge_token(user_id: int, email: str, role: str) -> str:
    """Create a temporary 5-minute token specifically for verifying admin MFA."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.MFA_CHALLENGE_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": expire,
        "iat": now,
        "jti": secrets.token_hex(16),
        "type": "mfa_challenge"
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a signed JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def issue_refresh_token(db: Session, user_id: int) -> str:
    """
    Generate and store a new opaque refresh token for a user.
    Only the SHA-256 digest is stored in the database.
    """
    raw_token = generate_opaque_token(32)
    token_digest = hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    record = RefreshToken(
        user_id=user_id,
        token_hash=token_digest,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return raw_token

def rotate_refresh_token(db: Session, raw_token: str) -> Tuple[User, str]:
    """
    Rotates a refresh token with strict reuse detection:
    - If token is valid: revokes it and issues a new refresh token.
    - If an already-revoked token is used: revokes ALL tokens for that user (compromise mitigation).
    """
    digest = hash_token(raw_token)
    record = db.query(RefreshToken).filter(RefreshToken.token_hash == digest).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token."
        )

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or missing."
        )

    # Reuse detection: If the refresh token was already revoked, an adversary may have stolen it
    if record.is_revoked:
        # Revoke all active refresh tokens for this user
        db.query(RefreshToken).filter(
            RefreshToken.user_id == user.id,
            RefreshToken.is_revoked == False
        ).update({"is_revoked": True})
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Security alert: Compromised refresh token detected. All active sessions have been invalidated."
        )

    # Check expiration
    now = datetime.now(timezone.utc)
    exp = record.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < now:
        record.is_revoked = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired. Please re-authenticate."
        )

    # Issue new refresh token
    new_raw_token = generate_opaque_token(32)
    new_digest = hash_token(new_raw_token)
    new_exp = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    # Invalidate current token and link to replacement
    record.is_revoked = True
    record.replaced_by_hash = new_digest

    new_record = RefreshToken(
        user_id=user.id,
        token_hash=new_digest,
        expires_at=new_exp,
        is_revoked=False
    )
    db.add(new_record)
    db.commit()

    return user, new_raw_token

def revoke_access_token(db: Session, jti: str, user_id: Optional[int], exp_timestamp: int):
    """Add access token's jti to RevokedToken blacklist table."""
    now = datetime.now(timezone.utc)
    exp_dt = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
    
    # Check if already blacklisted
    existing = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
    if not existing:
        blacklisted = RevokedToken(
            jti=jti,
            token_type="access",
            user_id=user_id,
            expires_at=exp_dt,
            revoked_at=now
        )
        db.add(blacklisted)
        db.commit()

def revoke_all_user_tokens(db: Session, user_id: int):
    """Revoke all refresh tokens for a user (on password change, lockout, or explicit full logout)."""
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.is_revoked == False
    ).update({"is_revoked": True})
    db.commit()

def set_auth_cookies(response: Response, access_token: str, refresh_token: Optional[str] = None):
    """Set secure, HttpOnly cookies for session management."""
    # Access token cookie
    response.set_cookie(
        key="shakti_access",
        value=access_token,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    if refresh_token:
        # Refresh token cookie
        response.set_cookie(
            key="shakti_refresh",
            value=refresh_token,
            httponly=True,
            secure=settings.SECURE_COOKIES,
            samesite="lax",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
            path="/api/auth"
        )

def clear_auth_cookies(response: Response):
    """Clear HttpOnly authentication cookies."""
    response.delete_cookie(key="shakti_access", path="/")
    response.delete_cookie(key="shakti_refresh", path="/api/auth")

def get_current_user(
    request: Request,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency to retrieve the authenticated user.
    Checks Authorization: Bearer <token> first, then falls back to HttpOnly cookie 'shakti_access'.
    Verifies token validity, subject, type, and blacklisted status.
    """
    token_str: Optional[str] = None
    if auth and auth.credentials:
        token_str = auth.credentials
    elif "shakti_access" in request.cookies:
        token_str = request.cookies.get("shakti_access")

    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(token_str)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type for resource access",
            headers={"WWW-Authenticate": "Bearer"},
        )

    jti = payload.get("jti")
    if jti:
        # Check token blacklist
        is_revoked = db.query(RevokedToken).filter(RevokedToken.jti == jti).first()
        if is_revoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token subject missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    # Attach raw token and jti to request state for downstream handlers (e.g., logout blacklist)
    request.state.current_token_jti = jti
    request.state.current_token_exp = payload.get("exp")

    return user

def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    FastAPI dependency to ensure the user has administrator role
    AND their approval status is 'APPROVED'.
    Pending, suspended, or rejected administrators are strictly forbidden.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Administrator privileges required.",
        )
    if current_user.approval_status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator account is pending authorization review and approval.",
        )
    return current_user
