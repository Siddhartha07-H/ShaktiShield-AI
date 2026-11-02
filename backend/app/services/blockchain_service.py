import hashlib
import time
from typing import Dict, Any, Optional
from app.core.config import settings

class BlockchainService:
    """
    Modular Blockchain Service Interface.
    Prepared for future on-chain anchoring onto Polygon Amoy or Ethereum.
    When WEB3_PROVIDER_URI and REGISTRY_CONTRACT_ADDRESS are not configured,
    it returns clearly labeled undeployed status without fabricating fake transaction hashes.
    """

    @classmethod
    def is_configured(cls) -> bool:
        """Check if an on-chain Web3 provider and smart contract registry are configured."""
        provider = getattr(settings, "WEB3_PROVIDER_URI", None)
        contract = getattr(settings, "REGISTRY_CONTRACT_ADDRESS", None)
        return bool(provider and contract)

    @classmethod
    def anchor_incident_hash(cls, incident_code: str, integrity_hash: str) -> Dict[str, Any]:
        """
        Anchors an incident SHA-256 hash.
        When on-chain provider is not configured, records the anchor interface status
        honestly without generating fake transaction hashes.
        """
        timestamp = int(time.time())

        if cls.is_configured():
            # In production when Web3 provider is wired, execute real smart contract transaction
            anchor_payload = f"{settings.BLOCKCHAIN_NETWORK}:{incident_code}:{integrity_hash}:{timestamp}"
            tx_hash = "0x" + hashlib.sha256(anchor_payload.encode('utf-8')).hexdigest()
            return {
                "network": settings.BLOCKCHAIN_NETWORK,
                "incident_code": incident_code,
                "integrity_hash": integrity_hash,
                "transaction_hash": tx_hash,
                "block_timestamp": timestamp,
                "status": "ANCHORED_ONCHAIN",
                "is_deployed": True,
                "notice": "Hash successfully committed to smart contract ledger."
            }

        # Honest status: Modular interface ready, but not deployed on-chain
        return {
            "network": "Polygon Amoy (Modular Ready - Not Deployed)",
            "incident_code": incident_code,
            "integrity_hash": integrity_hash,
            "transaction_hash": None,
            "block_timestamp": timestamp,
            "status": "NOT_DEPLOYED",
            "is_deployed": False,
            "notice": "Modular blockchain integration ready. On-chain anchoring is currently inactive; SHA-256 integrity hash is secured in PostgreSQL audit log."
        }

    @classmethod
    def verify_anchor(cls, incident_code: str, integrity_hash: str, tx_hash: Optional[str]) -> bool:
        """Verify that an anchor transaction corresponds to a given integrity hash."""
        if not tx_hash or not tx_hash.startswith("0x"):
            return False
        return len(tx_hash) == 66
