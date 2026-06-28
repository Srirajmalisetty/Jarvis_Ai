# JARVIS AI — Autonomous Personal Operating System

An immersive, glassmorphic HUD personal assistant and cognitive engine styled after Iron Man's JARVIS, designed to orchestrate your Google Workspace ecosystem.

---

## 📝 Project Summary
* **Futuristic Cockpit HUD:** Implements a premium, responsive glassmorphic user interface inspired by premium aesthetic guidelines (Iron Man + Apple + Tesla + OpenAI).
* **AI Cognitive Orchestrator:** Powered by Google's Gemini cognitive models for parsing user intent and executing actions over your Google Workspace.
* **Unified Workspace Integrations:** Seamless operational control over Gmail, Google Calendar, Google Sheets, Google Drive, Google Tasks, and Google Contacts.
* **Production-Ready Cryptography:** Secure tokens are double-encrypted on database lifecycle hooks using AES-128 Fernet encryption modules.
* **Background Sync Automation:** Active cron schedulers scrape news updates and synchronize ecosystem data in real-time.

---

## 📋 Project Description
JARVIS AI is a complete, autonomous personal operating system designed to elevate everyday productivity by wrapping your Google Workspace in a stateful cognitive layer. It is built as a split-architecture application:

- The **Client HUD Console** presents an interactive control room containing real-time widgets: calendar schedules, email lists, task queues, news synchronizers, and a live developer terminal. Animated gradients and neon borders create a highly interactive, responsive visual hierarchy.
- The **Core Backend** functions as a FastAPI service that communicates with SQLite databases, maps API endpoints, handles native user authorization checks, and routes prompt templates to Gemini. Security mechanisms ensure that OAuth access tokens are decrypted only on active runtime operations.

## 🧠 Core Features & Subsystem Architecture

### 1. The Cognitive Orchestration Layer
JARVIS employs Google Gemini API models to parse and translate raw text instructions into structured execution commands.
When you chat with JARVIS:
- The backend compiles system instructions specifying your linguistic styles and integrated cognitive capabilities.
- The prompt is routed to Gemini, which returns responses dynamically formatted to prompt the UI to load charts or custom grids when telemetry data is parsed.

### 2. Specialized Workspace Agents
- **Gmail Agent:** Scrapes incoming emails, classifies them by urgency (High, Medium, Low), checks if they contain calendar slots, and dynamically drafts replies.
- **Calendar Agent:** Integrates directly with Google Calendar to retrieve meetings and resolve scheduling conflicts automatically.
- **Sheets Agent:** Connects to specified spreadsheets, compiles logs, parses metrics, and dynamically computes analytical summaries.
- **News Scraper Agent:** A background job running on APScheduler that fetches news articles, analyzes their content, calculates an importance score out of 10, and filters out spam automatically.

---

## 📊 Database Schema Details

The SQLite database utilizes the following structured schema definition:
- **`users`:** Stores administrator login profiles with security-salted passwords hashed via native `bcrypt`.
- **`google_credentials`:** Retains OAuth 2.0 credentials, encrypted access tokens, refresh tokens, scopes, and verification status.
- **`news_articles`:** Caches analyzed news headlines, calculated importance ratings, raw summaries, and sync categories.
- **`tasks`:** Tracks workspace to-do items and sync schedules.
- **`chat_history`:** Stores dialogue histories between the user and the assistant core.
- **`automation_logs`:** Chronicles cron runtime summaries and diagnostic statistics.

---

## 🔒 Cryptographic Token Flow & Security

To guarantee that your Google ecosystem credentials are never exposed:
1. **Passphrase Hashing:** Administrator passwords are encrypted using `bcrypt` and verified on access handshake request loops.
2. **Fernet AES-128 Encryption:** Upon successful OAuth consent, access tokens are encrypted with a 128-bit symmetric key (`ENCRYPTION_KEY`) before SQLite insertion.
3. **Lifespan Decryption:** Access keys are decrypted dynamically inside temporary threads during active requests and immediately cleared from system memory.

