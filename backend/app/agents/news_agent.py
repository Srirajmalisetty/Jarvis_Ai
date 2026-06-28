import xml.etree.ElementTree as ET
import urllib.parse
import requests
from datetime import datetime
import email.utils
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.models import NewsArticle, GoogleCredential, AutomationLog
from app.config import settings
from app.agents.sheets_agent import append_spreadsheet_rows, read_spreadsheet_values
from app.gemini import analyze_news_item

NEWS_CATEGORIES = {
    "Artificial Intelligence": "AI OR \"Artificial Intelligence\" OR Gemini OR OpenAI",
    "Technology": "Technology OR Tech",
    "Finance": "Finance OR Stock Market",
    "Business": "Business OR Startups",
    "Cybersecurity": "Cybersecurity OR Hacking OR " + urllib.parse.quote("\"data breach\""),
    "Programming": "Programming OR Software OR Python OR Rust",
    "India": "India News",
    "Global": "Global News OR World News"
}

def fetch_google_news_rss(query: str) -> List[Dict[str, str]]:
    """Fetch headlines from Google News RSS feed for a specific search query."""
    url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=en-US&gl=US&ceid=US:en"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"Error fetching news for '{query}': Status {response.status_code}")
            return []
            
        root = ET.fromstring(response.content)
        items = []
        
        # Look for <item> nodes in the XML
        for item in root.findall(".//item")[:5]:  # Process top 5 headlines per category to avoid rate-limiting
            title = item.find("title").text if item.find("title") is not None else ""
            link = item.find("link").text if item.find("link") is not None else ""
            pub_date_str = item.find("pubDate").text if item.find("pubDate") is not None else ""
            
            # Split title into headline and source
            # e.g., "Apple releases new iPhone - TechCrunch"
            headline = title
            source = "Google News"
            if " - " in title:
                parts = title.rsplit(" - ", 1)
                headline = parts[0]
                source = parts[1]
                
            # Parse Date and Time
            date_str = datetime.utcnow().strftime("%Y-%m-%d")
            time_str = datetime.utcnow().strftime("%H:%M:%S")
            if pub_date_str:
                try:
                    parsed_date = email.utils.parsedate_to_datetime(pub_date_str)
                    date_str = parsed_date.strftime("%Y-%m-%d")
                    time_str = parsed_date.strftime("%H:%M:%S")
                except Exception:
                    pass
                    
            items.append({
                "headline": headline,
                "url": link,
                "source": source,
                "date": date_str,
                "time": time_str,
                "snippet": headline  # Use headline as snippet for summary if body is not loaded
            })
        return items
    except Exception as e:
        print(f"Failed to fetch news RSS for query {query}: {e}")
        return []

def initialize_google_sheet_headers(user_id: int, db: Session) -> bool:
    """Creates headers in the Google Sheet if they do not exist."""
    sheet_id = settings.GOOGLE_SHEET_ID
    try:
        existing_values = read_spreadsheet_values(user_id, sheet_id, "Sheet1!A1:C1", db)
        # Check if the header row has data
        if not existing_values or len(existing_values) == 0 or len(existing_values[0]) == 0 or existing_values[0][0] != "Date":
            headers = [
                ["Date", "Time", "Headline", "Summary", "Category", "Country", "Source", "URL", "Importance Score", "AI Notes", "Status"]
            ]
            append_spreadsheet_rows(user_id, sheet_id, headers, "Sheet1!A1", db)
            print("Google Sheet headers initialized.")
        return True
    except Exception as e:
        print(f"Failed to initialize spreadsheet headers: {e}")
        return False

def run_news_intelligence_agent(db: Session, user_id: int) -> int:
    """Executes the full news aggregation, AI enrichment, and Google Sheet sync.
    Returns the count of new articles collected."""
    
    # 1. Verify Google Credentials
    cred = db.query(GoogleCredential).filter(GoogleCredential.user_id == user_id).first()
    if not cred:
        print("News Agent warning: Google Account is not connected. Saving locally only.")
        has_google = False
    else:
        has_google = True
        # Try initializing sheet headers
        initialize_google_sheet_headers(user_id, db)
        
    total_added = 0
    
    # 2. Iterate categories
    for cat_name, query in NEWS_CATEGORIES.items():
        print(f"Processing category: {cat_name}")
        items = fetch_google_news_rss(query)
        
        for item in items:
            # 3. Check for duplicates in local DB
            exists = db.query(NewsArticle).filter(NewsArticle.headline == item["headline"]).first()
            if exists:
                continue
                
            # 4. Analyze news item with Gemini
            analysis = analyze_news_item(item["headline"], item["snippet"], cat_name)
            
            # Formulate country
            country = "India" if cat_name == "India" else "Global"
            
            # Save locally
            article = NewsArticle(
                date=item["date"],
                time=item["time"],
                headline=item["headline"],
                summary=analysis.get("summary", item["headline"]),
                category=analysis.get("refined_category", cat_name),
                country=country,
                source=item["source"],
                url=item["url"],
                importance_score=float(analysis.get("importance_score", 5.0)),
                ai_notes=json_to_text_notes(analysis.get("ai_notes", "")),
                status="pending"
            )
            
            # 5. Sync to Google Sheets if connected
            if has_google:
                row_data = [[
                    article.date,
                    article.time,
                    article.headline,
                    article.summary,
                    article.category,
                    article.country,
                    article.source,
                    article.url,
                    str(article.importance_score),
                    article.ai_notes,
                    "synced"
                ]]
                
                success = append_spreadsheet_rows(user_id, settings.GOOGLE_SHEET_ID, row_data, "Sheet1!A1", db)
                if success:
                    article.status = "synced"
                else:
                    article.status = "error"
                    
            db.add(article)
            db.commit()
            total_added += 1
            
    # Log execution
    log = AutomationLog(
        trigger_name="hourly_news",
        status="success" if total_added > 0 or has_google else "failure",
        message=f"Aggregated news. Added {total_added} new items.",
        gemini_tokens=total_added * 800  # Estimate token consumption
    )
    db.add(log)
    db.commit()
    
    return total_added

def json_to_text_notes(ai_notes: Any) -> str:
    if isinstance(ai_notes, list):
        return "\n".join([f"- {note}" for note in ai_notes])
    elif isinstance(ai_notes, dict):
        return "\n".join([f"{k}: {v}" for k, v in ai_notes.items()])
    return str(ai_notes)
