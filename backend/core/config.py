import os
from typing import List, Union

import psycopg2
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv


class Settings(BaseSettings):
    APP_NAME: str = "SafeQuest"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # SQLite by default so the project runs with zero setup.
    # For Postgres, set DATABASE_URL in .env, e.g.:
    #   postgresql+psycopg2://user:password@localhost:5432/dbname
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORTIHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

    # Reports from users at or above this reputation count immediately.
    # Everyone else's reports wait in the admin queue until approved.
    AUTO_APPROVE_MIN_REPUTATION: float = 3.0

    # Comma-separated in .env, e.g. BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:8000
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS")

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.CORS_ORIGINS.split(",") if o.strip()]


    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
