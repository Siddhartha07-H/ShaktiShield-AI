import pytest
from fastapi.testclient import TestClient

def test_notifications_and_location_endpoints(client: TestClient, auth_headers):
    # 1. Test fetching unread count and notifications list
    resp = client.get("/api/notifications/unread-count", headers=auth_headers)
    assert resp.status_code == 200
    assert "unread_count" in resp.json()

    resp = client.get("/api/notifications", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

    # 2. Test mark all as read
    resp = client.post("/api/notifications/mark-all-read", headers=auth_headers)
    assert resp.status_code == 200
    assert "message" in resp.json()

    # 3. Test active location session endpoint
    resp = client.get("/api/location/active", headers=auth_headers)
    assert resp.status_code == 200
    # Initially None or inactive
    assert resp.json() is None or isinstance(resp.json(), dict)

    # 4. Start location session
    start_payload = {
        "latitude": 28.6139,
        "longitude": 77.2090,
        "accuracy": 12.5,
        "duration_minutes": 30
    }
    resp = client.post("/api/location/start", json=start_payload, headers=auth_headers)
    assert resp.status_code == 201
    session_data = resp.json()
    assert session_data["is_active"] is True
    session_code = session_data["session_code"]

    # 5. Check active session returns it
    resp = client.get("/api/location/active", headers=auth_headers)
    assert resp.status_code == 200
    active = resp.json()
    assert active is not None
    assert active["session_code"] == session_code

    # 6. Check location history
    resp = client.get("/api/location/history", headers=auth_headers)
    assert resp.status_code == 200
    history = resp.json()
    assert isinstance(history, list)
    assert any(s["session_code"] == session_code for s in history)

    # 7. Stop session
    resp = client.post(f"/api/location/{session_code}/stop", headers=auth_headers)
    assert resp.status_code == 200

    # 8. Check active is now None
    resp = client.get("/api/location/active", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() is None
