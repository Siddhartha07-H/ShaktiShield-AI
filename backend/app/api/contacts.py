from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.audit import log_audit_event
from app.database.session import get_db
from app.models.user import User
from app.models.contact import TrustedContact
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse

router = APIRouter(prefix="/contacts", tags=["Trusted Contacts"])

@router.get("", response_model=List[ContactResponse])
def get_user_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all trusted emergency contacts for the authenticated user."""
    contacts = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).order_by(TrustedContact.is_primary.desc(), TrustedContact.id.asc()).all()
    return contacts

@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact_in: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new trusted emergency contact."""
    # If set as primary, unset any existing primary contact
    if contact_in.is_primary:
        db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).update({"is_primary": False})
        db.commit()

    new_contact = TrustedContact(
        user_id=current_user.id,
        name=contact_in.name,
        phone=contact_in.phone,
        relationship=contact_in.relationship,
        email=contact_in.email,
        is_primary=contact_in.is_primary
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)

    log_audit_event(db, "CONTACT_CREATED", f"Added contact: {new_contact.name} ({new_contact.phone})", current_user.id)
    return new_contact

@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int,
    contact_in: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update details of an existing trusted contact."""
    contact = db.query(TrustedContact).filter(
        TrustedContact.id == contact_id,
        TrustedContact.user_id == current_user.id
    ).first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trusted contact not found."
        )

    if contact_in.is_primary:
        db.query(TrustedContact).filter(
            TrustedContact.user_id == current_user.id,
            TrustedContact.id != contact_id
        ).update({"is_primary": False})

    update_data = contact_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)
    log_audit_event(db, "CONTACT_UPDATED", f"Updated contact #{contact.id}: {contact.name}", current_user.id)
    return contact

@router.delete("/{contact_id}", status_code=status.HTTP_200_OK)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a trusted contact."""
    contact = db.query(TrustedContact).filter(
        TrustedContact.id == contact_id,
        TrustedContact.user_id == current_user.id
    ).first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trusted contact not found."
        )

    db.delete(contact)
    db.commit()
    log_audit_event(db, "CONTACT_DELETED", f"Deleted contact #{contact_id}", current_user.id)
    return {"message": "Contact deleted successfully."}
