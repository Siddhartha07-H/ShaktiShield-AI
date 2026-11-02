import os
import sys
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SHAKTISHIELD AI"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", "shaktishield-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Short-lived access token: 15 minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7     # Secure refresh token: 7 days
    MFA_CHALLENGE_EXPIRE_MINUTES: int = 5  # Temporary MFA challenge expiry
    SECURE_COOKIES: bool = False           # Set True in production over HTTPS
    
    # Brute Force & Rate Limiting Controls
    MAX_FAILED_LOGIN_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_MINUTES: int = 15
    
    # Argon2 Hashing Cost Controls
    ARGON2_TIME_COST: int = 2
    ARGON2_MEMORY_COST: int = 19456
    ARGON2_PARALLELISM: int = 1
    TESTING: bool = False
    
    # Privacy & Data Retention
    LOCATION_RETENTION_HOURS: int = 24
    
    # Database: Defaults to local SQLite fallback if DATABASE_URL is not set
    DATABASE_URL: str = "sqlite:///./shaktishield.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://shaktishield.vercel.app",
        "https://*.vercel.app"
    ]
    
    # Operational flags
    DEMO_MODE: bool = True
    SMS_PROVIDER_CONFIGURED: bool = False
    EMAIL_PROVIDER_CONFIGURED: bool = False
    BLOCKCHAIN_NETWORK: str = "Polygon Amoy Testnet (Modular Ready)"
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=(".env", "backend/.env", "../.env"),
        extra="allow"
    )

    @property
    def normalized_database_url(self) -> str:
        """
        Normalizes PostgreSQL connection strings for SQLAlchemy + psycopg2 driver.
        Ensures test environments (pytest or TESTING flag) strictly use isolated SQLite
        to prevent accidental connection, drop, or mutation of production database records.
        """
        if self.TESTING or os.getenv("TESTING") == "True" or "pytest" in sys.modules:
            return "sqlite:///./test_shaktishield.db"
        url = (self.DATABASE_URL or "").strip()
        if not url:
            return "sqlite:///./shaktishield.db"
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url

settings = Settings()
