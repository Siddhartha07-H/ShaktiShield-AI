import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.core.mfa import compute_totp
from app.core.security import decode_token

def test_unauthorized_api_requests():
    """Verify that unauthenticated requests to protected endpoints are strictly rejected with 401."""
    client = TestClient(app)
    endpoints = [
        ("GET", "/api/auth/me"),
        ("PUT", "/api/auth/profile"),
        ("GET", "/api/contacts"),
        ("POST", "/api/contacts"),
        ("GET", "/api/sos/history"),
        ("POST", "/api/sos"),
        ("GET", "/api/location/history"),
        ("POST", "/api/location/start"),
        ("GET", "/api/notifications"),
        ("GET", "/api/admin/dashboard"),
        ("GET", "/api/admin/users"),
        ("GET", "/api/admin/audit-logs"),
    ]
    for method, path in endpoints:
        resp = client.request(method, path, json={} if method in ["POST", "PUT", "PATCH"] else None)
        assert resp.status_code == 401, f"Expected 401 for unauthenticated {method} {path}, got {resp.status_code}"

def test_user_to_user_data_isolation_idor():
    """Verify that User A cannot read, modify, cancel, or delete User B's contacts, SOS incidents, or location."""
    client_a = TestClient(app)
    client_b = TestClient(app)

    # Register User A
    resp_a = client_a.post("/api/auth/register", json={
        "email": "user_a@shaktishield.ai",
        "password": "UserAPassword123!",
        "full_name": "User Alpha",
        "phone": "+919000000001"
    })
    token_a = resp_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register User B
    resp_b = client_b.post("/api/auth/register", json={
        "email": "user_b@shaktishield.ai",
        "password": "UserBPassword123!",
        "full_name": "User Beta",
        "phone": "+919000000002"
    })
    token_b = resp_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A creates a trusted contact
    contact_resp = client_a.post("/api/contacts", json={
        "name": "Alpha Sister",
        "phone": "+919000000003",
        "relationship": "Sister",
        "is_primary": True
    }, headers=headers_a)
    contact_id = contact_resp.json()["id"]

    # IDOR Test 1: User B attempts to update User A's contact -> 404
    up_resp = client_b.put(f"/api/contacts/{contact_id}", json={
        "name": "Tampered Name"
    }, headers=headers_b)
    assert up_resp.status_code == 404

    # IDOR Test 2: User B attempts to delete User A's contact -> 404
    del_resp = client_b.delete(f"/api/contacts/{contact_id}", headers=headers_b)
    assert del_resp.status_code == 404

    # User A triggers an Emergency SOS
    sos_resp = client_a.post("/api/sos", json={
        "latitude": 28.6139,
        "longitude": 77.2090,
        "description": "User A distress alert"
    }, headers=headers_a)
    incident_id = sos_resp.json()["id"]
    incident_code = sos_resp.json()["incident_code"]

    # IDOR Test 3: User B attempts to access User A's private SOS incident detail -> 404
    sos_detail_resp = client_b.get(f"/api/sos/{incident_id}", headers=headers_b)
    assert sos_detail_resp.status_code == 404

    # IDOR Test 4: User B attempts to cancel User A's active emergency alert -> 404
    sos_cancel_resp = client_b.patch(f"/api/sos/{incident_id}/cancel", json={
        "reason": "Malicious cancellation attempt"
    }, headers=headers_b)
    assert sos_cancel_resp.status_code == 404

    # IDOR Test 5: User B attempts to view User A's cryptographic telemetry report -> 403 Forbidden
    integ_resp = client_b.get(f"/api/integrity/{incident_code}", headers=headers_b)
    assert integ_resp.status_code == 403

    # User A starts a live location session
    loc_resp = client_a.post("/api/location/start", json={
        "latitude": 28.6139,
        "longitude": 77.2090,
        "duration_minutes": 30
    }, headers=headers_a)
    session_code = loc_resp.json()["session_code"]

    # IDOR Test 6: User B attempts to stop User A's location session -> 404
    stop_resp = client_b.post(f"/api/location/{session_code}/stop", headers=headers_b)
    assert stop_resp.status_code == 404

