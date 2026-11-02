import os
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
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
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
        Handles Supabase formats (postgres://, postgresql://, or postgresql+psycopg2://),
        while safely preserving sqlite:/// as a local development/testing fallback.
        """
        url = (self.DATABASE_URL or "").strip()
        if not url:
            return "sqlite:///./shaktishield.db"
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url

settings = Settings()
