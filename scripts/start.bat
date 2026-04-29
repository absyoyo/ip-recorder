@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0\.."

echo === IP Recorder ===
echo [INFO] Starting server...
echo [INFO] Homepage : http://localhost:3000/
echo [INFO] Admin    : http://localhost:3000/admin
echo.

node server/app.js
pause