def test_admin_privilege_escalation_prevention():
    """Verify that standard users cannot elevate privileges via registration, profile updates, or admin APIs."""
    client = TestClient(app)

    # 1. Attempting to supply role="admin" during normal user registration
    reg_resp = client.post("/api/auth/register", json={
        "email": "hacker@example.com",
        "password": "HackerPassword123!",
        "full_name": "Malicious User",
        "phone": "+919999911111",
        "role": "admin"  # Frontend parameter injection
    })
    assert reg_resp.status_code == 201
    assert reg_resp.json()["user"]["role"] == "user"

    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Attempting to elevate role or approval_status via profile update
    up_resp = client.put("/api/auth/profile", json={
        "role": "admin",
        "approval_status": "APPROVED",
        "phone": "+919999922222"
    }, headers=headers)
    assert up_resp.status_code == 200
    assert up_resp.json()["role"] == "user"

    # 3. Attempting to call administrative approval endpoint
    admin_action_resp = client.post("/api/admin/approve-admin/1", headers=headers)
    assert admin_action_resp.status_code == 403
    assert "Administrator privileges required" in admin_action_resp.json()["detail"]

def test_refresh_token_rotation_and_revocation():
    """Verify refresh-token rotation, reuse detection (theft protection), and token revocation on logout."""
    client = TestClient(app)

    reg_resp = client.post("/api/auth/register", json={
        "email": "rotation.user@shaktishield.ai",
        "password": "RotationPass123!",
        "full_name": "Rotation Tester"
    })
    assert reg_resp.status_code == 201
    token_data = reg_resp.json()
    first_access = token_data["access_token"]
    first_refresh = token_data["refresh_token"]

    assert first_refresh is not None

    # Step 1: Rotate refresh token
    ref_resp = client.post("/api/auth/refresh", json={"refresh_token": first_refresh})
    assert ref_resp.status_code == 200
    new_data = ref_resp.json()
    second_access = new_data["access_token"]
    second_refresh = new_data["refresh_token"]

    assert second_refresh != first_refresh
    assert second_access != first_access

    # Step 2: Attempting to reuse the FIRST (already rotated) refresh token must trigger compromise detection
    reuse_resp = client.post("/api/auth/refresh", json={"refresh_token": first_refresh})
    assert reuse_resp.status_code == 401
    assert "Compromised refresh token detected" in reuse_resp.json()["detail"]

    # Step 3: Verify that because of compromise, second_refresh was also invalidated
    invalidated_resp = client.post("/api/auth/refresh", json={"refresh_token": second_refresh})
    assert invalidated_resp.status_code == 401

    # Step 4: Login afresh to test logout blacklist
    login_resp = client.post("/api/auth/login", json={
        "email": "rotation.user@shaktishield.ai",
        "password": "RotationPass123!"
    })
    active_token = login_resp.json()["access_token"]
    active_headers = {"Authorization": f"Bearer {active_token}"}

    # Verify active access token works
    me_resp = client.get("/api/auth/me", headers=active_headers)
    assert me_resp.status_code == 200

    # Execute secure logout
    logout_resp = client.post("/api/auth/logout", headers=active_headers)
    assert logout_resp.status_code == 200

    # Accessing /auth/me with the logged-out token must now be rejected as revoked
    post_logout_resp = client.get("/api/auth/me", headers=active_headers)
    assert post_logout_resp.status_code == 401
    assert "revoked" in post_logout_resp.json()["detail"].lower()

def test_brute_force_account_lockout():
    """Verify that excessive consecutive failed sign-in attempts result in account lockout."""
    client = TestClient(app)
    target_email = "victim.bruteforce@shaktishield.ai"

    # Register user
    client.post("/api/auth/register", json={
        "email": target_email,
        "password": "CorrectSecret123!",
        "full_name": "Target Account"
    })

    # Execute 5 incorrect login attempts
    for _ in range(5):
        resp = client.post("/api/auth/login", json={
            "email": target_email,
            "password": "WrongPasswordAttempt"
        })
        assert resp.status_code == 401

    # The 6th attempt (even if using correct password) must be rejected with 423 Locked
    locked_resp = client.post("/api/auth/login", json={
        "email": target_email,
        "password": "CorrectSecret123!"
    })
    assert locked_resp.status_code == 423
    assert "temporarily locked" in locked_resp.json()["detail"].lower()

