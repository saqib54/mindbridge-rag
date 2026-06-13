@echo off
echo ============================================
echo  MindBridge-RAG - Starting Backend
echo ============================================
cd /d "%~dp0backend"

if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo Installing/checking dependencies...
pip install -r requirements.txt -q

echo.
echo Starting FastAPI backend on http://localhost:8001
echo Press Ctrl+C to stop.
echo.
uvicorn main:app --reload --port 8001 --host 0.0.0.0
pause
