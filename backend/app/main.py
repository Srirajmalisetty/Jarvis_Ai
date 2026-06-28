from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import os

from app.database import engine, Base, get_db, SessionLocal
from app.config import settings
from app.models import User, GoogleCredential, NewsArticle, TaskItem, ChatHistory, AutomationLog
from app import schemas
from app import auth
from app import google_services
from app.agents import gmail_agent, calendar_agent, sheets_agent, news_agent
from app import gemini
from app.scheduler import start_scheduler, shutdown_scheduler, hourly_news_job, daily_briefing_job, evening_productivity_job

# Auto-build database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="JARVIS AI OS Backend", version="1.0.0")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# WebSocket active connections
active_connections: List[WebSocket] = []

@app.on_event("startup")
def startup_event():
    # 1. Create default user if not exists
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@jarvis.ai").first()
        if not admin:
            hashed_pwd = auth.hash_password("jarvispass")
            new_admin = User(
                email="admin@jarvis.ai",
                hashed_password=hashed_pwd,
                preferences=json_serialize({
                    "owner_name": "Sriraj",
                    "core_temp": "optimal",
                    "voice_enabled": True
                }),
                preferred_style="Professional, highly articulate, futuristic, inspired by Iron Man's JARVIS assistant."
            )
            db.add(new_admin)
            db.commit()
            print("Default admin user created: admin@jarvis.ai / jarvispass")
    finally:
        db.close()
        
    # 2. Start APScheduler
    start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    shutdown_scheduler()

# Helper for JSON serialization
def json_serialize(obj: Any) -> str:
    import json
    return json.dumps(obj)

def json_deserialize(val: str) -> Dict[str, Any]:
    import json
    try:
        return json.loads(val) if val else {}
    except Exception:
        return {}

# Security Dependencies
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    email = auth.verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Real-time WebSocket Log Publisher
@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        # Send initial confirmation
        await websocket.send_json({"type": "status", "message": "Console WebSocket Connected to JARVIS Core."})
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)

async def broadcast_log(message: str, severity: str = "info"):
    payload = {
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        "message": message,
        "severity": severity
    }
    for conn in active_connections:
        try:
            await conn.send_json(payload)
        except Exception:
            pass

# --- AUTH ROUTES ---
@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = auth.hash_password(user_data.password)
    user = User(email=user_data.email, hashed_password=hashed_pwd)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_email": user.email}

# --- GOOGLE OAUTH FLOW ---
@app.get("/api/auth/google")
def get_google_auth(state: str):
    auth_url = auth.get_google_url_or_state = auth.get_google_auth_url(state)
    return {"auth_url": auth_url}

@app.get("/api/auth/google/callback")
def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    # Parse state (should be JWT token or email identifying user)
    # For local simplicity, we tie to our default user if state isn't a valid user
    email = auth.verify_token(state)
    if not email:
        email = "admin@jarvis.ai"
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    try:
        token_data = auth.exchange_google_code(code)
        
        # Save or update credentials
        cred = db.query(GoogleCredential).filter(GoogleCredential.user_id == user.id).first()
        if cred:
            cred.encrypted_access_token = auth.encrypt_data(token_data["access_token"])
            if token_data.get("refresh_token"):
                cred.encrypted_refresh_token = auth.encrypt_data(token_data["refresh_token"])
            cred.token_expiry = token_data["token_expiry"]
            cred.scopes = json_serialize(token_data["scopes"])
        else:
            cred = GoogleCredential(
                user_id=user.id,
                encrypted_access_token=auth.encrypt_data(token_data["access_token"]),
                encrypted_refresh_token=auth.encrypt_data(token_data["refresh_token"]) if token_data.get("refresh_token") else "",
                token_expiry=token_data["token_expiry"],
                scopes=json_serialize(token_data["scopes"])
            )
            db.add(cred)
            
        db.commit()
        return {"status": "success", "message": f"Successfully connected Google Account: {token_data['email']}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth exchange failed: {str(e)}")

