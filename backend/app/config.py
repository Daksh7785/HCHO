import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://postgres:postgres_secure_pass@localhost:5432/hcho_db"
    )
    
    # Security & API limits
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secure-secret-key-atmoswatch-cpcb-isro")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    # ML Model Config
    MODEL_VERSION: str = "2.1"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
