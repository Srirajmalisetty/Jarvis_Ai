# Set bypass policy for this process execution
$Host.UI.RawUI.WindowTitle = "JARVIS AI | Operating System Console"

Write-Host "
  ==============================================================
   ██████  █████  ██████  ██    ██ ███████      █████  ██ 
        ██ ██   ██ ██   ██ ██    ██ ██          ██   ██ ██ 
        ██ ███████ ██████  ██    ██ ███████     ███████ ██ 
   ██   ██ ██   ██ ██   ██  ██  ██       ██     ██   ██ ██ 
    █████  ██   ██ ██   ██   ████   ███████     ██   ██ ██ 
  ==============================================================
            AUTONOMOUS OPERATING SYSTEM INITIALIZER
  ==============================================================
" -ForegroundColor Cyan

# 1. Backend setup
Write-Host "[SYSTEM] Setting up FastAPI Core Services..." -ForegroundColor Yellow
cd backend

if (-not (Test-Path "venv")) {
    Write-Host "[SYSTEM] Initializing clean Python virtual environment (venv)..." -ForegroundColor Gray
    python -m venv venv
}

Write-Host "[SYSTEM] Activating venv and resolving package requirements..." -ForegroundColor Gray
# Activate virtual environment
& "venv/Scripts/Activate.ps1"
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Start FastAPI backend server in background
Write-Host "[SYSTEM] Launching FastAPI Kernel Server on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& 'venv/Scripts/Activate.ps1'; uvicorn app.main:app --reload --port 8000"

cd ..

# 2. Frontend setup
Write-Host "[SYSTEM] Coordinating Next.js dashboard workspace..." -ForegroundColor Yellow
cd frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "[SYSTEM] Node modules missing. Downloading packages..." -ForegroundColor Gray
    npm.cmd install --legacy-peer-deps
}

# Start Next.js frontend dev server in background
Write-Host "[SYSTEM] Launching Dashboard HUD on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm.cmd run dev"

cd ..

Write-Host "
  ==============================================================
  JARVIS CORE INITIALIZED SUCCESSFULLY.
  FastAPI Server URL: http://localhost:8000
  Next.js HUD Dashboard: http://localhost:3000
  
  Press Ctrl + Space to trigger Voice Control.
  ==============================================================
" -ForegroundColor Cyan

# Wait 5 seconds and open browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
