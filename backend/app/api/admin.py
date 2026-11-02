from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_admin
from app.core.audit import log_audit_event
from app.database.session import get_db
from app.models.user import User
from app.models.contact import TrustedContact
from app.models.incident import SOSIncident
from app.models.audit import AuditLog
from app.schemas.user import UserResponse
from app.schemas.incident import IncidentResponse, SOSStatusUpdateRequest
from app.services.integrity_service import IntegrityService

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard"])

@router.get("/dashboard")
def get_admin_dashboard_metrics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
) -> Dict[str, Any]:
    """Retrieve platform-wide telemetry and safety metrics for administrative oversight."""
    total_users = db.query(User).count()
    total_incidents = db.query(SOSIncident).count()
    active_incidents = db.query(SOSIncident).filter(SOSIncident.status == "ACTIVE").count()
    resolved_incidents = db.query(SOSIncident).filter(SOSIncident.status == "RESOLVED").count()
    cancelled_incidents = db.query(SOSIncident).filter(SOSIncident.status == "CANCELLED").count()
    total_contacts = db.query(TrustedContact).count()
    total_audits = db.query(AuditLog).count()

    recent_incidents = db.query(SOSIncident).order_by(SOSIncident.created_at.desc()).limit(5).all()

    return {
        "metrics": {
            "total_users": total_users,
            "total_incidents": total_incidents,
            "active_incidents": active_incidents,
            "resolved_incidents": resolved_incidents,
            "cancelled_incidents": cancelled_incidents,
            "total_contacts": total_contacts,
            "total_audit_records": total_audits,
        },
        "recent_incidents": [
            {
                "id": inc.id,
                "incident_code": inc.incident_code,
                "user_id": inc.user_id,
                "status": inc.status,
                "trigger_type": inc.trigger_type,
                "created_at": inc.created_at.isoformat(),
                "integrity_hash": inc.integrity_hash,
                "latitude": inc.latitude,
                "longitude": inc.longitude
            }
            for inc in recent_incidents
        ]
    }

@router.get("/users", response_model=List[UserResponse])
def list_registered_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """List registered users with administrative details (sanitized, no password hashes)."""
    users = db.query(User).order_by(User.id.desc()).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(u) for u in users]

@router.get("/incidents", response_model=List[IncidentResponse])
def list_all_incidents(
    status_filter: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """List platform-wide SOS incidents with optional status filter."""
    query = db.query(SOSIncident)
    if status_filter:
        query = query.filter(SOSIncident.status == status_filter.upper())
    incidents = query.order_by(SOSIncident.created_at.desc()).offset(skip).limit(limit).all()
    return incidents

@router.patch("/incidents/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: int,
    payload: SOSStatusUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Administrative status triage for an SOS incident (e.g. marking resolved or cancelled)."""
    incident = db.query(SOSIncident).filter(SOSIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident record not found."
        )

    old_status = incident.status
    incident.status = payload.status
    if payload.note:
        incident.description = f"{incident.description or ''} [Admin note: {payload.note}]"
    incident.updated_at = datetime.now(timezone.utc)

    # Re-calculate integrity hash reflecting status change
    incident.integrity_hash = IntegrityService.compute_incident_hash(
        incident_code=incident.incident_code,
        user_id=incident.user_id,
        created_at=incident.created_at,
        latitude=incident.latitude,
        longitude=incident.longitude,
        trigger_type=incident.trigger_type,
        status=incident.status
    )

    db.commit()
    db.refresh(incident)

    log_audit_event(
        db,
        "ADMIN_INCIDENT_STATUS_CHANGE",
        f"Incident #{incident.id} ({incident.incident_code}) status changed from {old_status} to {payload.status} by admin {admin.email}",
        admin.id
    )

    return incident

@router.get("/audit-logs")
def get_audit_trail(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve immutable platform audit logs for security and compliance review."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]
