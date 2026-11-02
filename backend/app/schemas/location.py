from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class LocationStartRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    duration_minutes: Optional[int] = Field(default=60, ge=5, le=1440)

class LocationUpdateRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None

class LocationSessionResponse(BaseModel):
    id: int
    session_code: str
    user_id: int
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    is_active: bool
    expires_at: datetime
    created_at: datetime
    google_maps_url: str

    model_config = ConfigDict(from_attributes=True)
