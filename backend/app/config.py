import os
from typing import List, Union, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Adversarial Robustness Evaluation & Defence Framework for AI-Based Malware and Intrusion Classifiers"
    SHORT_NAME: str = "AI Robustness Defence Lab"
    ENVIRONMENT: str = "production"
    PORT: int = 8000

    DATABASE_URL: str = "sqlite:///./app.db"
    JWT_SECRET_KEY: str = "super-secret-robustness-cybersecurity-token-key-2026-prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    FRONTEND_URL: Optional[str] = None
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

    UPLOAD_DIR: str = "./data/uploads"
    PROCESSED_DIR: str = "./data/processed"
    SAMPLE_DIR: str = "./data/sample"
    MODEL_DIR: str = "./models/saved_models"
    REPORT_DIR: str = "./reports"
    LOG_DIR: str = "./logs"
    MAX_UPLOAD_MB: int = 50

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_postgres_url(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("["):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    def get_allowed_origins(self) -> List[str]:
        origins = list(self.CORS_ORIGINS) if isinstance(self.CORS_ORIGINS, list) else []
        if self.FRONTEND_URL and self.FRONTEND_URL.strip():
            url = self.FRONTEND_URL.strip().rstrip("/")
            if url not in origins:
                origins.append(url)
        return origins

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure required directories exist
for path in [
    settings.UPLOAD_DIR,
    settings.PROCESSED_DIR,
    settings.SAMPLE_DIR,
    settings.MODEL_DIR,
    settings.REPORT_DIR,
    settings.LOG_DIR,
]:
    os.makedirs(path, exist_ok=True)
