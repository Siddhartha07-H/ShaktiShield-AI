import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.rate_limit import rate_limit_sos
from app.core.audit import log_audit_event
from app.database.session import get_db
from app.models.user import User
from app.models.contact import TrustedContact
from app.models.incident import SOSIncident
from app.schemas.incident import (
    SOSTriggerRequest, SOSCancelRequest, SOSStatusUpdateRequest,
    IncidentResponse, IncidentDetailResponse
)
from app.services.integrity_service import IntegrityService
from app.services.blockchain_service import BlockchainService
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/sos", tags=["Emergency SOS"])

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit_sos)])
def trigger_sos(
    request: Request,
    payload: SOSTriggerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Trigger Emergency SOS.
    - Captures latitude, longitude, and accuracy if allowed by user
    - Generates unique incident code
    - Calculates canonical SHA-256 integrity hash
    - Anchors hash onto modular blockchain service
    - Records emergency notification in system (Demo Mode)
    """
    now = datetime.now(timezone.utc)
    short_code = str(uuid.uuid4()).replace("-", "")[:8].upper()
    incident_code = f"SOS-{now.strftime('%Y%m%d')}-{short_code}"

    # Calculate SHA-256 integrity hash
    initial_hash = IntegrityService.compute_incident_hash(
        incident_code=incident_code,
        user_id=current_user.id,
        created_at=now,
        latitude=payload.latitude,
        longitude=payload.longitude,
        trigger_type=payload.trigger_type or "MANUAL_BUTTON",
        status="ACTIVE"
    )

    # Modular blockchain anchoring
    blockchain_receipt = BlockchainService.anchor_incident_hash(incident_code, initial_hash)

    # Save to database
    incident = SOSIncident(
        incident_code=incident_code,
        user_id=current_user.id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        accuracy=payload.accuracy,
        address=payload.address,
        description=payload.description or "Emergency SOS Triggered",
        trigger_type=payload.trigger_type or "MANUAL_BUTTON",
        status="ACTIVE",
        integrity_hash=initial_hash,
        blockchain_tx=blockchain_receipt.get("transaction_hash"),
        created_at=now,
        updated_at=now
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Fetch user's trusted contacts
    contacts = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).all()

    # Dispatch alerts (Demo Mode transparently handled)
    NotificationService.dispatch_sos_alert(
        db=db,
        user_id=current_user.id,
        user_name=current_user.full_name,
        incident_code=incident.incident_code,
        contacts=contacts,
        latitude=payload.latitude,
        longitude=payload.longitude
    )

    client_ip = request.client.host if request.client else "unknown"
    log_audit_event(
        db,
        "SOS_TRIGGERED",
        f"SOS incident {incident.incident_code} triggered by {current_user.email} (Lat: {payload.latitude}, Lng: {payload.longitude})",
        current_user.id,
        client_ip
    )

    return incident

@router.get("/history", response_model=List[IncidentResponse])
def get_sos_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve personal SOS incident history for the authenticated user."""
    incidents = db.query(SOSIncident).filter(
        SOSIncident.user_id == current_user.id
    ).order_by(SOSIncident.created_at.desc()).all()
    return incidents

@router.get("/{incident_id}", response_model=IncidentDetailResponse)
def get_sos_detail(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get full details of a specific SOS incident with cryptographic integrity status."""
    incident = db.query(SOSIncident).filter(
        SOSIncident.id == incident_id,
        SOSIncident.user_id == current_user.id
    ).first()

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SOS incident record not found."
        )

    # Cryptographic integrity check
    check = IntegrityService.verify_integrity(
        stored_hash=incident.integrity_hash,
        incident_code=incident.incident_code,
        user_id=incident.user_id,
        created_at=incident.created_at,
        latitude=incident.latitude,
        longitude=incident.longitude,
        trigger_type=incident.trigger_type,
        status=incident.status
    )

    contact_count = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).count()

    return IncidentDetailResponse(
        id=incident.id,
        incident_code=incident.incident_code,
        user_id=incident.user_id,
        latitude=incident.latitude,
        longitude=incident.longitude,
        accuracy=incident.accuracy,
        address=incident.address,
        description=incident.description,
        trigger_type=incident.trigger_type,
        status=incident.status,
        integrity_hash=incident.integrity_hash,
        blockchain_tx=incident.blockchain_tx,
        cancelled_reason=incident.cancelled_reason,
        created_at=incident.created_at,
        updated_at=incident.updated_at,
        user_full_name=current_user.full_name,
        user_phone=current_user.phone,
        user_emergency_notes=current_user.emergency_notes,
        notified_contacts_count=contact_count,
        verification_status=check["status"]
    )

@router.patch("/{incident_id}/cancel", response_model=IncidentResponse)
def cancel_sos(
    incident_id: int,
    cancel_data: SOSCancelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allow user to cancel an active SOS alert with an explicit reason."""
    incident = db.query(SOSIncident).filter(
        SOSIncident.id == incident_id,
        SOSIncident.user_id == current_user.id
    ).first()

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found."
        )

    if incident.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel incident that is already {incident.status}."
        )

    incident.status = "CANCELLED"
    incident.cancelled_reason = cancel_data.reason or "Cancelled by user (Safe)"
    incident.updated_at = datetime.now(timezone.utc)

    # Re-calculate integrity hash reflecting cancelled status
    updated_hash = IntegrityService.compute_incident_hash(
        incident_code=incident.incident_code,
        user_id=incident.user_id,
        created_at=incident.created_at,
        latitude=incident.latitude,
        longitude=incident.longitude,
        trigger_type=incident.trigger_type,
        status=incident.status
    )
    incident.integrity_hash = updated_hash

    db.commit()
    db.refresh(incident)

    log_audit_event(
        db,
        "SOS_CANCELLED",
        f"SOS incident {incident.incident_code} cancelled by {current_user.email}. Reason: {incident.cancelled_reason}",
        current_user.id
    )

    return incident