@app.get("/api/auth/google/status", response_model=schemas.GoogleStatusResponse)
def google_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cred = db.query(GoogleCredential).filter(GoogleCredential.user_id == current_user.id).first()
    if not cred:
        return {"connected": False}
    try:
        # Load credentials (will refresh if expired)
        google_cred = auth.get_google_credentials(cred)
        # Fetch actual profile email
        user_info = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {google_cred.token}"}
        ).json()
        
        return {
            "connected": True,
            "email": user_info.get("email"),
            "scopes": json_deserialize(cred.scopes)
        }
    except Exception:
        return {"connected": False}

# --- ASSISTANT / CHAT CORE ---
@app.post("/api/assistant/chat")
async def chat_interaction(query: schemas.ChatQuery, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Save User message
    user_msg = ChatHistory(user_id=current_user.id, role="user", content=query.message)
    db.add(user_msg)
    db.commit()
    
    await broadcast_log(f"Received query: '{query.message}'", "info")
    
    # Retrieve past history for context
    history = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).order_by(ChatHistory.timestamp.asc()).all()
    history_list = [{"role": h.role, "content": h.content} for h in history]
    
    # Call Gemini core
    jarvis_response = gemini.chat_assistant(
        query.message,
        history_list,
        current_user.preferences,
        current_user.preferred_style
    )
    
    # Save Assistant response
    assistant_msg = ChatHistory(user_id=current_user.id, role="assistant", content=jarvis_response)
    db.add(assistant_msg)
    db.commit()
    
    await broadcast_log(f"JARVIS AI responded to chat.", "success")
    return {"response": jarvis_response}

@app.get("/api/assistant/history", response_model=List[schemas.ChatHistoryResponse])
def get_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).order_by(ChatHistory.timestamp.asc()).all()

