import uuid
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.audit import log_audit_event
from app.database.session import get_db
from app.models.user import User
from app.models.location import LocationSession
from app.schemas.location import (
    LocationStartRequest, LocationUpdateRequest, LocationSessionResponse
)

router = APIRouter(prefix="/location", tags=["Live Location Sharing"])

def format_location_response(session: LocationSession) -> LocationSessionResponse:
    maps_url = f"https://www.google.com/maps?q={session.latitude},{session.longitude}"
    return LocationSessionResponse(
        id=session.id,
        session_code=session.session_code,
        user_id=session.user_id,
        latitude=session.latitude,
        longitude=session.longitude,
        accuracy=session.accuracy,
        is_active=session.is_active,
        expires_at=session.expires_at,
        created_at=session.created_at,
        google_maps_url=maps_url
    )

@router.post("/start", response_model=LocationSessionResponse, status_code=status.HTTP_201_CREATED)
def start_location_session(
    payload: LocationStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Start a live location sharing session.
    - User explicit permission required
    - Session automatically expires after duration_minutes (default 60 mins)
    """
    # Deactivate existing active sessions for this user
    db.query(LocationSession).filter(
        LocationSession.user_id == current_user.id,
        LocationSession.is_active == True
    ).update({"is_active": False})
    db.commit()

    now = datetime.now(timezone.utc)
    duration = payload.duration_minutes or 60
    expires_at = now + timedelta(minutes=duration)
    session_code = f"LOC-{str(uuid.uuid4())[:8].upper()}"

    session = LocationSession(
        session_code=session_code,
        user_id=current_user.id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        accuracy=payload.accuracy,
        is_active=True,
        expires_at=expires_at,
        created_at=now,
        updated_at=now
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    log_audit_event(
        db,
        "LOCATION_SHARING_STARTED",
        f"Live location session started ({session.session_code}) expiring at {expires_at.isoformat()}",
        current_user.id
    )

    return format_location_response(session)

@router.get("/active", response_model=Optional[LocationSessionResponse])
def get_user_active_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve the currently active location session for the authenticated user, if not expired."""
    session = (
        db.query(LocationSession)
        .filter(
            LocationSession.user_id == current_user.id,
            LocationSession.is_active == True
        )
        .order_by(LocationSession.created_at.desc())
        .first()
    )
    if not session:
        return None

    now = datetime.now(timezone.utc)
    exp = session.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)

    if now > exp:
        session.is_active = False
        db.commit()
        return None

    return format_location_response(session)

@router.get("/history", response_model=List[LocationSessionResponse])
def get_user_location_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve history of location sharing sessions for authenticated user."""
    sessions = (
        db.query(LocationSession)
        .filter(LocationSession.user_id == current_user.id)
        .order_by(LocationSession.created_at.desc())
        .limit(limit)
        .all()
    )
    return [format_location_response(s) for s in sessions]

@router.get("/{session_code}", response_model=LocationSessionResponse)
def get_location_session(
    session_code: str,
    db: Session = Depends(get_db)
):
    """
    Get current location information for a given active session code.
    Accessible to trusted contacts holding the live link.
    """
    session = db.query(LocationSession).filter(
        LocationSession.session_code == session_code
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location session not found."
        )

    # Check expiration
    now = datetime.now(timezone.utc)
    # Ensure timezone awareness for comparison
    expires_at = session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now > expires_at or not session.is_active:
        session.is_active = False
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This location sharing session has expired or was terminated by the user."
        )

    return format_location_response(session)

@router.patch("/{session_code}/ping", response_model=LocationSessionResponse)
def update_location_ping(
    session_code: str,
    payload: LocationUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update coordinates of an active location sharing session."""
    session = db.query(LocationSession).filter(
        LocationSession.session_code == session_code,
        LocationSession.user_id == current_user.id
    ).first()

    if not session or not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active session not found."
        )

    session.latitude = payload.latitude
    session.longitude = payload.longitude
    if payload.accuracy is not None:
        session.accuracy = payload.accuracy
    session.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(session)
    return format_location_response(session)

@router.post("/{session_code}/stop")
def stop_location_session(
    session_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stop live location sharing."""
    session = db.query(LocationSession).filter(
        LocationSession.session_code == session_code,
        LocationSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location session not found."
        )

    session.is_active = False
    session.updated_at = datetime.now(timezone.utc)
    db.commit()

    log_audit_event(
        db,
        "LOCATION_SHARING_STOPPED",
        f"Location sharing session {session_code} explicitly stopped by user",
        current_user.id
    )

    return {"message": "Live location sharing stopped successfully.", "session_code": session_code}
