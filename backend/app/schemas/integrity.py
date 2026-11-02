from typing import Optional, Any, Dict
from pydantic import BaseModel

class IntegrityVerificationRequest(BaseModel):
    incident_code: str
    tampered_data_test: Optional[Dict[str, Any]] = None

class IntegrityVerificationResponse(BaseModel):
    incident_code: str
    stored_hash: str
    recomputed_hash: str
    is_valid: bool
    status: str
    audit_chain_valid: bool
    blockchain_anchor_id: Optional[str] = None
    verification_details: str
