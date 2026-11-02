def test_ai_risk_assessment_critical():
    from app.services.ai_service import AISafetyService
    from app.schemas.ai import RiskAssessmentRequest

    req = RiskAssessmentRequest(
        location_type="Isolated dark alley near industrial zone",
        time_of_day="Late night 2:00 AM",
        crowd_density="Deserted",
        lighting_level="Dark / Unlit",
        user_feeling="Actively followed by suspicious group"
    )
    result = AISafetyService.evaluate_risk(req)
    assert result.risk_level in ["CRITICAL", "HIGH"]
    assert result.risk_score >= 70
    assert len(result.actionable_recommendations) > 0
    assert "112" in result.emergency_checklist[0]

def test_ai_risk_assessment_low():
    from app.services.ai_service import AISafetyService
    from app.schemas.ai import RiskAssessmentRequest

    req = RiskAssessmentRequest(
        location_type="Commercial shopping mall food court",
        time_of_day="Daylight afternoon",
        crowd_density="Crowded",
        lighting_level="Well-lit",
        user_feeling="Safe"
    )
    result = AISafetyService.evaluate_risk(req)
    assert result.risk_level == "LOW"
    assert result.risk_score < 40

def test_ai_recommendations_endpoint(client):
    resp = client.post("/api/ai/recommendations", json={
        "category": "Commute",
        "situation_details": "Late evening cab ride"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["category"] == "Commute"
    assert len(data["guidelines"]) >= 2
    assert any(c["number"] == "112" for c in data["helpline_contacts"])
