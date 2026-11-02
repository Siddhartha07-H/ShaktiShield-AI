from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.incident import SOSIncident
from app.schemas.integrity import IntegrityVerificationRequest, IntegrityVerificationResponse
from app.services.integrity_service import IntegrityService

router = APIRouter(prefix="/integrity", tags=["Cryptographic Data Integrity"])

@router.get("/{incident_code}", response_model=IntegrityVerificationResponse)
def get_incident_integrity(
    incident_code: str,
    db: Session = Depends(get_db)
):
    """
    Cryptographically verify the integrity of an SOS incident record.
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
    db: Session = Depends(get_db)
):
    """
    Verify integrity or simulate tampering detection.
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