def test_admin_mfa_flow(admin_headers):
    """Verify administrator Multi-Factor Authentication setup, challenge issuance, and verification."""
    client = TestClient(app)

    # 1. Admin requests MFA setup
    setup_resp = client.post("/api/auth/admin/mfa-setup", headers=admin_headers)
    assert setup_resp.status_code == 200
    mfa_info = setup_resp.json()
    secret = mfa_info["secret"]
    assert len(secret) >= 16
    assert "otpauth://" in mfa_info["otpauth_url"]

    # 2. Compute a valid TOTP code and enable MFA
    valid_code = compute_totp(secret)
    enable_resp = client.post("/api/auth/admin/mfa-enable", json={
        "secret": secret,
        "totp_code": valid_code
    }, headers=admin_headers)
    assert enable_resp.status_code == 200
    assert enable_resp.json()["mfa_enabled"] is True

    # 3. Next admin login returns an MFA challenge response instead of immediate access token
    login_resp = client.post("/api/auth/admin/login", json={
        "email": "testadmin@shaktishield.ai",
        "password": "AdminSecret123!"
    })
    assert login_resp.status_code == 200
    challenge_data = login_resp.json()
    assert challenge_data["mfa_required"] is True
    mfa_token = challenge_data["mfa_token"]

    # 4. Attempt verification with an invalid code -> 401
    bad_verify_resp = client.post("/api/auth/admin/mfa-verify", json={
        "mfa_token": mfa_token,
        "totp_code": "000000"
    })
    assert bad_verify_resp.status_code == 401

    # 5. Complete verification with valid code -> 200 OK + final tokens issued
    current_code = compute_totp(secret)
    good_verify_resp = client.post("/api/auth/admin/mfa-verify", json={
        "mfa_token": mfa_token,
        "totp_code": current_code
    })
    assert good_verify_resp.status_code == 200
    assert "access_token" in good_verify_resp.json()
    assert good_verify_resp.json()["user"]["role"] == "admin"

def test_sql_injection_defense():
    """Verify that SQL injection payloads are neutralized and handled safely."""
    client = TestClient(app)

    # SQL Injection payload in email field
    sqli_payloads = [
        "admin' OR '1'='1' --",
        "' UNION SELECT id, email, hashed_password FROM users --",
        "test'; DROP TABLE users; --"
    ]
    for sqli in sqli_payloads:
        resp = client.post("/api/auth/login", json={
            "email": sqli,
            "password": "password"
        })
        # FastAPI / Pydantic EmailStr rejects invalid formats (422) or SQLAlchemy safely parameterizes it (401)
        assert resp.status_code in [401, 422], f"Expected 401 or 422 for SQLi payload, got {resp.status_code}"

def test_security_headers_and_payload_size_limits():
    """Verify that HTTP defense-in-depth headers and request size boundaries are strictly applied."""
    client = TestClient(app)

    resp = client.get("/")
    assert resp.status_code == 200

    # Verify standard OWASP security headers
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert "max-age=" in resp.headers.get("Strict-Transport-Security", "")
    assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "geolocation=(self)" in resp.headers.get("Permissions-Policy", "")
    assert "default-src 'self'" in resp.headers.get("Content-Security-Policy", "")

    # Request size limiting test: payload > 2MB must be rejected with 413
    oversized_body = {"data": "X" * (2 * 1024 * 1024 + 100)}
    size_resp = client.post("/api/auth/login", json=oversized_body)
    assert size_resp.status_code == 413
    assert "Payload too large" in size_resp.json()["detail"]

def test_location_data_minimization_and_retention(auth_headers):
    """Verify location retention policy and data minimization cleanup."""
    client = TestClient(app)

    cleanup_resp = client.post("/api/location/cleanup-expired", headers=auth_headers)
    assert cleanup_resp.status_code == 200
    data = cleanup_resp.json()
    assert data["status"] == "SUCCESS"
    assert "retention_policy_hours" in data
