@echo off
echo ============================================
echo  MindBridge-RAG - Start All Services
echo ============================================
echo.
echo Starting Backend (FastAPI) in new window...
start "MindBridge Backend" cmd /k "cd /d f:\cabal\cloud chatbot\mindbridge-rag\backend && venv\Scripts\activate && uvicorn main:app --reload --port 8001"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend (React) in new window...
start "MindBridge Frontend" cmd /k "cd /d f:\cabal\cloud chatbot\mindbridge-rag\frontend && npm run dev"

echo.
echo ============================================
echo  Both services are starting!
echo  Backend:  http://localhost:8001
echo  Frontend: http://localhost:3000
echo  API Docs: http://localhost:8001/docs
echo ============================================
echo.
pause
