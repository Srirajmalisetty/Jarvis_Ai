import base64
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import email
from email.mime.text import MIMEText

from app.google_services import get_google_service
from app.gemini import summarize_text, analyze_email_priority

def parse_email_headers(message_payload: Dict[str, Any]) -> Dict[str, str]:
    headers = message_payload.get("headers", [])
    result = {"subject": "", "from": "", "to": "", "date": ""}
    for header in headers:
        name = header.get("name", "").lower()
        if name in result:
            result[name] = header.get("value", "")
    return result

def get_email_body(payload: Dict[str, Any]) -> str:
    """Recursively parse multipart mime message to extract text."""
    body = ""
    if "parts" in payload:
        for part in payload["parts"]:
            body += get_email_body(part)
    else:
        mime_type = payload.get("mimeType", "")
        data = payload.get("body", {}).get("data", "")
        if mime_type == "text/plain" and data:
            try:
                body += base64.urlsafe_b64decode(data.encode()).decode("utf-8", errors="ignore")
            except Exception:
                pass
    return body

def get_emails(user_id: int, query: str = "label:INBOX", max_results: int = 10, db: Session = None) -> List[Dict[str, Any]]:
    """List emails matching a query."""
    service = get_google_service(user_id, "gmail", db)
    try:
        results = service.users().messages().list(userId="me", q=query, maxResults=max_results).execute()
        messages = results.get("messages", [])
        
        emails_list = []
        for msg in messages:
            msg_detail = service.users().messages().get(userId="me", id=msg["id"], format="full").execute()
            headers = parse_email_headers(msg_detail.get("payload", {}))
            body = get_email_body(msg_detail.get("payload", {}))
            if not body:
                body = msg_detail.get("snippet", "")
                
            emails_list.append({
                "id": msg_detail["id"],
                "thread_id": msg_detail["threadId"],
                "subject": headers["subject"],
                "from": headers["from"],
                "to": headers["to"],
                "date": headers["date"],
                "snippet": msg_detail.get("snippet", ""),
                "body": body[:5000],  # Truncate long bodies for AI processing
                "labels": msg_detail.get("labelIds", [])
            })
        return emails_list
    except Exception as e:
        print(f"Error fetching emails: {e}")
        return []

def modify_email_labels(user_id: int, message_id: str, add_labels: List[str] = [], remove_labels: List[str] = [], db: Session = None) -> bool:
    """Modify labels on an email (archive, star, trash, etc.)"""
    service = get_google_service(user_id, "gmail", db)
    try:
        body = {
            "addLabelIds": add_labels,
            "removeLabelIds": remove_labels
        }
        service.users().messages().modify(userId="me", id=message_id, body=body).execute()
        return True
    except Exception as e:
        print(f"Error modifying email labels: {e}")
        return False

def archive_email(user_id: int, message_id: str, db: Session) -> bool:
    return modify_email_labels(user_id, message_id, remove_labels=["INBOX"], db=db)

def star_email(user_id: int, message_id: str, db: Session) -> bool:
    return modify_email_labels(user_id, message_id, add_labels=["STARRED"], db=db)

def delete_email(user_id: int, message_id: str, db: Session) -> bool:
    """Move message to TRASH."""
    service = get_google_service(user_id, "gmail", db)
    try:
        service.users().messages().trash(userId="me", id=message_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting email: {e}")
        return False

def send_reply(user_id: int, thread_id: str, to: str, subject: str, body_text: str, db: Session) -> Dict[str, Any]:
    """Send an email reply inside a thread."""
    service = get_google_service(user_id, "gmail", db)
    try:
        message = MIMEText(body_text)
        message["to"] = to
        message["from"] = "me"
        # Subjects in replies should have Re: if not already present
        if not subject.lower().startswith("re:"):
            subject = f"Re: {subject}"
        message["subject"] = subject
        message["threadId"] = thread_id
        
        raw_msg = base64.urlsafe_b64encode(message.as_bytes()).decode()
        sent_message = service.users().messages().send(
            userId="me",
            body={"raw": raw_msg, "threadId": thread_id}
        ).execute()
        return sent_message
    except Exception as e:
        print(f"Error sending email reply: {e}")
        return {}

def ai_analyze_inbox(user_id: int, db: Session) -> List[Dict[str, Any]]:
    """Analyzes the latest 10 unread inbox emails, adding classification, priority level, and action items."""
    emails = get_emails(user_id, query="label:UNREAD", max_results=10, db=db)
    analyzed_emails = []
    for email_item in emails:
        # Use AI to detect priority and extract action items
        analysis = analyze_email_priority(email_item["subject"], email_item["from"], email_item["body"])
        
        email_item["priority"] = analysis.get("priority", "medium")
        email_item["category"] = analysis.get("category", "general")
        email_item["action_items"] = analysis.get("action_items", [])
        email_item["is_meeting"] = analysis.get("is_meeting", False)
        
        analyzed_emails.append(email_item)
    return analyzed_emails
