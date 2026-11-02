def test_integrity_tamper_detection(client, auth_headers):
    # Create an SOS incident
    resp = client.post("/api/sos", json={
        "latitude": 12.9716,
        "longitude": 77.5946,
        "description": "Integrity validation test"
    }, headers=auth_headers)
    assert resp.status_code == 201
    inc_code = resp.json()["incident_code"]

    # 1. Normal check should be tamper-free
    check_resp = client.get(f"/api/integrity/{inc_code}")
    assert check_resp.status_code == 200
    assert check_resp.json()["is_valid"] is True

    # 2. Tampered check: pass altered coordinates to verification
    tamper_resp = client.post("/api/integrity/verify", json={
        "incident_code": inc_code,
        "tampered_data_test": {
            "latitude": 99.9999,  # altered coordinate
            "longitude": 99.9999
        }
    })
    assert tamper_resp.status_code == 200
    tamper_data = tamper_resp.json()
    assert tamper_data["is_valid"] is False
    assert tamper_data["status"] == "CORRUPTED_OR_TAMPERED"
