import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from app.config import settings

# Configure standard generativeai fallback
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    _has_generativeai = True
except Exception as e:
    print(f"Failed to configure google-generativeai: {e}")
    _has_generativeai = False

# Try configuring the new google-genai package
try:
    from google import genai as new_genai
    from google.genai import types
    new_client = new_genai.Client(api_key=settings.GEMINI_API_KEY)
    _has_new_genai = True
except Exception as e:
    print(f"Failed to load new google-genai client: {e}")
    _has_new_genai = False

def call_gemini(prompt: str, system_instruction: Optional[str] = None, json_mode: bool = False) -> str:
    """Wrapper that calls Gemini using whichever SDK is successfully installed."""
    if _has_new_genai:
        try:
            config = {}
            if system_instruction:
                config["system_instruction"] = system_instruction
            if json_mode:
                config["response_mime_type"] = "application/json"
                
            response = new_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(**config) if config else None
            )
            return response.text
        except Exception as e:
            print(f"New Gemini SDK failed: {e}. Falling back...")
            
    if _has_generativeai:
        try:
            generation_config = {}
            if json_mode:
                generation_config["response_mime_type"] = "application/json"
                
            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                generation_config=generation_config if generation_config else None,
                system_instruction=system_instruction
            )
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Legacy Gemini SDK failed: {e}")
            raise e
            
    raise RuntimeError("No Google Gemini SDK client could be initialized. Please check API Key.")

def summarize_text(text: str) -> str:
    prompt = f"Summarize the following text concisely:\n\n{text}"
    try:
        return call_gemini(prompt, "You are a professional secretary.")
    except Exception:
        return text[:200] + "..."

def analyze_email_priority(subject: str, sender: str, body: str) -> Dict[str, Any]:
    prompt = f"""
    Analyze the following email and return a JSON object with:
    - "priority": one of ["high", "medium", "low"]
    - "category": one of ["work", "personal", "finance", "social", "spam", "newsletter"]
    - "action_items": a list of string tasks extracted from the email (if any)
    - "is_meeting": boolean, whether the email contains an invitation or request to meet.

    Email Details:
    From: {sender}
    Subject: {subject}
    Body:
    {body[:2000]}
    """
    try:
        response_text = call_gemini(prompt, "Return valid JSON only.", json_mode=True)
        return json.loads(response_text)
    except Exception as e:
        print(f"Email analysis error: {e}")
        return {
            "priority": "medium",
            "category": "work",
            "action_items": [],
            "is_meeting": False
        }

def analyze_news_item(headline: str, snippet: str, category: str) -> Dict[str, Any]:
    prompt = f"""
    Analyze the following news item:
    Headline: {headline}
    Snippet: {snippet}
    Original Category: {category}

    Return a JSON object with:
    - "summary": a single sentence, concise AI summary of the event.
    - "importance_score": a float from 0.0 (low) to 10.0 (high) based on global business, technology, or finance impact.
    - "ai_notes": a short bullet-point analysis of why this matters.
    - "companies": a list of companies mentioned.
    - "dates": a list of specific dates mentioned.
    - "refined_category": a more specific category (e.g., AI Research, Startup Funding, Crypto, Tech Regulation, Cybersecurity Breach).
    """
    try:
        response_text = call_gemini(prompt, "Return valid JSON only.", json_mode=True)
        return json.loads(response_text)
    except Exception as e:
        print(f"News analysis error: {e}")
        return {
            "summary": snippet or headline,
            "importance_score": 5.0,
            "ai_notes": "Analyzed automatically by JARVIS.",
            "companies": [],
            "dates": [],
            "refined_category": category
        }