# --- GMAIL AGENT ---
@app.get("/api/gmail/emails")
def list_emails(query: str = "label:INBOX", max_results: int = 15, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return gmail_agent.get_emails(current_user.id, query=query, max_results=max_results, db=db)

@app.post("/api/gmail/emails/{message_id}/star")
def star_email_endpoint(message_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    success = gmail_agent.star_email(current_user.id, message_id, db=db)
    return {"success": success}

@app.post("/api/gmail/emails/{message_id}/archive")
def archive_email_endpoint(message_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    success = gmail_agent.archive_email(current_user.id, message_id, db=db)
    return {"success": success}

@app.post("/api/gmail/emails/{message_id}/delete")
def delete_email_endpoint(message_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    success = gmail_agent.delete_email(current_user.id, message_id, db=db)
    return {"success": success}

@app.post("/api/gmail/emails/reply")
def reply_email(thread_id: str, to: str, subject: str, body: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = gmail_agent.send_reply(current_user.id, thread_id, to, subject, body, db=db)
    return {"result": result}

@app.get("/api/gmail/analyze")
def ai_analyze_inbox(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return gmail_agent.ai_analyze_inbox(current_user.id, db=db)

# --- CALENDAR AGENT ---
@app.get("/api/calendar/events")
def get_events(days: int = 7, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    start = datetime.now(timezone.utc)
    end = start + timedelta(days=days)
    return calendar_agent.get_calendar_events(current_user.id, start, end, db=db)

@app.post("/api/calendar/events")
def create_event(
    summary: str,
    start_time: str,
    end_time: str,
    description: Optional[str] = None,
    location: Optional[str] = None,
    attendees: Optional[List[str]] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Detect conflicts before creating
    conflicts = calendar_agent.check_scheduling_conflicts(current_user.id, start_time, end_time, db=db)
    if conflicts:
        raise HTTPException(
            status_code=409,
            detail={"message": "Conflict detected with existing schedule.", "conflicts": conflicts}
        )
        
    return calendar_agent.create_calendar_event(
        current_user.id, summary, start_time, end_time, description, location, attendees, db=db
    )

@app.delete("/api/calendar/events/{event_id}")
def delete_event(event_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    success = calendar_agent.delete_calendar_event(current_user.id, event_id, db=db)
    return {"success": success}

@app.get("/api/calendar/suggest")
def suggest_slots(date: str, duration: int = 30, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return calendar_agent.suggest_meeting_slots(current_user.id, date, duration, db=db)

# --- GOOGLE SHEETS AGENT ---
@app.post("/api/sheets/create")
def create_sheet(title: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return sheets_agent.create_spreadsheet(current_user.id, title, db=db)

@app.get("/api/sheets/read")
def read_sheet(spreadsheet_id: str, range_name: str = "Sheet1!A1:Z100", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return sheets_agent.read_spreadsheet_values(current_user.id, spreadsheet_id, range_name, db=db)

@app.post("/api/sheets/append")
def append_sheet(spreadsheet_id: str, values: List[List[Any]], range_name: str = "Sheet1!A1", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    success = sheets_agent.append_spreadsheet_rows(current_user.id, spreadsheet_id, values, range_name, db=db)
    return {"success": success}

@app.post("/api/sheets/analyze")
def analyze_sheet_data(spreadsheet_id: str, range_name: str = "Sheet1!A1:Z50", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = sheets_agent.read_spreadsheet_values(current_user.id, spreadsheet_id, range_name, db=db)
    if not rows:
        raise HTTPException(status_code=404, detail="No values found in sheet range.")
    headers = rows[0]
    data_rows = rows[1:]
    analysis = gemini.generate_sheet_analysis(headers, data_rows)
    return {
        "headers": headers,
        "rows": data_rows[:10],
        "analysis": analysis
    }

# --- NEWS INTELLIGENCE AGENT ---
@app.get("/api/news/articles", response_model=List[schemas.NewsArticleResponse])
def get_articles(db: Session = Depends(get_db)):
    return db.query(NewsArticle).order_by(NewsArticle.importance_score.desc(), NewsArticle.created_at.desc()).limit(50).all()

@app.post("/api/news/trigger")
def trigger_news_sync(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    added = news_agent.run_news_intelligence_agent(db, current_user.id)
    return {"success": True, "articles_added": added}

# --- AUTOWORKFLOW ENGINE ---
@app.get("/api/automations/logs", response_model=List[schemas.AutomationLogResponse])
def get_automation_logs(db: Session = Depends(get_db)):
    return db.query(AutomationLog).order_by(AutomationLog.timestamp.desc()).limit(30).all()

@app.post("/api/automations/run/{job_name}")
def run_automation_manually(job_name: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if job_name == "hourly_news":
        hourly_news_job()
    elif job_name == "daily_briefing":
        daily_briefing_job()
    elif job_name == "evening_report":
        evening_productivity_job()
    else:
        raise HTTPException(status_code=400, detail=f"Unknown job: {job_name}")
    return {"status": "success", "message": f"Job '{job_name}' triggered successfully."}

# --- MEMORY / USER SETTINGS ---
@app.get("/api/memory/preferences")
def get_preferences(current_user: User = Depends(get_current_user)):
    return {
        "preferences": json_deserialize(current_user.preferences),
        "preferred_style": current_user.preferred_style
    }

@app.post("/api/memory/preferences")
def update_preferences(pref_data: schemas.UserPreferencesUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if pref_data.preferences is not None:
        current_user.preferences = pref_data.preferences
    if pref_data.preferred_style is not None:
        current_user.preferred_style = pref_data.preferred_style
    db.commit()
    return {"status": "success", "message": "Memory settings updated successfully."}

# --- DASHBOARD ANALYTICS ---
@app.get("/api/analytics/dashboard", response_model=schemas.AnalyticsDashboard)
def get_dashboard_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0)
    
    # Calculate values
    # Tasks completed today
    tasks_completed = db.query(TaskItem).filter(
        TaskItem.user_id == current_user.id,
        TaskItem.status == "completed",
        TaskItem.completed_at >= today_start
    ).count()
    
    news_collected = db.query(NewsArticle).count()
    
    # Estimate updates/usage
    sheet_updates = db.query(AutomationLog).filter(
        AutomationLog.trigger_name == "hourly_news",
        AutomationLog.status == "success"
    ).count()
    
    gemini_tokens_used = sum([
        log.gemini_tokens for log in db.query(AutomationLog).all()
    ])
    
    logs = db.query(AutomationLog).order_by(AutomationLog.timestamp.desc()).limit(10).all()
    
    return {
        "emails_today": 12,  # Simulated today's stats
        "meetings_today": 3,
        "tasks_completed": tasks_completed,
        "news_collected": news_collected,
        "sheet_updates": sheet_updates,
        "api_usage": 150,
        "gemini_tokens_used": gemini_tokens_used,
        "automation_logs": logs
    }
