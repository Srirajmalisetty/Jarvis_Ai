# JARVIS AI: Autonomous Personal Operating System

An advanced, production-ready AI personal operating system modeled on Iron Man's JARVIS assistant, designed to manage the Google Workspace ecosystem (Gmail, Calendar, Sheets, Drive, Tasks, Contacts) and leverage Google Gemini Cognitive APIs for intelligence, data summary, scheduling conflict resolution, and automation.

```
  ==============================================================
   ██████  █████  ██████  ██    ██ ███████      █████  ██ 
        ██ ██   ██ ██   ██ ██    ██ ██          ██   ██ ██ 
        ██ ███████ ██████  ██    ██ ███████     ███████ ██ 
   ██   ██ ██   ██ ██   ██  ██  ██       ██     ██   ██ ██ 
    █████  ██   ██ ██   ██   ████   ███████     ██   ██ ██ 
  ==============================================================
```

## System Architecture

- **Frontend (Next.js 16 + React 19 + Tailwind v4 + Framer Motion):** Styled with high-FPS animated orb centers, glassmorphism panel modules, neon glow accents, and custom SVG charting overlays.
- **Backend (FastAPI + SQLite/PostgreSQL + APScheduler):** Daemon scheduler running hourly news aggregation, morning briefs at 8 AM, and evening diagnostics at 8 PM.
- **Cognitive Layer (Gemini API):** Custom fallback wrapper with legacy/new SDK compatibility. Handles priority mail routing, news importance calculations, sheets data extraction, and voice command synthesis.
- **Ecosystem Bridges:** Authenticates scopes dynamically, refreshes tokens securely via OAuth 2.0 flow, and encrypts credentials on disk using a 256-bit Fernet key.

---

## Workspace Directory Structure

```
jarvis-ai/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── gmail_agent.py
│   │   │   ├── calendar_agent.py
│   │   │   ├── sheets_agent.py
│   │   │   └── news_agent.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── gemini.py
│   │   ├── google_services.py
│   │   └── scheduler.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── DashboardView.tsx
│   │   │   ├── AssistantView.tsx
│   │   │   ├── InboxView.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   ├── SheetsView.tsx
│   │   │   ├── DriveView.tsx
│   │   │   ├── NewsView.tsx
│   │   │   ├── TasksView.tsx
│   │   │   ├── MemoryView.tsx
│   │   │   ├── AutomationsView.tsx
│   │   │   ├── AnalyticsView.tsx
│   │   │   ├── SettingsView.tsx
│   │   │   └── DeveloperConsoleView.tsx
│   │   └── utils/
│   │       └── api.ts
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── run_jarvis.ps1
```

---

## One-Click Local Setup (Windows PowerShell)

Ensure that **Python 3.10+** and **Node.js v20+** are installed.

1. Open PowerShell in the project directory.
2. Run the initializer script:
   ```powershell
   .\run_jarvis.ps1
   ```
3. The script will automatically:
   - Create a Python virtualenv and install libraries in `backend`.
   - Boot the Uvicorn FastAPI server on `http://localhost:8000`.
   - Install React modules and boot Next.js on `http://localhost:3000`.
   - Open browser windows to the landing page.

---

## Docker Compose Setup (Production Multi-Container)

Ensure Docker Desktop is active. Run:

```bash
docker-compose up --build
```

Services exposed:
- **FastAPI Core Endpoint:** `http://localhost:8000`
- **Dashboard UI Workspace:** `http://localhost:3000`
- **PostgreSQL Database Engine:** Port `5432`
- **Redis Cache Instance:** Port `6379`

---

## Decryption Credentials Checklist

JARVIS utilizes JWT-based session security. Use the default login bypass parameters:
- **System Identifier:** `admin@jarvis.ai`
- **Access Code:** `jarvispass`

You can customize user properties, core language styles, and voices directly within the **Memory View** panel.

---

## Key Feature Capabilities

1. **AI Dashboard Core:** Time/weather stats, calendar overlays, unread emails counts, and news feeds. Clicking the central pulsing orb initiates acoustic browser voice dictation.
2. **Gmail Agent:** Categorization levels (High, Medium, Low), action points extraction lists, meeting triggers alerts, and context drafting replies.
3. **Calendar Booking:** Schedules meetings, checks start/end times with database entries, displays **CONFLICT DETECTED** panels when overlaps occur, and proposes free slots instantly.
4. **Sheets Explorer:** Automatically visualizes rows in neon grids, analyzes cost/revenue distributions, and charts trends with SVG layouts.
5. **News Intelligence:** Hourly aggregator fetching Google News RSS feeds, analyzing relevance scores using Gemini, and automatically appending row details to target Google Sheet ID `1NUNNfqbJoE09j6YNs3v5nsSwg0N5piDTQf2YilT-R4c`.
6. **Linguistic Terminal:** Renders diagnostic logging directly over a WebSocket connection `/ws/logs`.
