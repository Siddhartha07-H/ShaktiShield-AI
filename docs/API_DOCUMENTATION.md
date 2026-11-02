# SHAKTISHIELD AI - REST API DOCUMENTATION

Base Path: `/api`  
Interactive Swagger Docs: `http://localhost:8000/docs`  
ReDoc Documentation: `http://localhost:8000/redoc`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user profile with Argon2id password hashing. Automatically grants `admin` role to the very first registered user.

**Request Body:**
```json
{
  "email": "aarohi@example.com",
  "password": "SecurePassword123!",
  "full_name": "Aarohi Sharma",
  "phone": "+919876543210",
  "blood_type": "B+",
  "emergency_notes": "Asthmatic, carries salbutamol inhaler."
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "aarohi@example.com",
    "full_name": "Aarohi Sharma",
    "phone": "+919876543210",
    "role": "user",
    "blood_type": "B+",
    "emergency_notes": "Asthmatic...",
    "is_active": true,
    "created_at": "2026-11-02T10:00:00Z"
  }
}
```

### `POST /api/auth/login`
Authenticates credentials and returns a JWT access token.

**Request Body:**
```json
{
  "email": "aarohi@example.com",
  "password": "SecurePassword123!"
}
```

### `GET /api/auth/me`
*Headers: `Authorization: Bearer <token>`*  
Returns current authenticated user profile.

### `PUT /api/auth/profile`
*Headers: `Authorization: Bearer <token>`*  
Updates user contact info, blood group, or medical emergency notes.

---

## 2. Trusted Contacts Endpoints

### `GET /api/contacts`
*Headers: `Authorization: Bearer <token>`*  
Retrieves list of registered emergency contacts for the user.

### `POST /api/contacts`
*Headers: `Authorization: Bearer <token>`*  
Adds a new trusted contact. If `is_primary: true`, previous primary contact is automatically unset.

```json
{
  "name": "Priya Sharma",
  "phone": "+919822334455",
  "relationship": "Sister",
  "email": "priya@example.com",
  "is_primary": true
}
```

### `PUT /api/contacts/{contact_id}`
Updates an existing contact's information.

### `DELETE /api/contacts/{contact_id}`
Removes an emergency contact.

---

## 3. Emergency SOS Endpoints

### `POST /api/sos`
*Headers: `Authorization: Bearer <token>`*  
Triggers emergency protocol, captures coordinates, computes SHA-256 digest, and logs notification.

```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "accuracy": 12.5,
  "address": "Connaught Place, New Delhi",
  "description": "Emergency SOS Triggered",
  "trigger_type": "MANUAL_BUTTON"
}
```

**Response (201 Created):**
```json
{
  "id": 14,
  "incident_code": "SOS-20261102-A1B2C3D4",
  "user_id": 1,
  "latitude": 28.6139,
  "longitude": 77.2090,
  "accuracy": 12.5,
  "address": "Connaught Place, New Delhi",
  "description": "Emergency SOS Triggered",
  "trigger_type": "MANUAL_BUTTON",
  "status": "ACTIVE",
  "integrity_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "blockchain_tx": "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  "cancelled_reason": null,
  "created_at": "2026-11-02T10:15:30Z",
  "updated_at": "2026-11-02T10:15:30Z"
}
```

### `GET /api/sos/history`
Returns personal incident logs.

### `GET /api/sos/{incident_id}`
Returns incident details along with real-time cryptographic verification status (`TAMPER_FREE` or `CORRUPTED_OR_TAMPERED`).

### `PATCH /api/sos/{incident_id}/cancel`
Cancels an active alert with user reason (e.g. false alarm, safely reached home). Recomputes hash reflecting cancellation.

---

## 4. Live Location Sharing

### `POST /api/location/start`
Starts a time-limited GPS session.

```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "accuracy": 8.0,
  "duration_minutes": 60
}
```

### `GET /api/location/{session_code}`
Public tracking endpoint accessible to contacts holding the live link. Returns coordinates if session has not expired.

### `PATCH /api/location/{session_code}/ping`
Updates real-time GPS coordinates.

### `POST /api/location/{session_code}/stop`
Terminates location session.

---

## 5. AI Situational Safety & Integrity

### `POST /api/ai/risk-assessment`
```json
{
  "location_type": "Isolated Dark Alley",
  "time_of_day": "Late Night",
  "crowd_density": "Deserted",
  "lighting_level": "Dark",
  "user_feeling": "Actively Followed"
}
```

**Response (200 OK):**
```json
{
  "risk_level": "CRITICAL",
  "risk_score": 85,
  "primary_hazards": ["Potential stalker or pursuit proximity", "Severe lack of civilian witnesses"],
  "actionable_recommendations": [
    "ARM EMERGENCY SOS: Keep ShaktiShield SOS screen active",
    "SEEK IMMEDIATE SHELTER: Move toward lit commercial establishment",
    "START LIVE LOCATION SHARING: Activate tracking link"
  ],
  "emergency_checklist": [
    "1. Dial 112 immediately",
    "2. Trigger ShaktiShield One-Tap SOS",
    "3. Move toward lit populated areas"
  ],
  "timestamp": "2026-11-02T10:20:00Z",
  "disclaimer": "INFORMATIONAL ONLY: This assessment does not predict crime or guarantee safety. Call 112 in danger."
}
```

### `GET /api/integrity/{incident_code}`
Cryptographically tests the database record against the stored SHA-256 hash.

### `POST /api/integrity/verify`
Allows simulating coordinate tampering to test mismatch detection.

---

## 6. Administrator Endpoints

*Headers: `Authorization: Bearer <admin_token>`*

- `GET /api/admin/dashboard` - Platform telemetry metrics.
- `GET /api/admin/users` - Registered user roster without password hashes.
- `GET /api/admin/incidents` - Platform-wide incident stream.
- `PATCH /api/admin/incidents/{incident_id}/status` - Administrative status triage.
- `GET /api/admin/audit-logs` - Append-only system audit logs.
