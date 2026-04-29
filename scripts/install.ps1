# install.ps1 - IP Recorder installation script
# Requires PowerShell 5.1+ or PowerShell Core 7+

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Set-Location (Join-Path $PSScriptRoot '..')

Write-Host "=== IP Recorder - Install ===" -ForegroundColor Green

# 检查 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host "[INFO] Installing dependencies..." -ForegroundColor Green
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm install failed." -ForegroundColor Red
    exit 1
}

# 创建 data 目录
if (-not (Test-Path 'data')) {
    Write-Host "[INFO] Creating data directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path 'data' | Out-Null
}

# 下载 ip2region.xdb
$xdbPath = 'data\ip2region.xdb'
$xdbUrl  = 'https://raw.githubusercontent.com/lionsoul2014/ip2region/master/data/ip2region.xdb'

if (Test-Path $xdbPath) {
    Write-Host "[INFO] ip2region.xdb already exists, skipping download." -ForegroundColor Yellow
} else {
    Write-Host "[INFO] Downloading ip2region.xdb..." -ForegroundColor Green
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $xdbUrl -OutFile $xdbPath
        Write-Host "[OK] ip2region.xdb downloaded." -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to download ip2region.xdb: $_" -ForegroundColor Red
        exit 1
    }
}

# 生成 .env
if (-not (Test-Path '.env')) {
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
    Write-Host "[WARN] Please update ADMIN_PASSWORD and SESSION_SECRET in .env before starting." -ForegroundColor Yellow
} else {
    Write-Host "[INFO] .env already exists, skipping." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[OK] Installation complete. Run scripts\start.ps1 to launch." -ForegroundColor Green
