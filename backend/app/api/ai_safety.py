from fastapi import APIRouter
from app.schemas.ai import (
    RiskAssessmentRequest, RiskAssessmentResponse,
    RecommendationRequest, RecommendationResponse
)
from app.services.ai_service import AISafetyService

router = APIRouter(prefix="/ai", tags=["AI Safety & Risk Assessment"])

@router.post("/risk-assessment", response_model=RiskAssessmentResponse)
def assess_safety_risk(request: RiskAssessmentRequest):
    """
    AI Safety Risk Assessment Engine.
    Evaluates environmental factors (lighting, crowd density, location type, time of day, user distress).
    Returns numerical risk score, classified tier (LOW, MODERATE, HIGH, CRITICAL), tactical recommendations,
    and step-by-step emergency checklist.
    """
    return AISafetyService.evaluate_risk(request)

@router.post("/recommendations", response_model=RecommendationResponse)
def get_safety_recommendations(request: RecommendationRequest):
    """
    Returns structured safety guidelines and official Indian emergency contacts
    for categories including Commute, Stalking, Cyber Harassment, Domestic Safety, and Travel.
    """
    return AISafetyService.get_category_recommendations(request)
