# start.ps1 - IP Recorder startup script
# Requires PowerShell 5.1+ or PowerShell Core 7+

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Set-Location (Join-Path $PSScriptRoot '..')

Write-Host "=== IP Recorder ===" -ForegroundColor Green

# 检查 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# 检查依赖
if (-not (Test-Path 'node_modules')) {
    Write-Host "[INFO] node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] npm install failed." -ForegroundColor Red
        exit 1
    }
}

# 检查 data 目录
if (-not (Test-Path 'data')) {
    Write-Host "[INFO] Creating data directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path 'data' | Out-Null
}

# 检查 ip2region.xdb
if (-not (Test-Path 'data\ip2region.xdb')) {
    Write-Host "[WARN] data\ip2region.xdb not found. Geo info will return unknown." -ForegroundColor Yellow
    Write-Host "[WARN] Run scripts\install.ps1 to download it." -ForegroundColor Yellow
}

# 检查 .env
if (-not (Test-Path '.env')) {
    Write-Host "[INFO] .env not found. Generating..." -ForegroundColor Yellow
    if (Test-Path '.env.example') {
        Copy-Item '.env.example' '.env'
        Write-Host "[INFO] Created .env from .env.example." -ForegroundColor Yellow
    } else {
        @"
# Port to listen on, default 3000
PORT=3000

# Admin panel password (required)
ADMIN_PASSWORD=change_me_123

# Session secret key (use a random string)
SESSION_SECRET=please_change_this_secret
"@ | Set-Content '.env' -Encoding UTF8
        Write-Host "[INFO] Generated default .env template." -ForegroundColor Yellow
    }
    Write-Host "[ERROR] Please set ADMIN_PASSWORD and SESSION_SECRET in .env, then restart." -ForegroundColor Red
    exit 1
}

# 解析 .env
$envVars = @{}
Get-Content '.env' -Encoding UTF8 | Where-Object { $_ -match '^\s*[^#]\S*=.*' } | ForEach-Object {
    $parts = $_ -split '=', 2
    $envVars[$parts[0].Trim()] = $parts[1].Trim()
}

# 检查 ADMIN_PASSWORD
$adminPwd = $envVars['ADMIN_PASSWORD']
if (-not $adminPwd -or $adminPwd -eq 'change_me_123') {
    Write-Host "[ERROR] ADMIN_PASSWORD is not set or still default. Please update .env." -ForegroundColor Red
    exit 1
}

# 读取 PORT
$port = if ($envVars['PORT']) { $envVars['PORT'] } else { '3000' }

Write-Host "[OK] All checks passed. Starting server..." -ForegroundColor Green
Write-Host "[OK] Homepage : http://localhost:$port/" -ForegroundColor Green
Write-Host "[OK] Admin    : http://localhost:$port/admin" -ForegroundColor Green
Write-Host ""

node --experimental-sqlite server/app.js
