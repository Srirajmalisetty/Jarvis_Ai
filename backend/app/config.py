import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    SECRET_KEY: str = "9a15f013dcdbe2a1a45749f7e53a23277839bf5cd8a4e8248c8b21c4323c2fa9"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "sqlite:///./jarvis.db"
    ENCRYPTION_KEY: str = "z7yK9Q_jFvJ7g6_T01uA9w8sC7xR9m2b4tY6v8P0m1E="

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"

    GEMINI_API_KEY: str
    GOOGLE_API_KEY: str
    GOOGLE_SHEET_ID: str = "1NUNNfqbJoE09j6YNs3v5nsSwg0N5piDTQf2YilT-R4c"
    GOOGLE_SHEET_URL: Optional[str] = None

settings = Settings()
