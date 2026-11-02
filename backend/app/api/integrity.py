from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.incident import SOSIncident
from app.schemas.integrity import IntegrityVerificationRequest, IntegrityVerificationResponse
from app.services.integrity_service import IntegrityService

router = APIRouter(prefix="/integrity", tags=["Cryptographic Data Integrity"])

def check_incident_access(incident: SOSIncident, current_user: User):
    """Enforce authorization: only the incident owner or approved admin can inspect integrity details."""
    is_owner = (incident.user_id == current_user.id)
    is_approved_admin = (current_user.role == "admin" and current_user.approval_status == "APPROVED")
    if not (is_owner or is_approved_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You are not authorized to view or verify this incident's cryptographic telemetry."
        )

@router.get("/{incident_code}", response_model=IntegrityVerificationResponse)
def get_incident_integrity(
    incident_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cryptographically verify the integrity of an SOS incident record.
    Requires authentication. Access is strictly restricted to incident owner or authorized administrators.
    Recomputes SHA-256 hash from canonical database values and compares against stored digest.
    """
    incident = db.query(SOSIncident).filter(
        SOSIncident.incident_code == incident_code
    ).first()

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident record not found."
        )

    check_incident_access(incident, current_user)

    verification = IntegrityService.verify_integrity(
        stored_hash=incident.integrity_hash,
        incident_code=incident.incident_code,
        user_id=incident.user_id,
        created_at=incident.created_at,
        latitude=incident.latitude,
        longitude=incident.longitude,
        trigger_type=incident.trigger_type,
        status=incident.status
    )

    return IntegrityVerificationResponse(
        incident_code=incident.incident_code,
        stored_hash=incident.integrity_hash,
        recomputed_hash=verification["recomputed_hash"],
        is_valid=verification["is_valid"],
        status=verification["status"],
        audit_chain_valid=True,
        blockchain_anchor_id=incident.blockchain_tx,
        verification_details=verification["message"]
    )

@router.post("/verify", response_model=IntegrityVerificationResponse)
def verify_arbitrary_record(
    req: IntegrityVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Verify integrity or simulate tampering detection.
    Requires authentication and incident authorization.
    Pass `tampered_data_test` to verify that changing any coordinate or status immediately causes a cryptographic mismatch.
    """
    incident = db.query(SOSIncident).filter(
        SOSIncident.incident_code == req.incident_code
    ).first()

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident record not found."
        )

    check_incident_access(incident, current_user)

    # Use simulated tampered data if provided by caller for testing
    lat = incident.latitude
    lng = incident.longitude
    stat = incident.status
    trig = incident.trigger_type

    if req.tampered_data_test:
        lat = req.tampered_data_test.get("latitude", lat)
        lng = req.tampered_data_test.get("longitude", lng)
        stat = req.tampered_data_test.get("status", stat)
        trig = req.tampered_data_test.get("trigger_type", trig)

    verification = IntegrityService.verify_integrity(
        stored_hash=incident.integrity_hash,
        incident_code=incident.incident_code,
        user_id=incident.user_id,
        created_at=incident.created_at,
        latitude=lat,
        longitude=lng,
        trigger_type=trig,
        status=stat
    )

    return IntegrityVerificationResponse(
        incident_code=incident.incident_code,
        stored_hash=incident.integrity_hash,
        recomputed_hash=verification["recomputed_hash"],
        is_valid=verification["is_valid"],
        status=verification["status"],
        audit_chain_valid=verification["is_valid"],
        blockchain_anchor_id=incident.blockchain_tx,
        verification_details=verification["message"]
    )
