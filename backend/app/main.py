from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.security import hash_password
from app.database.session import engine, Base, SessionLocal
from app.api import api_router
from app.models.user import User
from app.models.contact import TrustedContact
from app.models.incident import SOSIncident
from app.services.integrity_service import IntegrityService
from app.services.blockchain_service import BlockchainService

def init_db_and_seed():
    """Create tables and seed initial demo accounts and safe sample data."""
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

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev and preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
