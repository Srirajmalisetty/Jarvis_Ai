from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
import os
from datetime import datetime, timezone, time

from app.database import SessionLocal
from app.models import User, AutomationLog, NewsArticle, TaskItem
from app.agents.news_agent import run_news_intelligence_agent
from app.agents.gmail_agent import get_emails
from app.agents.calendar_agent import get_calendar_events
from app.gemini import generate_daily_briefing, call_gemini

# Create global scheduler
scheduler = BackgroundScheduler()

def hourly_news_job():
    """Runs the news intelligence agent for all active users."""
    db: Session = SessionLocal()
    try:
        users = db.query(User).filter(User.is_active == True).all()
        for user in users:
            print(f"Running Hourly News Job for user: {user.email}")
            run_news_intelligence_agent(db, user.id)
    except Exception as e:
        print(f"Scheduler News Job error: {e}")
    finally:
        db.close()

def daily_briefing_job():
    """Generates the morning briefing (8 AM) for all active users."""
    db: Session = SessionLocal()
    try:
        users = db.query(User).filter(User.is_active == True).all()
        for user in users:
            print(f"Generating Daily Morning Briefing for user: {user.email}")
            
            # 1. Fetch items
            start_today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            end_today = start_today.replace(hour=23, minute=59, second=59)
            
            # Fetch Calendar
            events = get_calendar_events(user.id, start_today, end_today, db=db)
            
            # Fetch Emails
            unread_emails = get_emails(user.id, query="label:UNREAD", max_results=5, db=db)
            
            # Fetch Tasks
            tasks = db.query(TaskItem).filter(
                TaskItem.user_id == user.id,
                TaskItem.status == "needsAction"
            ).limit(5).all()
            tasks_list = [{"title": t.title, "due": t.due} for t in tasks]
            
            # Fetch Top Breaking News
            news = db.query(NewsArticle).filter(
                NewsArticle.importance_score >= 7.0
            ).order_by(NewsArticle.created_at.desc()).limit(5).all()
            news_list = [{"headline": n.headline, "importance_score": n.importance_score} for n in news]
            
            # Mock Weather (uses AI to create dynamic forecast)
            weather_forecast = "Sunny, 28°C. Perfect day for high efficiency."
            try:
                weather_forecast = call_gemini(
                    f"Create a short, futuristic 1-sentence weather forecast for date: {datetime.now().strftime('%Y-%m-%d')}.",
                    "You are a weather AI."
                )
            except Exception:
                pass
                
            # 2. Call Gemini Briefing
            briefing_md = generate_daily_briefing(weather_forecast, unread_emails, events, tasks_list, news_list)
            
            # 3. Save briefing to a text log in user workspace or automation log
            log = AutomationLog(
                trigger_name="daily_briefing",
                status="success",
                message=briefing_md,
                gemini_tokens=2500
            )
            db.add(log)
            db.commit()
    except Exception as e:
        print(f"Scheduler Daily Briefing error: {e}")
    finally:
        db.close()

def evening_productivity_job():
    """Generates the evening productivity report (8 PM)."""
    db: Session = SessionLocal()
    try:
        users = db.query(User).filter(User.is_active == True).all()
        for user in users:
            print(f"Generating Evening Productivity Report for user: {user.email}")
            
            # Calculate counts
            today_str = datetime.now().strftime("%Y-%m-%d")
            completed_tasks_count = db.query(TaskItem).filter(
                TaskItem.user_id == user.id,
                TaskItem.status == "completed",
                TaskItem.completed_at >= datetime.now().replace(hour=0, minute=0, second=0)
            ).count()
            
            # Fetch analytics values
            news_count = db.query(NewsArticle).count()
            
            # Generate AI Summary of productivity
            prompt = f"""
            Generate a short, witty, high-performance executive evening status report for the user.
            Today's Stats:
            - Tasks Completed: {completed_tasks_count}
            - Intelligent News Synced: {news_count}
            
            Maintain the JARVIS voice. Conclude with a futuristic sign-off and an action suggestion for tomorrow.
            """
            report = call_gemini(prompt, "You are JARVIS. Keep it brief and elegant.")
            
            log = AutomationLog(
                trigger_name="evening_report",
                status="success",
                message=report,
                gemini_tokens=1000
            )
            db.add(log)
            db.commit()
    except Exception as e:
        print(f"Scheduler Evening Report error: {e}")
    finally:
        db.close()

def start_scheduler():
    """Configures jobs and starts the scheduler daemon thread."""
    if not scheduler.running:
        # Run news intelligence hourly
        scheduler.add_job(hourly_news_job, "interval", hours=1, id="hourly_news")
        
        # Run morning briefing at 8:00 AM
        scheduler.add_job(daily_briefing_job, CronTrigger(hour=8, minute=0), id="daily_briefing")
        
        # Run evening report at 8:00 PM
        scheduler.add_job(evening_productivity_job, CronTrigger(hour=20, minute=0), id="evening_report")
        
        scheduler.start()
        print("JARVIS Background Scheduler Started.")

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("JARVIS Background Scheduler Shutdown.")
