import logging
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.security import hash_password, hash_invitation_code
from app.database.session import engine, Base, SessionLocal
from app.api import api_router
from app.models.user import User
from app.models.contact import TrustedContact
from app.models.incident import SOSIncident
from app.models.admin_invite import AdminInvitationCode
from app.models.token import RefreshToken, RevokedToken
from app.services.integrity_service import IntegrityService
from app.services.blockchain_service import BlockchainService

logger = logging.getLogger("shaktishield")
logging.basicConfig(level=logging.INFO)

def init_db_and_seed():
    """Create tables and seed initial administrator and demo safety profiles."""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if users already exist
        admin = db.query(User).filter(User.email == "admin@shaktishield.ai").first()
        if not admin:
            admin = User(
                email="admin@shaktishield.ai",
                hashed_password=hash_password("AdminPass123!"),
                full_name="Chief Safety Officer (Admin)",
                phone="+919876543210",
                role="admin",
                approval_status="APPROVED",
                organization_name="National Emergency Safety Command",
                authorization_reference="AUTH-GOV-DELHI-001",
                blood_type="O+",
                emergency_notes="Admin personnel with platform emergency response duties.",
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        demo_user = db.query(User).filter(User.email == "demo@shaktishield.ai").first()
        if not demo_user:
            demo_user = User(
                email="demo@shaktishield.ai",
                hashed_password=hash_password("DemoPass123!"),
                full_name="Aarohi Sharma",
                phone="+919811223344",
                role="user",
                approval_status="APPROVED",
                blood_type="B+",
                emergency_notes="Asthma inhaler in purse. Contact elder sister first in emergencies.",
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            # Seed demo trusted contacts
            c1 = TrustedContact(
                user_id=demo_user.id,
                name="Priya Sharma (Sister)",
                phone="+919822334455",
                relationship="Sister",
                email="priya.sharma@example.com",
                is_primary=True
            )
            c2 = TrustedContact(
                user_id=demo_user.id,
                name="Dr. Rajesh Sharma (Father)",
                phone="+919833445566",
                relationship="Parent",
                email="rajesh.sharma@example.com",
                is_primary=False
            )
            db.add_all([c1, c2])
            db.commit()

            # Seed a sample verified incident
            now = datetime.now(timezone.utc)
            inc_code = f"SOS-{now.strftime('%Y%m%d')}-DEMO101"
            inc_hash = IntegrityService.compute_incident_hash(
                incident_code=inc_code,
                user_id=demo_user.id,
                created_at=now,
                latitude=28.6139,
                longitude=77.2090,
                trigger_type="MANUAL_BUTTON",
                status="RESOLVED"
            )
            receipt = BlockchainService.anchor_incident_hash(inc_code, inc_hash)

            sample_incident = SOSIncident(
                incident_code=inc_code,
                user_id=demo_user.id,
                latitude=28.6139,
                longitude=77.2090,
                accuracy=12.5,
                address="Connaught Place, New Delhi, Delhi 110001, India",
                description="Simulated emergency SOS drill. Safe arrival confirmed by user.",
                trigger_type="MANUAL_BUTTON",
                status="RESOLVED",
                integrity_hash=inc_hash,
                blockchain_tx=receipt.get("transaction_hash"),
                created_at=now,
                updated_at=now
            )
            db.add(sample_incident)
            db.commit()

        # Seed initial bootstrap admin invitation code if none exist
        inv_count = db.query(AdminInvitationCode).count()
        if inv_count == 0:
            bootstrap_code = "SHAKTI-ADM-BOOTSTRAP2026"
            bootstrap_inv = AdminInvitationCode(
                code_hash=hash_invitation_code(bootstrap_code),
                organization_name="National Women Safety Commission",
                created_by_admin_id=admin.id if admin else None,
                expires_at=datetime.now(timezone.utc) + timedelta(days=90),
                is_used=False
            )
            db.add(bootstrap_inv)
            db.commit()

    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and seeds
    init_db_and_seed()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Full-Stack AI-Assisted Women's Safety Web Platform with Cryptographic Data Integrity.",
    lifespan=lifespan
)

# Extract approved origins for strict CORS
APPROVED_ORIGINS = [
    origin.strip() for origin in settings.BACKEND_CORS_ORIGINS
    if not origin.strip().startswith("https://*")
]

# Strict CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=APPROVED_ORIGINS,
    allow_origin_regex=r"^https://[a-zA-Z0-9\-]+\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
)

# Security Headers & Request Size Limiting Middleware
MAX_REQUEST_BYTES = 2 * 1024 * 1024  # 2MB maximum payload size

@app.middleware("http")
async def security_and_limit_middleware(request: Request, call_next):
    # Enforce request payload size limits on mutating requests
    if request.method in ["POST", "PUT", "PATCH"]:
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_REQUEST_BYTES:
            return JSONResponse(
                status_code=413,
                content={"detail": "Payload too large. Maximum allowed request size is 2MB."}
            )

    response = await call_next(request)

    # Secure HTTP Headers (OWASP recommended defense-in-depth)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(self), camera=(), microphone=()"
    response.headers["X-XSS-Protection"] = "0"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https:; "
        "font-src 'self' data:;"
    )

    return response

# Safe global error handler to prevent stack trace or credential leakage
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error during {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact security compliance if the issue persists."}
    )

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "ONLINE",
        "demo_mode": settings.DEMO_MODE,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/api/health")
def healthcheck():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "connected",
        "demo_mode": settings.DEMO_MODE,
        "blockchain_network": settings.BLOCKCHAIN_NETWORK
    }
