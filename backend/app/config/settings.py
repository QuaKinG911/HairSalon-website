from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "Hair Salon API"
    DEBUG: bool = True

    # Use .env DATABASE_URL for PostgreSQL in production, e.g.:
    # postgresql+psycopg2://postgres:postgres@localhost:5432/hairsalon
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/hairsalon"

    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60

    SESSION_SECRET_KEY: str = "change-session-secret-in-production"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
