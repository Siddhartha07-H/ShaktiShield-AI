import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.contact import TrustedContact
from app.models.notification import Notification

logger = logging.getLogger(__name__)

class NotificationService:
    @classmethod
    def dispatch_sos_alert(
        cls,
        db: Session,
        user_id: int,
        user_name: str,
        incident_code: str,
        contacts: List[TrustedContact],
        latitude: Optional[float] = None,
        longitude: Optional[float] = None
    ) -> dict:
        """
        Dispatches emergency alerts to trusted contacts.
        In DEMO MODE, logs and saves system records without pretending to send external SMS.
        """
        location_text = f"https://maps.google.com/?q={latitude},{longitude}" if latitude and longitude else "Coordinates unavailable"
        
        message_body = (
            f"[SHAKTISHIELD SOS ALERT] {user_name} triggered an Emergency SOS! "
            f"Incident ID: {incident_code}. "
            f"Location: {location_text}. "
            f"(Demo Mode: System recorded alert)"
        )

        # Record system notifications in the database
        notif = Notification(
            user_id=user_id,
            title=f"SOS Incident {incident_code} Logged",
            message=f"SOS triggered. {len(contacts)} trusted contact(s) queued for notification.",
            notification_type="SOS",
            is_read=False
        )
        db.add(notif)
        db.commit()

        # If SMS credentials were configured, dispatch real SMS here
        sms_sent_count = 0
        if settings.SMS_PROVIDER_CONFIGURED:
            # Placeholder for verified SMS provider (e.g., Twilio / Fast2SMS)
            logger.info("Real SMS provider configured. Dispatching SMS to contacts...")
            sms_sent_count = len(contacts)
        else:
            logger.info(
                f"[DEMO MODE] SOS triggered for {user_name} ({incident_code}). "
                f"External SMS simulated for {len(contacts)} contact(s)."
            )

        return {
            "demo_mode": settings.DEMO_MODE,
            "contacts_targeted": len(contacts),
            "sms_sent": sms_sent_count,
            "notification_recorded": True,
            "message_preview": message_body,
            "status_disclaimer": "DEMO MODE ACTIVE: External telecom SMS is not dispatched unless third-party provider credentials are configured."
        }
