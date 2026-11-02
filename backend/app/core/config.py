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
    
    # Database: Defaults to local SQLite, but can be set to Supabase PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./shaktishield.db")
    
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
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="allow")

    @property
    def normalized_database_url(self) -> str:
        # Handles postgres:// to postgresql:// dialect conversion for modern SQLAlchemy/Supabase
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

settings = Settings()
