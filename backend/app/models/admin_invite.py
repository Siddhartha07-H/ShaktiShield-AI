from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database.session import Base

class AdminInvitationCode(Base):
    __tablename__ = "admin_invitation_codes"

    id = Column(Integer, primary_key=True, index=True)
    code_hash = Column(String(64), unique=True, index=True, nullable=False)
    organization_name = Column(String(200), nullable=True)
    created_by_admin_id = Column(Integer, nullable=True)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    used_by_user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
