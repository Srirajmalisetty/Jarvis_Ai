from typing import Any
from googleapiclient.discovery import build
from sqlalchemy.orm import Session

from app.models import GoogleCredential
from app.auth import get_google_credentials

# Service configs
SERVICES_CONFIG = {
    "gmail": {"name": "gmail", "version": "v1"},
    "calendar": {"name": "calendar", "version": "v3"},
    "sheets": {"name": "sheets", "version": "v4"},
    "drive": {"name": "drive", "version": "v3"},
    "docs": {"name": "docs", "version": "v1"},
    "tasks": {"name": "tasks", "version": "v1"},
    "contacts": {"name": "people", "version": "v1"}
}

def get_google_service(user_id: int, service_key: str, db: Session) -> Any:
    """Retrieves an authenticated Google API service client for a given user."""
    if service_key not in SERVICES_CONFIG:
        raise ValueError(f"Unknown Google service: {service_key}")
        
    db_credential = db.query(GoogleCredential).filter(GoogleCredential.user_id == user_id).first()
    if not db_credential:
        raise ValueError("Google account not connected or authorization is missing.")
        
    # Get active google credentials (auto refreshes if expired)
    credentials = get_google_credentials(db_credential)
    
    cfg = SERVICES_CONFIG[service_key]
    service = build(cfg["name"], cfg["version"], credentials=credentials)
    return service
