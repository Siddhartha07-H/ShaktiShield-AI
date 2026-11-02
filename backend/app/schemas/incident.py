from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class SOSTriggerRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    address: Optional[str] = None
    description: Optional[str] = "Emergency SOS triggered by user"
    trigger_type: Optional[str] = "MANUAL_BUTTON"

class SOSCancelRequest(BaseModel):
    reason: Optional[str] = "False alarm or user safe"

class SOSStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(ACTIVE|RESOLVED|CANCELLED)$")
    note: Optional[str] = None

class IncidentResponse(BaseModel):
    id: int
    incident_code: str
    user_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    address: Optional[str] = None
    description: Optional[str] = None
    trigger_type: str
    status: str
    integrity_hash: str
    blockchain_tx: Optional[str] = None
    cancelled_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IncidentDetailResponse(IncidentResponse):
    user_full_name: Optional[str] = None
    user_phone: Optional[str] = None
    user_emergency_notes: Optional[str] = None
    notified_contacts_count: int = 0
    verification_status: Optional[str] = "VERIFIED_VALID"
