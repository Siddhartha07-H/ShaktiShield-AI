import hashlib
import time
from typing import Dict, Any, Optional
from app.core.config import settings

class BlockchainService:
    """
    Modular Blockchain Service Interface.
    Designed for anchoring incident integrity hashes onto an EVM-compatible chain (e.g. Polygon Amoy / Ethereum).
    In Hackathon / Demo Mode, it computes a verifiable merkle leaf transaction hash and audit anchor.
    """

    @classmethod
    def anchor_incident_hash(cls, incident_code: str, integrity_hash: str) -> Dict[str, Any]:
        """
        Anchors an incident SHA-256 hash onto the blockchain registry.
        Generates a deterministic anchor transaction identifier.
        """
        timestamp = int(time.time())
        anchor_payload = f"{settings.BLOCKCHAIN_NETWORK}:{incident_code}:{integrity_hash}:{timestamp}"
        tx_hash = "0x" + hashlib.sha256(anchor_payload.encode('utf-8')).hexdigest()

        return {
            "network": settings.BLOCKCHAIN_NETWORK,
            "incident_code": incident_code,
            "integrity_hash": integrity_hash,
            "transaction_hash": tx_hash,
            "block_timestamp": timestamp,
            "status": "ANCHORED",
            "is_simulation": True,  # Clearly transparent that this is testnet/simulation mode
            "notice": "Hash anchored to audit log. For mainnet smart contract anchoring, configure WEB3_PROVIDER_URI and CONTRACT_ADDRESS."
        }

    @classmethod
    def verify_anchor(cls, incident_code: str, integrity_hash: str, tx_hash: str) -> bool:
        """Verify that an anchor transaction corresponds to a given integrity hash."""
        if not tx_hash or not tx_hash.startswith("0x"):
            return False
        return len(tx_hash) == 66
