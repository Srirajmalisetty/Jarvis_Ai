import datetime
from datetime import timedelta
from typing import Optional, Dict, Any, List
from jose import JWTError, jwt
import bcrypt
from cryptography.fernet import Fernet
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import requests
import json

from app.config import settings
from app.database import get_db
from app.models import GoogleCredential

# Cryptography config
fernet = Fernet(settings.ENCRYPTION_KEY.encode())

def hash_password(password: str) -> str:
    # Use native bcrypt logic
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

# Secure Token Storage (Fernet Encryption)
def encrypt_data(data: str) -> str:
    if not data:
        return ""
    return fernet.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    if not encrypted_data:
        return ""
    return fernet.decrypt(encrypted_data.encode()).decode()

# Google OAuth Flow helpers
GOOGLE_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/tasks",
    "https://www.googleapis.com/auth/contacts"
]

def get_google_client_config() -> Dict[str, Any]:
    return {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
        }
    }

def get_google_auth_url(state: str) -> str:
    client_config = get_google_client_config()
    flow = Flow.from_client_config(
        client_config,
        scopes=GOOGLE_SCOPES
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state
    )
    return auth_url

def exchange_google_code(code: str) -> Dict[str, Any]:
    client_config = get_google_client_config()
    flow = Flow.from_client_config(
        client_config,
        scopes=GOOGLE_SCOPES
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    flow.fetch_token(code=code)
    credentials = flow.credentials
    
    # Get user email using tokens
    user_info = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {credentials.token}"}
    ).json()
    
    return {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_expiry": credentials.expiry,
        "scopes": credentials.scopes,
        "email": user_info.get("email")
    }

def refresh_google_token(refresh_token: str) -> Dict[str, Any]:
    """Manually refreshes access token using Google refresh endpoint."""
    response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
    )
    
    if response.status_code != 200:
        raise Exception(f"Failed to refresh Google token: {response.text}")
        
    data = response.json()
    # If no new refresh token returned, keep the old one
    new_token = data.get("access_token")
    expires_in = data.get("expires_in", 3600)
    expiry = datetime.datetime.utcnow() + timedelta(seconds=expires_in)
    
    return {
        "access_token": new_token,
        "expiry": expiry
    }

def get_google_credentials(db_credential: GoogleCredential) -> Credentials:
    """Instantiate a google.oauth2.credentials.Credentials object from database record."""
    access_token = decrypt_data(db_credential.encrypted_access_token)
    refresh_token = decrypt_data(db_credential.encrypted_refresh_token) if db_credential.encrypted_refresh_token else None
    
    # Check expiry
    expiry = db_credential.token_expiry
    # Check if expired (or within 60 seconds of expiring)
    if expiry and expiry <= datetime.datetime.utcnow() + timedelta(seconds=60):
        if refresh_token:
            try:
                refresh_data = refresh_google_token(refresh_token)
                # Update db credential in caller
                access_token = refresh_data["access_token"]
                expiry = refresh_data["expiry"]
                db_credential.encrypted_access_token = encrypt_data(access_token)
                db_credential.token_expiry = expiry
                # Save changes
                from sqlalchemy.orm import Session
                db = Session.object_session(db_credential)
                if db:
                    db.commit()
            except Exception as e:
                print(f"Failed to auto-refresh token: {e}")
        else:
            print("Access token expired and no refresh token available.")
            
    scopes = json.loads(db_credential.scopes)
    
    return Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=scopes
    )
