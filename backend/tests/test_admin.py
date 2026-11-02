def test_admin_endpoints(client, admin_headers, auth_headers):
    # Non-admin user should get 403 Forbidden
    forbidden_resp = client.get("/api/admin/dashboard", headers=auth_headers)
    assert forbidden_resp.status_code == 403

    # Admin user should get 200 OK
    dash_resp = client.get("/api/admin/dashboard", headers=admin_headers)
    assert dash_resp.status_code == 200
    metrics = dash_resp.json()["metrics"]
    assert "total_users" in metrics
    assert "total_incidents" in metrics

    # Users list
    users_resp = client.get("/api/admin/users", headers=admin_headers)
    assert users_resp.status_code == 200
    assert len(users_resp.json()) >= 1

    # Incidents list
    inc_resp = client.get("/api/admin/incidents", headers=admin_headers)
    assert inc_resp.status_code == 200

    # Audit logs
    audit_resp = client.get("/api/admin/audit-logs", headers=admin_headers)
    assert audit_resp.status_code == 200
    assert len(audit_resp.json()) >= 1
