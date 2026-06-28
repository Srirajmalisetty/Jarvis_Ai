# JARVIS AI — Autonomous Personal Operating System

An immersive, glassmorphic HUD personal assistant and cognitive engine styled after Iron Man's JARVIS, designed to orchestrate your Google Workspace ecosystem.

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
