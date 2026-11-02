from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_admin, generate_invitation_code, hash_invitation_code
from app.core.audit import log_audit_event
from app.database.session import get_db
from app.models.user import User
from app.models.contact import TrustedContact
from app.models.incident import SOSIncident
from app.models.audit import AuditLog
from app.models.admin_invite import AdminInvitationCode
from app.schemas.user import (
    UserResponse, AdminInvitationCreate, AdminInvitationResponse, AdminApprovalAction
)
from app.schemas.incident import IncidentResponse, SOSStatusUpdateRequest
from app.services.integrity_service import IntegrityService

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard"])

@router.get("/dashboard")
def get_admin_dashboard_metrics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
) -> Dict[str, Any]:
    """Retrieve platform-wide telemetry and safety metrics for administrative oversight."""
    total_users = db.query(User).filter(User.role == "user").count()
    total_admins = db.query(User).filter(User.role == "admin", User.approval_status == "APPROVED").count()
    pending_admins = db.query(User).filter(User.role == "admin", User.approval_status == "PENDING_APPROVAL").count()
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
            "total_admins": total_admins,
            "pending_admins": pending_admins,
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
    role_filter: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """List registered users with administrative details (sanitized, no password hashes)."""
    query = db.query(User)
    if role_filter:
        query = query.filter(User.role == role_filter.lower())
    users = query.order_by(User.id.desc()).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(u) for u in users]

@router.get("/pending-admins", response_model=List[UserResponse])
def list_pending_admin_applications(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """List all administrator registrations awaiting manual verification and approval."""
    pending = db.query(User).filter(
        User.role == "admin",
        User.approval_status == "PENDING_APPROVAL"
    ).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in pending]

@router.post("/approve-admin/{target_user_id}", response_model=UserResponse)
def approve_admin_application(
    target_user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Approve a pending administrator application after reviewing authorization reference."""
    target_user = db.query(User).filter(User.id == target_user_id, User.role == "admin").first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrator applicant record not found."
        )

    now = datetime.now(timezone.utc)
    target_user.approval_status = "APPROVED"
    target_user.approved_at = now
    target_user.approved_by_id = admin.id

    db.commit()
    db.refresh(target_user)

    log_audit_event(
        db,
        "ADMIN_APPROVAL_GRANTED",
        f"Administrator {target_user.email} approved by admin {admin.email} (Org: {target_user.organization_name}, Ref: {target_user.authorization_reference})",
        admin.id
    )

    return UserResponse.model_validate(target_user)

@router.post("/reject-admin/{target_user_id}", response_model=UserResponse)
def reject_admin_application(
    target_user_id: int,
    action: AdminApprovalAction,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Reject an unverified administrator application."""
    target_user = db.query(User).filter(User.id == target_user_id, User.role == "admin").first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrator applicant record not found."
        )

    target_user.approval_status = "REJECTED"
    target_user.is_active = False

    db.commit()
    db.refresh(target_user)

    reason = action.rejection_reason or "Authorization credentials could not be verified."
    log_audit_event(
        db,
        "ADMIN_APPROVAL_REJECTED",
        f"Administrator applicant {target_user.email} rejected by admin {admin.email}. Reason: {reason}",
        admin.id
    )

    return UserResponse.model_validate(target_user)

@router.post("/invitations", response_model=AdminInvitationResponse, status_code=status.HTTP_201_CREATED)
def create_admin_invitation_code(
    payload: AdminInvitationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Generate a secure, single-use administrator invitation code.
    Only the SHA-256 digest is stored in the database.
    The plain text code is returned ONLY ONCE in this response.
    """
    raw_code = generate_invitation_code()
    code_digest = hash_invitation_code(raw_code)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=payload.expires_in_hours)

    invitation = AdminInvitationCode(
        code_hash=code_digest,
        organization_name=payload.organization_name,
        created_by_admin_id=admin.id,
        expires_at=expires_at,
        is_used=False
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    log_audit_event(
        db,
        "ADMIN_INVITATION_GENERATED",
        f"Admin invitation token generated for org '{payload.organization_name}' by {admin.email}. Expires in {payload.expires_in_hours}h.",
        admin.id
    )

    return AdminInvitationResponse(
        id=invitation.id,
        organization_name=invitation.organization_name,
        expires_at=invitation.expires_at,
        is_used=invitation.is_used,
        created_at=invitation.created_at,
        invitation_code=raw_code  # Only exposed upon generation!
    )

@router.get("/invitations", response_model=List[AdminInvitationResponse])
def list_admin_invitations(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """List issued admin invitations (hashes are kept hidden)."""
    invitations = db.query(AdminInvitationCode).order_by(AdminInvitationCode.created_at.desc()).all()
    # Ensure invitation_code is null in list view
    return [
        AdminInvitationResponse(
            id=inv.id,
            organization_name=inv.organization_name,
            expires_at=inv.expires_at,
            is_used=inv.is_used,
            created_at=inv.created_at,
            invitation_code=None
        )
        for inv in invitations
    ]

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
    """Administrative status triage for an SOS incident."""
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
