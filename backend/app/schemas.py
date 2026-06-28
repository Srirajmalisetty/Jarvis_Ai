from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_email: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    preferences: str
    preferred_style: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserPreferencesUpdate(BaseModel):
    preferences: Optional[str] = None
    preferred_style: Optional[str] = None

# Google Schemas
class GoogleAuthUrl(BaseModel):
    auth_url: str

class GoogleStatusResponse(BaseModel):
    connected: bool
    email: Optional[str] = None
    scopes: List[str] = []

# News Schemas
class NewsArticleBase(BaseModel):
    date: str
    time: str
    headline: str
    summary: str
    category: str
    country: str
    source: str
    url: str
    importance_score: float
    ai_notes: Optional[str] = None
    status: str

class NewsArticleResponse(NewsArticleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Task Schemas
class TaskCreate(BaseModel):
    title: str
    notes: Optional[str] = None
    due: Optional[str] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    notes: Optional[str] = None
    due: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Chat Schemas
class ChatMessage(BaseModel):
    role: str  # user, assistant
    content: str

class ChatHistoryResponse(ChatMessage):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatQuery(BaseModel):
    message: str

# Automation Log Schemas
class AutomationLogResponse(BaseModel):
    id: int
    trigger_name: str
    status: str
    message: Optional[str] = None
    gemini_tokens: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Dashboard / Analytics Schemas
class AnalyticsDashboard(BaseModel):
    emails_today: int
    meetings_today: int
    tasks_completed: int
    news_collected: int
    sheet_updates: int
    api_usage: int
    gemini_tokens_used: int
    automation_logs: List[AutomationLogResponse] = []
