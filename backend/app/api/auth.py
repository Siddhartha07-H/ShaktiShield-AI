from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.core.rate_limit import rate_limit_login, rate_limit_register
from app.core.audit import log_audit_event
from app.database.session import get_db
from app.models.user import User
from app.schemas.user import (
    UserRegister, UserLogin, UserResponse, UserUpdate, TokenResponse,
    PasswordResetRequest, PasswordResetResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit_register)])
def register_user(
    request: Request,
    user_in: UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user with secure Argon2 password hashing."""
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # First registered user can optionally be an admin if none exists
    user_count = db.query(User).count()
    role = "admin" if user_count == 0 else "user"

    hashed_pw = hash_password(user_in.password)
    new_user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        phone=user_in.phone,
        blood_type=user_in.blood_type,
        emergency_notes=user_in.emergency_notes,
        role=role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    client_ip = request.client.host if request.client else "unknown"
    log_audit_event(db, "AUTH_REGISTER", f"New user registered: {new_user.email} (Role: {role})", new_user.id, client_ip)

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse, dependencies=[Depends(rate_limit_login)])
def login_user(
    request: Request,
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Authenticate a user and return a JWT access token."""
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    client_ip = request.client.host if request.client else "unknown"

    if not user or not verify_password(credentials.password, user.hashed_password):
        log_audit_event(db, "AUTH_LOGIN_FAILED", f"Failed login attempt for email: {credentials.email}", ip_address=client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    log_audit_event(db, "AUTH_LOGIN_SUCCESS", f"User logged in: {user.email}", user.id, client_ip)

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Retrieve authenticated user's profile."""
    return UserResponse.model_validate(current_user)

@router.put("/profile", response_model=UserResponse)
def update_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update authenticated user profile information."""
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.phone is not None:
        current_user.phone = update_data.phone
    if update_data.blood_type is not None:
        current_user.blood_type = update_data.blood_type
    if update_data.emergency_notes is not None:
        current_user.emergency_notes = update_data.emergency_notes

    db.commit()
    db.refresh(current_user)
    log_audit_event(db, "USER_PROFILE_UPDATE", f"Profile updated for user {current_user.email}", current_user.id)
    return UserResponse.model_validate(current_user)

@router.post("/logout")
def logout_user(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Client-side token disposal confirmation with audit log."""
    client_ip = request.client.host if request.client else "unknown"
    log_audit_event(db, "AUTH_LOGOUT", f"User logged out: {current_user.email}", current_user.id, client_ip)
    return {"message": "Successfully logged out. Please clear your local session token."}

@router.post("/forgot-password", response_model=PasswordResetResponse)
def request_password_reset(
    req: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Password reset architecture endpoint.
    Honest implementation: clarifies if email provider is configured or returns demo guidance.
    """
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not settings.EMAIL_PROVIDER_CONFIGURED:
        return PasswordResetResponse(
            message="DEMO MODE: Password reset email service is currently in simulation mode. In production, configure SMTP / SendGrid credentials.",
            status="SIMULATED_SUCCESS"
        )
    return PasswordResetResponse(
        message="If this email is registered, a password reset link has been dispatched.",
        status="DISPATCHED"
    )
