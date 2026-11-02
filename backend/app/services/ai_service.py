from datetime import datetime, timezone
from typing import Dict, Any, List
from app.schemas.ai import RiskAssessmentRequest, RiskAssessmentResponse, RecommendationRequest, RecommendationResponse

class AISafetyService:
    @staticmethod
    def evaluate_risk(request: RiskAssessmentRequest) -> RiskAssessmentResponse:
        """
        Rule-based and heuristic risk assessment engine.
        Calculates a quantifiable risk score and produces situational guidance.
        """
        score = 15  # Base baseline score

        # 1. Location Risk Weight
        loc_lower = request.location_type.lower()
        if any(w in loc_lower for w in ["alley", "isolated", "desolate", "underpass", "abandoned"]):
            score += 30
        elif any(w in loc_lower for w in ["transit", "metro", "bus stand", "station", "parking"]):
            score += 20
        elif any(w in loc_lower for w in ["highway", "road", "street"]):
            score += 15
        elif any(w in loc_lower for w in ["commercial", "mall", "market"]):
            score += 5

        # 2. Time of Day Weight
        time_lower = request.time_of_day.lower()
        if any(w in time_lower for w in ["late night", "midnight", "2am", "3am", "4am", "11pm"]):
            score += 25
        elif any(w in time_lower for w in ["evening", "dusk", "night"]):
            score += 15
        elif any(w in time_lower for w in ["early morning"]):
            score += 10
        elif any(w in time_lower for w in ["daylight", "afternoon", "morning"]):
            score += 0

        # 3. Crowd Density Weight
        crowd_lower = request.crowd_density.lower()
        if any(w in crowd_lower for w in ["deserted", "empty", "nobody", "isolated"]):
            score += 20
        elif any(w in crowd_lower for w in ["sparse", "few"]):
            score += 10
        elif any(w in crowd_lower for w in ["moderate"]):
            score += 5
        elif any(w in crowd_lower for w in ["crowded", "dense"]):
            score += 5  # Crowded could have pickpocketing or eve-teasing, but lower isolation risk

        # 4. Lighting Weight
        light_lower = request.lighting_level.lower()
        if any(w in light_lower for w in ["dark", "unlit", "pitch"]):
            score += 20
        elif any(w in light_lower for w in ["poorly", "dim"]):
            score += 12
        elif any(w in light_lower for w in ["moderate"]):
            score += 5
        elif any(w in light_lower for w in ["well-lit", "bright"]):
            score += 0

        # 5. User Distress / Subjective Indicator
        user_feel_lower = (request.user_feeling or "").lower()
        if any(w in user_feel_lower for w in ["followed", "stalked", "threatened", "pursued"]):
            score += 30
        elif any(w in user_feel_lower for w in ["suspicious", "uneasy", "unsafe", "scared"]):
            score += 18
        elif any(w in user_feel_lower for w in ["safe", "neutral", "normal"]):
            score -= 5

        # Normalize score between 0 and 100
        score = max(5, min(100, score))

        # Determine Risk Category
        if score >= 75:
            risk_level = "CRITICAL"
        elif score >= 50:
            risk_level = "HIGH"
        elif score >= 30:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        # Generate Contextual Hazards
        hazards = []
        if score >= 70 or "followed" in user_feel_lower:
            hazards.append("Potential stalker or pursuit proximity")
        if "deserted" in crowd_lower or "alley" in loc_lower:
            hazards.append("Severe lack of civilian witnesses or immediate bystander aid")
        if "dark" in light_lower or "poorly" in light_lower:
            hazards.append("Impaired visibility and surveillance camera coverage")
        if "late night" in time_lower:
            hazards.append("Limited public transport and closed commercial shelters")
        if not hazards:
            hazards.append("General situational vigilance required")

        # Generate Actionable Tactical Recommendations
        recommendations = []
        if risk_level in ["CRITICAL", "HIGH"]:
            recommendations.append("ARM EMERGENCY SOS: Keep the ShaktiShield SOS screen active and thumb hovering over trigger.")
            recommendations.append("SEEK IMMEDIATE SHELTER: Move promptly toward an open commercial establishment, pharmacy, or fuel pump.")
            recommendations.append("START LIVE LOCATION SHARING: Activate the ShaktiShield Live Location link and share with primary trusted contacts.")
            recommendations.append("DO NOT WEAR HEADPHONES: Remove earbuds to maintain full 360-degree acoustic awareness.")
            recommendations.append("MAKE AUDIBLE CALL: Call a trusted friend or simulate a loud confident conversation stating your exact coordinates.")
        elif risk_level == "MODERATE":
            recommendations.append("SHARE LIVE ROUTE: Initiate live location session with your designated trusted contacts.")
            recommendations.append("STICK TO ILLUMINATED ARTERIES: Avoid unlit shortcuts or narrow alleyways even if faster.")
            recommendations.append("KEEP CONTACTS ACCESSIBLE: Ensure your phone has at least 20% battery and emergency speed dials configured.")
        else:
            recommendations.append("STAY SITUATIONALLY AWARE: Keep your phone charged and stay observant of surroundings.")
            recommendations.append("PERIODIC CHECK-IN: Notify your emergency contacts upon arriving at your destination.")

        # Step-by-Step Emergency Checklist
        checklist = [
            "1. Dial 112 (National Emergency Helpline) immediately if you feel in imminent danger.",
            "2. Trigger ShaktiShield One-Tap SOS to log your cryptographic location record.",
            "3. Move toward lit populated areas; avoid dead ends.",
            "4. Keep your keys or a personal defense alarm accessible in hand."
        ]

        return RiskAssessmentResponse(
            risk_level=risk_level,
            risk_score=score,
            primary_hazards=hazards,
            actionable_recommendations=recommendations,
            emergency_checklist=checklist,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

    @staticmethod
    def get_category_recommendations(request: RecommendationRequest) -> RecommendationResponse:
        """Provide detailed safety blueprints for specific categories."""
        cat_lower = request.category.lower()

        guidelines_map = {
            "commute": {
                "guidelines": [
                    "Verify vehicle license plate and driver identity against cab aggregator apps before entering.",
                    "Always sit in the rear seat behind the driver to limit reach.",
                    "Keep windows rolled up partially and doors locked in slow traffic.",
                    "Share live ride status and ShaktiShield live tracking link."
                ],
                "preventative_steps": [
                    "Never board unmarked shared autos or private unlicensed taxis.",
                    "Pre-plan the route and challenge the driver if unauthorized deviations occur."
                ]
            },
            "stalking": {
                "guidelines": [
                    "Do not go directly to your home address if you suspect you are being followed.",
                    "Head straight into a police station, hospital, metro station, or crowded retail store.",
                    "Change your pace or cross the street to clearly confirm if the person mirrors your movement."
                ],
                "preventative_steps": [
                    "Document dates, descriptions, license plates, and timestamps in ShaktiShield incident notes.",
                    "File a formal report with the Women Helpline (1091) or Cyber Crime Cell."
                ]
            },
            "cyber harassment": {
                "guidelines": [
                    "Do not delete offensive messages, emails, or threats; take clear screenshots with visible timestamps and usernames.",
                    "Immediately lock down privacy settings on social media and disable location tagging on posts.",
                    "Report the perpetrator to platform safety teams and portal cybercrime.gov.in (National Cyber Crime Portal)."
                ],
                "preventative_steps": [
                    "Use strong unique passwords with two-factor authentication (2FA).",
                    "Never share real-time departure plans publicly on social networks."
                ]
            },
            "domestic safety": {
                "guidelines": [
                    "Identify safe rooms with locks and windows that can be exited in emergencies.",
                    "Keep a hidden emergency bag with cash, essential medications, and identification documents.",
                    "Set up a code word with a trusted contact that signals you need police assistance without raising alarm."
                ],
                "preventative_steps": [
                    "Keep the Women in Distress Helpline (181) and local protection officer contacts saved.",
                    "Regularly clear browsing history on shared family devices if safety is compromised."
                ]
            }
        }

        matched = guidelines_map.get(cat_lower, {
            "guidelines": [
                "Maintain situational awareness and trust your intuition.",
                "Ensure emergency contacts are pre-configured in ShaktiShield AI.",
                "Keep local emergency helpline 112 on speed dial."
            ],
            "preventative_steps": [
                "Regularly test the SOS flow in Demo Mode so you are familiar with the interface.",
                "Keep your smartphone charged and location permissions enabled."
            ]
        })

        official_contacts = [
            {"service": "National Emergency Helpline", "number": "112", "toll_free": True},
            {"service": "Women Helpline (All India)", "number": "1091", "toll_free": True},
            {"service": "Women in Distress Helpline", "number": "181", "toll_free": True},
            {"service": "National Cyber Crime Reporting", "number": "1930", "toll_free": True}
        ]

        return RecommendationResponse(
            category=request.category.capitalize(),
            guidelines=matched["guidelines"],
            preventative_steps=matched["preventative_steps"],
            helpline_contacts=official_contacts
        )
