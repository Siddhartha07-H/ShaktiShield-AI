from typing import List, Optional
from pydantic import BaseModel, Field

class RiskAssessmentRequest(BaseModel):
    location_type: str = Field(..., description="e.g. Isolated Alley, Public Transit, Commercial Area, Residential Street")
    time_of_day: str = Field(..., description="e.g. Daylight, Evening, Late Night, Early Morning")
    crowd_density: str = Field(..., description="e.g. Deserted, Sparse, Moderate, Crowded")
    lighting_level: str = Field(..., description="e.g. Dark, Poorly Lit, Moderate, Well-lit")
    user_feeling: Optional[str] = Field("Safe", description="e.g. Safe, Uneasy, Suspicious Activity, Actively Followed")
    additional_notes: Optional[str] = None

class RiskAssessmentResponse(BaseModel):
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    risk_score: int  # 0 to 100
    primary_hazards: List[str]
    actionable_recommendations: List[str]
    emergency_checklist: List[str]
    timestamp: str
    disclaimer: str = (
        "INFORMATIONAL ONLY: This AI safety assessment is derived from heuristic risk factors "
        "and does not predict crime or guarantee personal safety. In imminent danger, call 112 immediately."
    )

class RecommendationRequest(BaseModel):
    category: str = Field(..., description="e.g. Commute, Stalking, Cyber Harassment, Domestic Safety, Travel")
    situation_details: Optional[str] = None

class RecommendationResponse(BaseModel):
    category: str
    guidelines: List[str]
    preventative_steps: List[str]
    helpline_contacts: List[dict]
    disclaimer: str = "Informational guidelines provided by ShaktiShield AI Safety Module."
