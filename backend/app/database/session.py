from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

db_url = settings.normalized_database_url

def get_engine():
    """Create a resilient SQLAlchemy engine for Supabase PostgreSQL or SQLite fallback."""
    url = settings.normalized_database_url
    if url.startswith("sqlite"):
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
        )
    else:
        # Supabase PostgreSQL configuration with connection pooling and recycling
        return create_engine(
            url,
            pool_pre_ping=True,      # Tests connection liveness before usage
            pool_recycle=300,        # Recycle connections every 5 minutes to prevent Supabase idle drops
            pool_size=10,            # Steady-state connection pool size
            max_overflow=20,         # Maximum overflow connections during traffic bursts
        )

engine = get_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
