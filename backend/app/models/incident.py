from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class SOSIncident(Base):
    __tablename__ = "sos_incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    address = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    trigger_type = Column(String(50), default="MANUAL_BUTTON", nullable=False)
    status = Column(String(30), default="ACTIVE", nullable=False, index=True)  # ACTIVE, RESOLVED, CANCELLED
    integrity_hash = Column(String(64), nullable=False, index=True)  # SHA-256 hash
    blockchain_tx = Column(String(100), nullable=True)
    cancelled_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="incidents")
