@echo off
echo ============================================
echo  MindBridge-RAG - Starting Frontend
echo ============================================
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing npm dependencies...
    npm install
)

echo.
echo Starting React frontend on http://localhost:3000
echo Press Ctrl+C to stop.
echo.
npm run dev
pause
