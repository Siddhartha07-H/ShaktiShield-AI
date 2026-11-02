# CRYPTOGRAPHIC DATA INTEGRITY & BLOCKCHAIN SPECIFICATION

## 1. The Evidentiary Integrity Problem

During legal proceedings, criminal trials, or forensic inquiries following assault, stalking, or harassment, digital evidence (timestamps, distress coordinates, message logs) is frequently challenged under the Indian Evidence Act (and Bharatiya Sakshya Adhiniyam) on grounds of:
1. Potential database tampering by administrators.
2. Inaccurate or retroactively modified coordinate logs.
3. Repudiation by parties claiming notifications were never dispatched.

SHAKTISHIELD AI solves this through a dual-layer cryptographic proof architecture:
1. **Canonical JSON Serialization & SHA-256 Digesting** (In-Application Proof).
2. **Modular Merkle Tree & EVM Blockchain Anchoring** (Decentralized Non-Repudiation Layer).

---

## 2. Canonical JSON Serialization

To ensure consistent hashing across diverse operating systems and programming languages, incident fields are serialized into a strict canonical format:

```json
{
  "created_at": "2026-11-02T10:15:30Z",
  "incident_code": "SOS-20261102-A1B2C3D4",
  "latitude": 28.6139,
  "longitude": 77.209,
  "status": "ACTIVE",
  "trigger_type": "MANUAL_BUTTON",
  "user_id": 1
}
```

Rules:
- Keys sorted lexicographically in alphabetical order.
- No extraneous whitespace between separators: `separators=(',', ':')`.
- Float values rounded to 6 decimal places (~0.11m precision).
- Status and trigger types converted to uppercase.

---

## 3. SHA-256 Digest Generation

The canonical UTF-8 bytes are passed to SHA-256:

$$\text{IntegrityHash} = \text{SHA-256}(\text{CanonicalPayload})$$

Resulting in a 64-character hexadecimal digest:
```
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

When verified, the backend re-reads the database attributes, re-generates the canonical JSON, and recalculates the hash. If an attacker or compromised database administrator modifies even one digit of latitude (e.g. from `28.6139` to `28.6140`), the recomputed hash diverges entirely, immediately flagging the record as `CORRUPTED_OR_TAMPERED`.

---

## 4. Modular Blockchain Anchor Architecture

ShaktiShield AI separates application business logic from decentralized smart contracts via the `BlockchainService` interface.

```
+------------------------------------------------------------+
|                    ShaktiShield FastAPI                    |
|                             |                              |
|                   compute_incident_hash()                  |
|                             |                              |
|                             v                              |
|                  BlockchainService Anchor                  |
+-----------------------------+------------------------------+
                              |
              +---------------+---------------+
              |                               |
              v                               v
    [Hackathon Demo Mode]         [Production Web3 Anchor]
    Deterministic Hash Root       Polygon Amoy / Ethereum
    Simulated Receipt 0x...       Smart Contract Call:
                                  anchorIncident(code, hash)
```

In Hackathon / Demo Mode, the service deterministically computes a 32-byte transaction root:
```python
anchor_payload = f"{NETWORK}:{incident_code}:{integrity_hash}:{timestamp}"
tx_hash = "0x" + hashlib.sha256(anchor_payload.encode('utf-8')).hexdigest()
```

This provides immediate visual traceability and audit demonstration without incurring testnet faucet rate-limits or mainnet gas fees.

For production smart contract deployment:
1. Deploy `ShaktiRegistry.sol` to Polygon Amoy Testnet.
2. Set `WEB3_PROVIDER_URI` and `REGISTRY_CONTRACT_ADDRESS` in `.env`.
3. The `BlockchainService` automatically dispatches contract calls using `web3.py`.
