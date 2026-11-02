def test_contacts_crud(client, auth_headers):
    # 1. Create primary contact
    create_resp = client.post("/api/contacts", json={
        "name": "Ananya Sen",
        "phone": "+919876500001",
        "relationship": "Friend",
        "email": "ananya@example.com",
        "is_primary": True
    }, headers=auth_headers)
    assert create_resp.status_code == 201
    contact_data = create_resp.json()
    contact_id = contact_data["id"]
    assert contact_data["name"] == "Ananya Sen"
    assert contact_data["is_primary"] is True

    # 2. List contacts
    list_resp = client.get("/api/contacts", headers=auth_headers)
    assert list_resp.status_code == 200
    contacts = list_resp.json()
    assert len(contacts) >= 1
    assert any(c["id"] == contact_id for c in contacts)

    # 3. Update contact
    update_resp = client.put(f"/api/contacts/{contact_id}", json={
        "name": "Ananya Sen (Best Friend)",
        "relationship": "Close Friend"
    }, headers=auth_headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Ananya Sen (Best Friend)"

    # 4. Delete contact
    del_resp = client.delete(f"/api/contacts/{contact_id}", headers=auth_headers)
    assert del_resp.status_code == 200

    # 5. Verify deletion
    verify_resp = client.get("/api/contacts", headers=auth_headers)
    assert not any(c["id"] == contact_id for c in verify_resp.json())
