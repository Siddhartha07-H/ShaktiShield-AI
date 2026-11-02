from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=True)
    role = Column(String(20), default="user", nullable=False)  # "user" or "admin"
    approval_status = Column(String(30), default="APPROVED", nullable=False)  # "APPROVED", "PENDING_APPROVAL", "REJECTED", "SUSPENDED"
    organization_name = Column(String(200), nullable=True)
    authorization_reference = Column(String(100), nullable=True)
    license_document_url = Column(String(255), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    approved_by_id = Column(Integer, nullable=True)
    blood_type = Column(String(10), nullable=True)
    emergency_notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(64), nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    contacts = relationship("TrustedContact", back_populates="user", cascade="all, delete-orphan")
    incidents = relationship("SOSIncident", back_populates="user", cascade="all, delete-orphan")
    location_sessions = relationship("LocationSession", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
