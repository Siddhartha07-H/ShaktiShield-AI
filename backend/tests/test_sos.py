def test_sos_lifecycle_and_integrity(client, auth_headers):
    # 1. Trigger SOS
    trigger_resp = client.post("/api/sos", json={
        "latitude": 19.0760,
        "longitude": 72.8777,
        "accuracy": 15.0,
        "address": "Bandra Kurla Complex, Mumbai",
        "description": "Test emergency SOS alert",
        "trigger_type": "MANUAL_BUTTON"
    }, headers=auth_headers)
    assert trigger_resp.status_code == 201
    sos_data = trigger_resp.json()
    assert sos_data["status"] == "ACTIVE"
    assert "SOS-" in sos_data["incident_code"]
    assert len(sos_data["integrity_hash"]) == 64  # Valid SHA-256 hex string
    incident_id = sos_data["id"]
    incident_code = sos_data["incident_code"]

    # 2. Retrieve personal history
    history_resp = client.get("/api/sos/history", headers=auth_headers)
    assert history_resp.status_code == 200
    incidents = history_resp.json()
    assert any(i["id"] == incident_id for i in incidents)

    # 3. Retrieve incident detail with cryptographic verification
    detail_resp = client.get(f"/api/sos/{incident_id}", headers=auth_headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["verification_status"] == "TAMPER_FREE"

    # 4. Cancel SOS
    cancel_resp = client.patch(f"/api/sos/{incident_id}/cancel", json={
        "reason": "Test resolved by user safely"
    }, headers=auth_headers)
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "CANCELLED"

    # 5. Check integrity endpoint directly
    int_resp = client.get(f"/api/integrity/{incident_code}")
    assert int_resp.status_code == 200
    int_data = int_resp.json()
    assert int_data["is_valid"] is True
    assert int_data["status"] == "TAMPER_FREE"
