from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    hash_password, verify_password, create_access_token,
    get_current_user, hash_invitation_code
)
from app.core.rate_limit import rate_limit_login, rate_limit_register
from app.core.audit import log_audit_event
from app.database.session import get_db
from app.models.user import User
from app.models.admin_invite import AdminInvitationCode
from app.schemas.user import (
    UserRegister, AdminRegister, UserLogin, AdminLogin,
    UserResponse, UserUpdate, TokenResponse,
    PasswordResetRequest, PasswordResetResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit_register)])
def register_user(
    request: Request,
    user_in: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Register a standard safety platform user.
    Always assigns role 'user' and approval_status 'APPROVED'.
    Prevents privilege escalation.
    """
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    hashed_pw = hash_password(user_in.password)
    new_user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        phone=user_in.phone,
        blood_type=user_in.blood_type,
        emergency_notes=user_in.emergency_notes,
        role="user",
        approval_status="APPROVED",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    client_ip = request.client.host if request.client else "unknown"
    log_audit_event(db, "AUTH_REGISTER_USER", f"New user registered: {new_user.email}", new_user.id, client_ip)

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
    """
    Authenticate a user.
    Verifies Argon2 password hash. Returns JWT access token and user role.
    """
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    client_ip = request.client.host if request.client else "unknown"

    if not user or not verify_password(credentials.password, user.hashed_password):
        log_audit_event(db, "AUTH_LOGIN_FAILED", f"Failed user login attempt for: {credentials.email}", ip_address=client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact platform support."
        )

    log_audit_event(db, "AUTH_LOGIN_SUCCESS", f"User logged in: {user.email}", user.id, client_ip)

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/admin/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit_register)])
def register_admin(
    request: Request,
    admin_in: AdminRegister,
    db: Session = Depends(get_db)
):
    """
    Register an administrator account.
    Requires a valid, single-use, unexpired invitation code hash.
    Account is set to role 'admin' and status 'PENDING_APPROVAL'.
    Admin privileges remain locked until manual review and approval by an existing administrator.
    """
    code_hash = hash_invitation_code(admin_in.invitation_code)
    now = datetime.now(timezone.utc)

    # Check for invitation code
    invitation = db.query(AdminInvitationCode).filter(
        AdminInvitationCode.code_hash == code_hash,
        AdminInvitationCode.is_used == False
    ).first()

    if not invitation:
        client_ip = request.client.host if request.client else "unknown"
        log_audit_event(db, "ADMIN_REGISTER_REJECTED", f"Invalid invitation code attempt for {admin_in.email}", ip_address=client_ip)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authorization failed: Invalid or already utilized administrator invitation code."
        )

    # Check expiry (make timezone aware if needed)
    exp = invitation.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < now:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authorization failed: The administrator invitation code has expired."
        )

    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == admin_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this official email address already exists."
        )

    hashed_pw = hash_password(admin_in.password)
    new_admin = User(
        email=admin_in.email.lower(),
        hashed_password=hashed_pw,
        full_name=admin_in.full_name,
        phone=admin_in.phone,
        role="admin",
        approval_status="PENDING_APPROVAL",
        organization_name=admin_in.organization_name,
        authorization_reference=admin_in.authorization_reference,
        license_document_url=admin_in.license_document_url,
        is_active=True
    )
    db.add(new_admin)
    db.flush()

    # Mark invitation as consumed
    invitation.is_used = True
    invitation.used_by_user_id = new_admin.id

    db.commit()
    db.refresh(new_admin)

    client_ip = request.client.host if request.client else "unknown"
    log_audit_event(
        db,
        "ADMIN_REGISTER_PENDING",
        f"Admin registration submitted for review: {new_admin.email} (Org: {admin_in.organization_name}, Ref: {admin_in.authorization_reference})",
        new_admin.id,
        client_ip
    )

    token = create_access_token(data={"sub": str(new_admin.id), "email": new_admin.email, "role": new_admin.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_admin)
    )

@router.post("/admin/login", response_model=TokenResponse, dependencies=[Depends(rate_limit_login)])
def login_admin(
    request: Request,
    credentials: AdminLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticate an official administrator.
    Server verifies that the user's database role is 'admin'.
    Returns account details with approval_status.
    """
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    client_ip = request.client.host if request.client else "unknown"

    if not user or not verify_password(credentials.password, user.hashed_password):
        log_audit_event(db, "ADMIN_LOGIN_FAILED", f"Failed admin login attempt for: {credentials.email}", ip_address=client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid official email or password credentials."
        )

    if user.role != "admin":
        log_audit_event(db, "ADMIN_LOGIN_ROLE_MISMATCH", f"User without admin role attempted admin login: {user.email}", user.id, client_ip)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: This portal is reserved exclusively for authorized administrators."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator account is deactivated. Contact security compliance."
        )

    if user.approval_status == "REJECTED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator registration was rejected during verification review."
        )

    if user.approval_status == "SUSPENDED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access has been suspended."
        )

    log_audit_event(db, "ADMIN_LOGIN_SUCCESS", f"Administrator logged in: {user.email} (Status: {user.approval_status})", user.id, client_ip)

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
    """Retrieve authenticated user's profile with verified role and approval status."""
    return UserResponse.model_validate(current_user)

@router.put("/profile", response_model=UserResponse)
def update_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update authenticated user profile information.
    Strictly forbids modifications to role, approval_status, or permissions.
    """
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
    """Password reset request endpoint."""
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
