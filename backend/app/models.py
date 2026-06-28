from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    preferences = Column(Text, default="{}")  # JSON string
    preferred_style = Column(String, default="Professional, concise, intelligent")
    created_at = Column(DateTime, default=datetime.utcnow)

    credentials = relationship("GoogleCredential", back_populates="user", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("TaskItem", back_populates="user", cascade="all, delete-orphan")

class GoogleCredential(Base):
    __tablename__ = "google_credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    encrypted_access_token = Column(Text, nullable=False)
    encrypted_refresh_token = Column(Text, nullable=True)  # Can be null if not offline access, though we request it
    token_expiry = Column(DateTime, nullable=True)
    scopes = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="credentials")

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    headline = Column(String, unique=True, index=True, nullable=False)
    summary = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    country = Column(String, nullable=False)
    source = Column(String, nullable=False)
    url = Column(String, nullable=False)
    importance_score = Column(Float, default=0.0)
    ai_notes = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, synced, error
    created_at = Column(DateTime, default=datetime.utcnow)

class TaskItem(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)  # Using Google Task ID or local GUID
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    due = Column(String, nullable=True)
    status = Column(String, default="needsAction")  # needsAction or completed
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tasks")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_history")

class AutomationLog(Base):
    __tablename__ = "automation_logs"

    id = Column(Integer, primary_key=True, index=True)
    trigger_name = Column(String, nullable=False)  # hourly_news, daily_briefing, evening_report
    status = Column(String, nullable=False)  # success, failure
    message = Column(Text, nullable=True)
    gemini_tokens = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)
