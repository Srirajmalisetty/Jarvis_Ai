from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.google_services import get_google_service

def get_calendar_events(user_id: int, start_time: Optional[datetime] = None, end_time: Optional[datetime] = None, db: Session = None) -> List[Dict[str, Any]]:
    """List events from the user's primary calendar within a time range."""
    service = get_google_service(user_id, "calendar", db)
    try:
        if not start_time:
            start_time = datetime.now(timezone.utc)
        if not end_time:
            end_time = start_time + timedelta(days=7)
            
        time_min = start_time.isoformat()
        time_max = end_time.isoformat()
        
        events_result = service.events().list(
            calendarId="primary",
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy="startTime"
        ).execute()
        
        events = events_result.get("items", [])
        formatted_events = []
        
        for event in events:
            # Parse start and end times
            start = event.get("start", {}).get("dateTime") or event.get("start", {}).get("date")
            end = event.get("end", {}).get("dateTime") or event.get("end", {}).get("date")
            
            formatted_events.append({
                "id": event["id"],
                "summary": event.get("summary", "No Title"),
                "description": event.get("description", ""),
                "location": event.get("location", ""),
                "start": start,
                "end": end,
                "attendees": [a.get("email") for a in event.get("attendees", []) if a.get("email")],
                "html_link": event.get("htmlLink", "")
            })
            
        return formatted_events
    except Exception as e:
        print(f"Error fetching calendar events: {e}")
        return []

def create_calendar_event(
    user_id: int,
    summary: str,
    start_time_iso: str,
    end_time_iso: str,
    description: Optional[str] = None,
    location: Optional[str] = None,
    attendees: Optional[List[str]] = None,
    db: Session = None
) -> Dict[str, Any]:
    """Create a new event on the primary calendar."""
    service = get_google_service(user_id, "calendar", db)
    try:
        event_body = {
            "summary": summary,
            "start": {"dateTime": start_time_iso},
            "end": {"dateTime": end_time_iso},
        }
        
        if description:
            event_body["description"] = description
        if location:
            event_body["location"] = location
        if attendees:
            event_body["attendees"] = [{"email": email} for email in attendees]
            
        created_event = service.events().insert(calendarId="primary", body=event_body).execute()
        return {
            "id": created_event.get("id"),
            "summary": created_event.get("summary"),
            "html_link": created_event.get("htmlLink"),
            "start": created_event.get("start", {}).get("dateTime"),
            "end": created_event.get("end", {}).get("dateTime")
        }
    except Exception as e:
        print(f"Error creating calendar event: {e}")
        return {}

def delete_calendar_event(user_id: int, event_id: str, db: Session) -> bool:
    """Delete an event from primary calendar."""
    service = get_google_service(user_id, "calendar", db)
    try:
        service.events().delete(calendarId="primary", eventId=event_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting calendar event: {e}")
        return False

def check_scheduling_conflicts(user_id: int, start_time_iso: str, end_time_iso: str, db: Session) -> List[Dict[str, Any]]:
    """Checks for overlapping events in the given time range."""
    try:
        start_time = datetime.fromisoformat(start_time_iso.replace("Z", "+00:00"))
        end_time = datetime.fromisoformat(end_time_iso.replace("Z", "+00:00"))
    except ValueError:
        # Fallback if parsing fails
        return []
        
    events = get_calendar_events(user_id, start_time - timedelta(minutes=1), end_time + timedelta(minutes=1), db=db)
    conflicts = []
    
    for event in events:
        try:
            ev_start = datetime.fromisoformat(event["start"].replace("Z", "+00:00"))
            ev_end = datetime.fromisoformat(event["end"].replace("Z", "+00:00"))
            
            # Check overlap
            if max(start_time, ev_start) < min(end_time, ev_end):
                conflicts.append(event)
        except Exception:
            pass
            
    return conflicts

def suggest_meeting_slots(user_id: int, date_str: str, duration_minutes: int = 30, db: Session = None) -> List[Dict[str, str]]:
    """Suggests free time slots on a given date (YYYY-MM-DD) between 09:00 and 18:00 (user's timezone/local)."""
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return []
        
    # Standard work hours: 9 AM to 6 PM
    day_start = datetime(target_date.year, target_date.month, target_date.day, 9, 0, 0, tzinfo=timezone.utc)
    day_end = datetime(target_date.year, target_date.month, target_date.day, 18, 0, 0, tzinfo=timezone.utc)
    
    # Fetch all events for that day
    events = get_calendar_events(user_id, day_start, day_end, db=db)
    
    busy_intervals = []
    for ev in events:
        try:
            start = datetime.fromisoformat(ev["start"].replace("Z", "+00:00"))
            end = datetime.fromisoformat(ev["end"].replace("Z", "+00:00"))
            busy_intervals.append((start, end))
        except Exception:
            pass
            
    # Sort busy intervals
    busy_intervals.sort(key=lambda x: x[0])
    
    # Find free slots
    free_slots = []
    current_time = day_start
    slot_duration = timedelta(minutes=duration_minutes)
    
    while current_time + slot_duration <= day_end:
        slot_end = current_time + slot_duration
        is_free = True
        
        for busy_start, busy_end in busy_intervals:
            # Overlaps if max(start1, start2) < min(end1, end2)
            if max(current_time, busy_start) < min(slot_end, busy_end):
                is_free = False
                current_time = busy_end  # Skip past this busy window
                break
                
        if is_free:
            free_slots.append({
                "start": current_time.isoformat(),
                "end": slot_end.isoformat()
            })
            current_time += slot_duration
            
    return free_slots[:5]  # Limit to 5 suggestions
