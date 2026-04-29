@echo off
setlocal
echo Starting installation for IP Recorder...

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed.
    exit /b 1
)

:: Install dependencies
echo Installing dependencies...
call npm install --production

:: Create data directory
if not exist "data" (
    echo Creating data directory...
    mkdir data
)

:: Download ip2region.xdb using PowerShell
set XDB_URL=https://raw.githubusercontent.com/lionsoul2014/ip2region/master/data/ip2region.xdb
echo Downloading ip2region.xdb...
powershell -Command "Invoke-WebRequest -Uri '%XDB_URL%' -OutFile 'data\ip2region.xdb'"

if %ERRORLEVEL% equ 0 (
    echo Installation successful!
) else (
    echo Error downloading ip2region.xdb.
    exit /b 1
)
endlocal
