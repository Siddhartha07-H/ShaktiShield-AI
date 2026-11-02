import hashlib
import json
from datetime import datetime
from typing import Optional, Dict, Any

class IntegrityService:
    @staticmethod
    def generate_canonical_payload(
        incident_code: str,
        user_id: int,
        created_at_iso: str,
        latitude: Optional[float],
        longitude: Optional[float],
        trigger_type: str,
        status: str
    ) -> str:
        """Create a deterministic, canonical JSON representation of incident data for hashing."""
        payload = {
            "incident_code": str(incident_code),
            "user_id": int(user_id),
            "created_at": str(created_at_iso),
            "latitude": round(float(latitude), 6) if latitude is not None else None,
            "longitude": round(float(longitude), 6) if longitude is not None else None,
            "trigger_type": str(trigger_type).upper(),
            "status": str(status).upper()
        }
        return json.dumps(payload, sort_keys=True, separators=(',', ':'))

    @classmethod
    def calculate_sha256_hash(cls, canonical_payload: str) -> str:
        """Calculate SHA-256 digest of canonical payload."""
        return hashlib.sha256(canonical_payload.encode('utf-8')).hexdigest()

    @classmethod
    def compute_incident_hash(
        cls,
        incident_code: str,
        user_id: int,
        created_at: datetime,
        latitude: Optional[float],
        longitude: Optional[float],
        trigger_type: str,
        status: str
    ) -> str:
        """Convenience method to compute incident hash from model attributes."""
        iso_str = created_at.strftime("%Y-%m-%dT%H:%M:%SZ") if isinstance(created_at, datetime) else str(created_at)
        canonical = cls.generate_canonical_payload(
            incident_code=incident_code,
            user_id=user_id,
            created_at_iso=iso_str,
            latitude=latitude,
            longitude=longitude,
            trigger_type=trigger_type,
            status=status
        )
        return cls.calculate_sha256_hash(canonical)

    @classmethod
    def verify_integrity(
        cls,
        stored_hash: str,
        incident_code: str,
        user_id: int,
        created_at: datetime,
        latitude: Optional[float],
        longitude: Optional[float],
        trigger_type: str,
        status: str
    ) -> Dict[str, Any]:
        """Verify whether an incident record has been altered or tampered with."""
        recomputed = cls.compute_incident_hash(
            incident_code=incident_code,
            user_id=user_id,
            created_at=created_at,
            latitude=latitude,
            longitude=longitude,
            trigger_type=trigger_type,
            status=status
        )
        is_valid = (recomputed == stored_hash)
        return {
            "is_valid": is_valid,
            "stored_hash": stored_hash,
            "recomputed_hash": recomputed,
            "status": "TAMPER_FREE" if is_valid else "CORRUPTED_OR_TAMPERED",
            "message": "Incident record integrity cryptographically verified." if is_valid else "INTEGRITY WARNING: Hash mismatch detected! Record may have been modified directly in the database."
        }
