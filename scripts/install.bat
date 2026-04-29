@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

echo === IP Recorder - Install ===

cd /d "%~dp0\.."

:: 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

:: 安装依赖
echo [INFO] Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

:: 创建 data 目录
if not exist "data" (
    echo [INFO] Creating data directory...
    mkdir data
)

:: 下载 ip2region.xdb
set XDB_PATH=data\ip2region.xdb
set XDB_URL=https://raw.githubusercontent.com/lionsoul2014/ip2region/master/data/ip2region.xdb

if exist "%XDB_PATH%" (
    echo [INFO] ip2region.xdb already exists, skipping download.
) else (
    echo [INFO] Downloading ip2region.xdb...
    powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%XDB_URL%' -OutFile '%XDB_PATH%'"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to download ip2region.xdb.
        pause
        exit /b 1
    )
    echo [OK] ip2region.xdb downloaded.
)

:: 生成 .env
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [INFO] Created .env from .env.example.
    ) else (
        (
            echo # Port to listen on, default 3000
            echo PORT=3000
            echo.
            echo # Admin panel password ^(required^)
            echo ADMIN_PASSWORD=change_me_123
            echo.
            echo # Session secret key ^(use a random string^)
            echo SESSION_SECRET=please_change_this_secret
        ) > .env
        echo [INFO] Generated default .env template.
    )
    echo [WARN] Please update ADMIN_PASSWORD and SESSION_SECRET in .env before starting.
) else (
    echo [INFO] .env already exists, skipping.
)

echo.
echo [OK] Installation complete. Run scripts\start.bat to launch.
pause
endlocal
