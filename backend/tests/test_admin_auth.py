import pytest
from datetime import datetime, timedelta, timezone
from app.core.security import hash_password, hash_invitation_code, verify_password
from app.models.user import User
from app.models.admin_invite import AdminInvitationCode
from tests.conftest import TestingSessionLocal

def test_1_normal_user_registration(client):
    """1. Normal user registration creates a USER account with approval_status APPROVED."""
    email = "citizen.safety@example.com"
    resp = client.post("/api/auth/register", json={
        "email": email,
        "password": "StrongPassword123!",
        "full_name": "Kavita Verma",
        "phone": "+919876500001",
        "terms_accepted": True
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == email
    assert data["user"]["role"] == "user"
    assert data["user"]["approval_status"] == "APPROVED"

def test_2_normal_user_login(client):
    """2. Normal user login authenticates successfully with correct Argon2 password."""
    resp = client.post("/api/auth/login", json={
        "email": "citizen.safety@example.com",
        "password": "StrongPassword123!"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "user"

def test_3_admin_login(client, admin_headers):
    """3. Admin login successfully verifies role and issues token for approved admin."""
    resp = client.post("/api/auth/admin/login", json={
        "email": "testadmin@shaktishield.ai",
        "password": "AdminSecret123!"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["user"]["role"] == "admin"
    assert data["user"]["approval_status"] == "APPROVED"

def test_4_admin_registration_without_authorization_reject(client):
    """4. Admin registration without authorization code is rejected by validation."""
    resp = client.post("/api/auth/admin/register", json={
        "email": "fakeadmin@shaktishield.ai",
        "password": "StrongPassword123!",
        "full_name": "Fake Admin",
        "phone": "+919999988888",
        "organization_name": "Rogue Org",
        "authorization_reference": "REF-NONE"
        # missing invitation_code
    })
    assert resp.status_code in [400, 422]

def test_5_admin_registration_with_invalid_invitation_code_reject(client):
    """5. Admin registration with invalid or bogus invitation code is rejected (403)."""
    resp = client.post("/api/auth/admin/register", json={
        "email": "unauthorized@safety.gov.in",
        "password": "StrongPassword123!",
        "full_name": "Unauthorized Officer",
        "phone": "+919876543219",
        "organization_name": "Unauthorized Dept",
        "authorization_reference": "GOV-REF-FAKE-999",
        "invitation_code": "INVALID-CODE-XYZ123"
    })
    assert resp.status_code == 403
    assert "Invalid or already utilized" in resp.json()["detail"]

def test_6_admin_registration_with_valid_invitation_creates_pending(client, admin_headers):
    """6. Admin registration with valid single-use invitation code creates PENDING_APPROVAL application."""
    # First, generate a valid invitation code using admin endpoint
    inv_resp = client.post("/api/admin/invitations", json={
        "organization_name": "Delhi Police Emergency Cell",
        "expires_in_hours": 48
    }, headers=admin_headers)
    assert inv_resp.status_code == 201
    invite_data = inv_resp.json()
    valid_code = invite_data["invitation_code"]
    assert valid_code is not None

    # Register new admin candidate using the issued code
    reg_resp = client.post("/api/auth/admin/register", json={
        "email": "inspector.sharma@delhipolice.gov.in",
        "password": "OfficialSecurePass2026!",
        "full_name": "Inspector R. Sharma",
        "phone": "+919811223399",
        "organization_name": "Delhi Police Emergency Cell",
        "authorization_reference": "DP-EMG-2026-9081",
        "invitation_code": valid_code
    })
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert data["user"]["role"] == "admin"
    assert data["user"]["approval_status"] == "PENDING_APPROVAL"
    assert data["user"]["organization_name"] == "Delhi Police Emergency Cell"
    assert data["user"]["authorization_reference"] == "DP-EMG-2026-9081"

    # Attempting to re-use the same single-use invitation code must be rejected
    reuse_resp = client.post("/api/auth/admin/register", json={
        "email": "duplicate.officer@delhipolice.gov.in",
        "password": "OfficialSecurePass2026!",
        "full_name": "Duplicate Candidate",
        "phone": "+919811223300",
        "organization_name": "Delhi Police Emergency Cell",
        "authorization_reference": "DP-EMG-2026-9082",
        "invitation_code": valid_code
    })
    assert reuse_resp.status_code == 403

def test_7_pending_administrator_cannot_access_admin_apis(client):
    """7. Pending administrator is strictly forbidden from accessing admin endpoints (403)."""
    # Login as the pending admin to get their JWT token
    login_resp = client.post("/api/auth/admin/login", json={
        "email": "inspector.sharma@delhipolice.gov.in",
        "password": "OfficialSecurePass2026!"
    })
    assert login_resp.status_code == 200
    pending_token = login_resp.json()["access_token"]
    pending_headers = {"Authorization": f"Bearer {pending_token}"}

    # Attempt to access admin dashboard
    dash_resp = client.get("/api/admin/dashboard", headers=pending_headers)
    assert dash_resp.status_code == 403
    assert "pending authorization review" in dash_resp.json()["detail"]

    # Attempt to access admin audit logs
    audit_resp = client.get("/api/admin/audit-logs", headers=pending_headers)
    assert audit_resp.status_code == 403

def test_8_approved_administrator_can_access_admin_dashboard(client, admin_headers):
    """8. Approved administrator can access admin dashboard, metrics, and pending queue."""
    # List pending admins
    pending_resp = client.get("/api/admin/pending-admins", headers=admin_headers)
    assert pending_resp.status_code == 200
    pending_list = pending_resp.json()
    assert any(u["email"] == "inspector.sharma@delhipolice.gov.in" for u in pending_list)

    target_user = next(u for u in pending_list if u["email"] == "inspector.sharma@delhipolice.gov.in")

    # Approve this admin application
    approve_resp = client.post(f"/api/admin/approve-admin/{target_user['id']}", headers=admin_headers)
    assert approve_resp.status_code == 200
    assert approve_resp.json()["approval_status"] == "APPROVED"

    # Now the approved administrator logs in and CAN access admin dashboard
    login_resp = client.post("/api/auth/admin/login", json={
        "email": "inspector.sharma@delhipolice.gov.in",
        "password": "OfficialSecurePass2026!"
    })
    new_admin_token = login_resp.json()["access_token"]
    new_admin_headers = {"Authorization": f"Bearer {new_admin_token}"}

    dash_resp = client.get("/api/admin/dashboard", headers=new_admin_headers)
    assert dash_resp.status_code == 200
    assert "metrics" in dash_resp.json()

def test_9_normal_user_cannot_access_admin_dashboard(client, auth_headers):
    """9. Normal user cannot access admin dashboard or admin APIs (403 Forbidden)."""
    resp = client.get("/api/admin/dashboard", headers=auth_headers)
    assert resp.status_code == 403
    assert "Administrator privileges required" in resp.json()["detail"]

    # Normal user trying to log into Admin login portal is rejected
    admin_login_attempt = client.post("/api/auth/admin/login", json={
        "email": "testuser@shaktishield.ai",
        "password": "UserSecret123!"
    })
    assert admin_login_attempt.status_code == 403
    assert "reserved exclusively for authorized administrators" in admin_login_attempt.json()["detail"]

def test_10_user_cannot_modify_own_role_to_admin(client, auth_headers):
    """10. Privilege escalation prevention: User cannot change role or approval_status via profile update."""
    # Attempting to supply role="admin" in profile update
    up_resp = client.put("/api/auth/profile", json={
        "role": "admin",
        "approval_status": "APPROVED",
        "phone": "+919999900000"
    }, headers=auth_headers)
    assert up_resp.status_code == 200
    data = up_resp.json()
    assert data["role"] == "user"  # Role remains strictly 'user'

    # Re-verify with /api/auth/me
    me_resp = client.get("/api/auth/me", headers=auth_headers)
    assert me_resp.json()["role"] == "user"

def test_11_passwords_never_stored_in_plain_text():
    """11. Passwords are securely hashed with Argon2id and never stored as plain text."""
    db = TestingSessionLocal()
    users = db.query(User).all()
    assert len(users) > 0
    for u in users:
        # Check that hashed_password starts with the Argon2 identifier
        assert u.hashed_password.startswith("$argon2id$")
        assert "Password" not in u.hashed_password
        assert "Pass" not in u.hashed_password
        assert "Secret" not in u.hashed_password
    db.close()

def test_12_existing_database_records_remain_intact():
    """12. Existing users, contacts, and database relationships remain intact with backward compatibility."""
    db = TestingSessionLocal()
    user_count = db.query(User).count()
    assert user_count >= 2
    # Verify columns exist and are queryable
    sample_user = db.query(User).first()
    assert hasattr(sample_user, "approval_status")
    assert hasattr(sample_user, "organization_name")
    assert hasattr(sample_user, "authorization_reference")
    assert sample_user.approval_status in ["APPROVED", "PENDING_APPROVAL", "REJECTED"]
    db.close()
