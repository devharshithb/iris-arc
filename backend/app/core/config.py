import os
from typing import List

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    ACCESS_TOKEN_EXPIRES_MIN: int = int(os.getenv("ACCESS_TOKEN_EXPIRES_MIN", "30"))
    REFRESH_TOKEN_EXPIRES_MIN: int = int(os.getenv("REFRESH_TOKEN_EXPIRES_MIN", "43200"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./irisarc.db")
    JWT_ALG: str = "HS256"

    # CORS origins as list
    ALLOWED_ORIGINS: List[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,https://localhost:3000",
        ).split(",")
    ]

settings = Settings()
