from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    full_name: str = Field(..., min_length=2, max_length=150)
    phone: Optional[str] = None
    terms_accepted: bool = Field(True, description="Acceptance of terms and privacy policy")
    blood_type: Optional[str] = None
    emergency_notes: Optional[str] = None

class AdminRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=30)
    organization_name: str = Field(..., min_length=2, max_length=200)
    authorization_reference: str = Field(..., min_length=3, max_length=100)
    invitation_code: str = Field(..., min_length=6, max_length=64)
    license_document_url: Optional[str] = None
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = False

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    blood_type: Optional[str] = None
    emergency_notes: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    approval_status: str
    organization_name: Optional[str] = None
    authorization_reference: Optional[str] = None
    approved_at: Optional[datetime] = None
    approved_by_id: Optional[int] = None
    blood_type: Optional[str] = None
    emergency_notes: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetResponse(BaseModel):
    message: str
    status: str

class AdminInvitationCreate(BaseModel):
    organization_name: Optional[str] = None
    expires_in_hours: int = Field(default=72, ge=1, le=720)

class AdminInvitationResponse(BaseModel):
    id: int
    organization_name: Optional[str] = None
    expires_at: datetime
    is_used: bool
    created_at: datetime
    invitation_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class AdminApprovalAction(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None
