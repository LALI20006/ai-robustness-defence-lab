@echo off
title AI Robustness Defence Lab - Unified Server
cd /d "%~dp0"

echo =====================================================================
echo       AI Robustness Defence Lab - Unified Production Server
echo =====================================================================
echo.

if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Python virtual environment not found in .\venv!
    echo Please run: python -m venv venv and pip install -r backend\requirements.txt
    pause
    exit /b 1
)

echo [*] Starting Unified Server on http://127.0.0.1:8000...
echo [*] Serves both React 19 Frontend and FastAPI Backend
echo.

start "" http://127.0.0.1:8000
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

pause
