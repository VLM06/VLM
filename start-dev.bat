@echo off
echo ==========================================
echo VLM ERP System v2.0 - Development Mode
echo ==========================================
echo.
echo 📦 Installing dependencies...
call npm install
echo.
echo 🚀 Starting server with auto-reload...
echo.
echo Press Ctrl+C to stop
echo.
npm run dev
echo.
echo ❌ Server stopped. Press any key to exit.
pause
