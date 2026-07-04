@echo off
echo ==========================================
echo VLM ERP System v2.0 - Starting...
echo ==========================================
echo.
echo 📦 Installing dependencies...
call npm install
echo.
echo 🚀 Starting server...
echo.
npm start
echo.
echo ❌ Server stopped. Press any key to exit.
pause