def generate_daily_briefing(weather: str, emails: List[dict], calendar_events: List[dict], tasks: List[dict], news: List[dict]) -> str:
    prompt = f"""
    Generate a daily briefing for the user in a professional, motivating tone (styled like JARVIS).
    
    Weather: {weather}
    
    Top Unread/Important Emails:
    {json.dumps([{ 'from': e['from'], 'subject': e['subject'] } for e in emails[:5]], indent=2)}
    
    Calendar Events Today:
    {json.dumps([{ 'summary': c['summary'], 'start': c['start'] } for c in calendar_events[:5]], indent=2)}
    
    Pending Tasks:
    {json.dumps([{ 'title': t['title'], 'due': t.get('due') } for t in tasks[:5]], indent=2)}
    
    Breaking News:
    {json.dumps([{ 'headline': n['headline'], 'score': n.get('importance_score') } for n in news[:5]], indent=2)}
    
    Format the briefing in Markdown. Include sections for:
    - Morning Greeting & Weather
    - Calendar Agenda
    - Email Action Items
    - Tasks & Reminders
    - Curated News Brief
    Keep it futuristic, elegant, and punchy.
    """
    try:
        return call_gemini(prompt, "You are JARVIS, an advanced, highly intelligent operating system assistant.")
    except Exception as e:
        return f"Good morning. Here is your daily summary: Weather is {weather}. You have {len(calendar_events)} meetings and {len(tasks)} pending tasks."

def generate_sheet_analysis(headers: List[str], rows: List[List[Any]]) -> Dict[str, Any]:
    prompt = f"""
    Analyze the following spreadsheet data:
    Headers: {headers}
    Rows (truncated to 30 sample rows):
    {json.dumps(rows[:30], indent=2)}
    
    Return a JSON object with:
    - "data_summary": A high-level description of what this data represents.
    - "key_insights": A list of 3-5 interesting trends, patterns, or anomalies.
    - "recommended_chart": A JSON spec for a chart:
      - "type": "bar", "line", "pie", or "scatter"
      - "title": "Chart Title"
      - "x_axis": name of the column for X axis
      - "y_axis": name of column(s) for Y axis (list)
    """
    try:
        response_text = call_gemini(prompt, "Return valid JSON only.", json_mode=True)
        return json.loads(response_text)
    except Exception as e:
        print(f"Spreadsheet analysis error: {e}")
        return {
            "data_summary": "Spreadsheet data containing rows.",
            "key_insights": ["Automatic sheet analysis failed, showing raw rows."],
            "recommended_chart": {"type": "bar", "title": "Data Overview", "x_axis": headers[0] if headers else "", "y_axis": []}
        }

def chat_assistant(message: str, chat_history: List[Dict[str, str]], user_preferences: str, preferred_style: str) -> str:
    """Converses with the user. Injects memory & user preferences into the conversation flow."""
    system_instruction = f"""
    You are JARVIS, an autonomous AI Personal Operating System designed to manage the user's Google ecosystem.
    You are professional, articulate, slightly witty, and highly capable, inspired by JARVIS from Iron Man.
    
    User Preferences:
    {user_preferences}
    
    Writing Style Guidelines:
    {preferred_style}
    
    You have direct access to Google Workspace (Gmail, Calendar, Sheets, Drive, Tasks, Contacts) through background agents.
    If the user asks you to read, create, update, delete, or search anything in their email, sheets, drive, contacts or calendar, assume you can do it, state that you will execute it, or ask for clarifications if needed.
    
    Format your responses in elegant markdown with clear headings, lists, tables, or charts where appropriate.
    """
    
    # Compile conversation context
    # google-genai uses chat sessions, but we can formulate a single history representation for simplicity
    formatted_context = ""
    for msg in chat_history[-10:]:  # Last 10 messages for context
        role_label = "User" if msg["role"] == "user" else "JARVIS"
        formatted_context += f"{role_label}: {msg['content']}\n"
        
    formatted_context += f"User: {message}\nJARVIS:"
    
    try:
        return call_gemini(formatted_context, system_instruction=system_instruction)
    except Exception as e:
        return f"I apologize, sir. I encountered an error communicating with my core intelligence: {e}"
