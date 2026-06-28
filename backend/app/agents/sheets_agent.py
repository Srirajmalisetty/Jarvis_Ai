from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.google_services import get_google_service

def create_spreadsheet(user_id: int, title: str, db: Session) -> Dict[str, str]:
    """Create a new Google Spreadsheet and return its ID and URL."""
    service = get_google_service(user_id, "sheets", db)
    try:
        spreadsheet_body = {
            "properties": {
                "title": title
            }
        }
        spreadsheet = service.spreadsheets().create(body=spreadsheet_body, fields="spreadsheetId,spreadsheetUrl").execute()
        return {
            "spreadsheet_id": spreadsheet.get("spreadsheetId"),
            "url": spreadsheet.get("spreadsheetUrl")
        }
    except Exception as e:
        print(f"Error creating spreadsheet: {e}")
        return {}

def read_spreadsheet_values(user_id: int, spreadsheet_id: str, range_name: str = "Sheet1!A1:Z100", db: Session = None) -> List[List[Any]]:
    """Read values from a spreadsheet range."""
    service = get_google_service(user_id, "sheets", db)
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=range_name
        ).execute()
        return result.get("values", [])
    except Exception as e:
        print(f"Error reading spreadsheet {spreadsheet_id}: {e}")
        return []

def append_spreadsheet_rows(user_id: int, spreadsheet_id: str, values: List[List[Any]], range_name: str = "Sheet1!A1", db: Session = None) -> bool:
    """Appends rows of values to the spreadsheet."""
    service = get_google_service(user_id, "sheets", db)
    try:
        body = {
            "values": values
        }
        service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body=body
        ).execute()
        return True
    except Exception as e:
        print(f"Error appending rows to spreadsheet {spreadsheet_id}: {e}")
        return False

def update_spreadsheet_cells(user_id: int, spreadsheet_id: str, values: List[List[Any]], range_name: str, db: Session = None) -> bool:
    """Updates a specific block of cells in the spreadsheet."""
    service = get_google_service(user_id, "sheets", db)
    try:
        body = {
            "values": values
        }
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption="USER_ENTERED",
            body=body
        ).execute()
        return True
    except Exception as e:
        print(f"Error updating cells in spreadsheet {spreadsheet_id}: {e}")
        return False

def search_spreadsheet_rows(user_id: int, spreadsheet_id: str, query: str, range_name: str = "Sheet1!A1:Z100", db: Session = None) -> List[Dict[str, Any]]:
    """Searches spreadsheet rows for a specific text query."""
    values = read_spreadsheet_values(user_id, spreadsheet_id, range_name, db)
    if not values:
        return []
        
    matches = []
    headers = values[0] if len(values) > 0 else []
    
    for row_idx, row in enumerate(values[1:], start=2): # 1-indexed, headers are row 1
        row_str = " ".join([str(val) for val in row]).lower()
        if query.lower() in row_str:
            row_dict = {}
            for col_idx, val in enumerate(row):
                header_name = headers[col_idx] if col_idx < len(headers) else f"Column_{col_idx+1}"
                row_dict[header_name] = val
            row_dict["_row_number"] = row_idx
            matches.append(row_dict)
            
    return matches
