@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

echo === IP Recorder ===

:: 切换到项目根目录
cd /d "%~dp0\.."

:: 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

:: 检查依赖
if not exist "node_modules" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:: 检查 data 目录
if not exist "data" (
    echo [INFO] Creating data directory...
    mkdir data
)

:: 检查 ip2region.xdb
if not exist "data\ip2region.xdb" (
    echo [WARN] data\ip2region.xdb not found. Geo info will return unknown.
    echo [WARN] Run scripts\install.bat to download it.
)

:: 检查 .env
if not exist ".env" (
    echo [INFO] .env not found. Generating...
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
    echo [ERROR] Please set ADMIN_PASSWORD and SESSION_SECRET in .env, then restart.
    pause
    exit /b 1
)

:: 检查 ADMIN_PASSWORD 是否为默认值
set ADMIN_PWD=
for /f "usebackq tokens=1,* delims==" %%a in (`findstr /b "ADMIN_PASSWORD=" .env`) do set ADMIN_PWD=%%b
if "!ADMIN_PWD!"=="change_me_123" (
    echo [ERROR] ADMIN_PASSWORD is still the default value. Please update .env.
    pause
    exit /b 1
)
if "!ADMIN_PWD!"=="" (
    echo [ERROR] ADMIN_PASSWORD is not set. Please update .env.
    pause
    exit /b 1
)

:: 读取 PORT
set PORT=3000
for /f "usebackq tokens=1,* delims==" %%a in (`findstr /b "PORT=" .env`) do set PORT=%%b

echo [OK] All checks passed. Starting server...
echo [OK] Homepage : http://localhost:%PORT%/
echo [OK] Admin    : http://localhost:%PORT%/admin
echo.

node --experimental-sqlite server/app.js
pause
endlocal
