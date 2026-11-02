from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log_audit_event(
    db: Session,
    action: str,
    details: str,
    user_id: Optional[int] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """Record an audit trail event for security compliance and transparency."""
    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=ip_address
    )
    db.add(audit_entry)
    try:
        db.commit()
        db.refresh(audit_entry)
    except Exception:
        db.rollback()
    return audit_entry
