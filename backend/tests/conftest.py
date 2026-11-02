import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import Base, get_db
from app.main import app, init_db_and_seed
from app.core.security import hash_password
from app.core.rate_limit import login_limiter, register_limiter, sos_limiter
from app.models.user import User

# Use an in-memory or dedicated test sqlite db
TEST_DATABASE_URL = "sqlite:///./test_shaktishield.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    # Override app get_db
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_shaktishield.db"):
        try:
            os.remove("./test_shaktishield.db")
        except Exception:
            pass

@pytest.fixture(autouse=True)
def reset_rate_limiters():
    """Clear in-memory rate limit records between individual tests so test runs don't collide."""
    login_limiter.client_records.clear()
    register_limiter.client_records.clear()
    sos_limiter.client_records.clear()
    yield

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    # Register and login a clean test user
    email = "testuser@shaktishield.ai"
    password = "UserSecret123!"
    
    # Try login first or register
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        token = resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
        
    reg_resp = client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test User",
        "phone": "+919900112233"
    })
    token = reg_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_headers(client):
    # Register and login an admin user
    email = "testadmin@shaktishield.ai"
    password = "AdminSecret123!"

    resp = client.post("/api/auth/admin/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        token = resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    # Register admin directly via DB to ensure role='admin' and approval_status='APPROVED'
    db = TestingSessionLocal()
    admin_user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name="Platform Admin",
        role="admin",
        approval_status="APPROVED",
        organization_name="Platform Safety Commission",
        authorization_reference="AUTH-TEST-ADMIN",
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    db.close()

    login_resp = client.post("/api/auth/admin/login", json={"email": email, "password": password})
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
