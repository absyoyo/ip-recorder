@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0\.."

echo === IP Recorder - Install ===

echo [INFO] Installing dependencies...
call npm install

if not exist "data" mkdir data

if not exist "data\ip2region.xdb" (
    echo [INFO] Downloading ip2region.xdb...
    powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://raw.githubusercontent.com/lionsoul2014/ip2region/master/data/ip2region.xdb', 'data\ip2region.xdb')"
    echo [OK] ip2region.xdb downloaded.
)

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [INFO] Created .env from .env.example.
    ) else (
        echo PORT=3000> .env
        echo ADMIN_PASSWORD=change_me_123>> .env
        echo SESSION_SECRET=please_change_this_secret>> .env
        echo [INFO] Generated default .env template.
    )
    echo [WARN] Please update ADMIN_PASSWORD and SESSION_SECRET in .env before starting.
)

echo.
echo [OK] Installation complete. Run scripts\start.bat to launch.
pause