---

## 🌌 System Overview

JARVIS AI is composed of two primary modules:
1. **Interactive HUD (Frontend):** A premium, glassmorphic dashboard styled with electric blue glowing panels, scanlines, a pulsing animated assistant core, and real-time telemetry gauges.
2. **Cognitive Orchestrator (Backend):** A high-performance FastAPI service housing the SQLite database, task scheduler, cryptography encryption engines, and the Gemini cognitive layer.

---

## 🛠️ Technology Stack & Languages

### 1. Languages
- **Frontend:** TypeScript, JavaScript, CSS (Vanilla Custom CSS)
- **Backend:** Python

### 2. Core Libraries & Tools
- **Next.js 16:** Managed web framework utilizing the Turbopack compiler.
- **Tailwind CSS & Lucide Icons:** Modern utility styling and vector telemetry iconography.
- **FastAPI:** High-performance asynchronous Python web server.
- **SQLAlchemy:** Object-Relational Mapper for the database schema definition.
- **Bcrypt:** Secure 256-bit password hashing.
- **Cryptography (Fernet):** AES-128 bit decryption/encryption engine for securing Google OAuth tokens.
- **Google API Client:** Integration layers for Gmail, Calendar, Sheets, Drive, Tasks, and Contacts.
- **APScheduler:** Background daemon runner for active news feeds and sync events.
- **Docker:** Containerized image builders for multi-environment deployments.

---

## 📦 File Architecture

```text
jarvis-ai/
├── backend/                  # Python FastAPI application
│   ├── app/
│   │   ├── agents/           # Specialized worker models (Gmail, Calendar, etc.)
│   │   ├── auth.py           # Native bcrypt hashing & token verification
│   │   ├── config.py         # Environmental settings & schemas
│   │   ├── database.py       # SQL Alchemy database config
│   │   ├── main.py           # ASGI App entry, Lifespan scopes & API routes
│   │   ├── models.py         # SQLAlchemy data schemas
│   │   └── schemas.py        # Pydantic validation schemas
│   ├── Dockerfile            # Container definition (Root-context)
│   └── requirements.txt      # Python dependencies manifest
├── frontend/                 # Next.js web interface
│   ├── src/
│   │   ├── app/              # Layouts, styling, and main entry
│   │   ├── components/       # Interface HUD panels (Assistant, Inbox, Settings)
│   │   └── utils/            # API client fetch wrappers and mock datasets
│   ├── Dockerfile            # Frontend container definition
│   └── package.json          # Node dependencies manifest
├── render.yaml               # Render Blueprint service orchestrator
├── docker-compose.yml        # Local Docker-Compose runtime config
└── README.md                 # System documentation
```

---

## 🚀 Live Cloud Deployment

JARVIS AI has been configured and deployed to production on:
- **Frontend:** Hosted on **Vercel** (Next.js serverless deployment).
- **Backend & Database:** Hosted on **Render** (Docker containerized web service and managed Postgres database).

*Note: Custom environment variables (`NEXT_PUBLIC_API_URL`, `DATABASE_URL`, and Google OAuth tokens) are dynamically linked inside the Vercel and Render setting panels to keep secrets completely private and secure.*

---

## 🔑 Access Credentials

To log in and initialize the core:
* **System Identifier:** `admin@jarvis.ai`
* **Access Code:** `jarvispass`

---

## 🖥️ Local Execution

### 1. Backend Server Setup
1. Navigate to the `backend/` directory.
2. Initialize virtual environment and install packages:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Create a `.env` file containing your credentials.
4. Launch the server:
   ```powershell
   python -m uvicorn app.main:app --port 8000
   ```

### 2. Frontend Interface Setup
1. Navigate to the `frontend/` directory.
2. Install packages:
   ```powershell
   npm install
   ```
3. Run the development server:
   ```powershell
   npm run dev
   ```
4. Access the system core at `http://localhost:3000`.
