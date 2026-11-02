def test_register_and_login(client):
    # Register new user
    email = "sneha@example.com"
    resp = client.post("/api/auth/register", json={
        "email": email,
        "password": "SecurePassword123!",
        "full_name": "Sneha Roy",
        "phone": "+919123456789",
        "blood_type": "A+",
        "emergency_notes": "Allergic to penicillin"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == email
    assert data["user"]["full_name"] == "Sneha Roy"

    # Login
    login_resp = client.post("/api/auth/login", json={
        "email": email,
        "password": "SecurePassword123!"
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    assert login_data["user"]["blood_type"] == "A+"

def test_login_invalid_password(client):
    resp = client.post("/api/auth/login", json={
        "email": "testuser@shaktishield.ai",
        "password": "WrongPassword999!"
    })
    assert resp.status_code == 401
    assert "detail" in resp.json()

def test_me_and_profile_update(client, auth_headers):
    # Fetch profile
    me_resp = client.get("/api/auth/me", headers=auth_headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "testuser@shaktishield.ai"

    # Update profile
    up_resp = client.put("/api/auth/profile", json={
        "phone": "+919988776655",
        "emergency_notes": "Updated contact info"
    }, headers=auth_headers)
    assert up_resp.status_code == 200
    assert up_resp.json()["phone"] == "+919988776655"
    assert up_resp.json()["emergency_notes"] == "Updated contact info"

def test_forgot_password_demo(client):
    resp = client.post("/api/auth/forgot-password", json={"email": "demo@shaktishield.ai"})
    assert resp.status_code == 200
    assert "status" in resp.json()
