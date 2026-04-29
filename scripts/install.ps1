# install.ps1
Set-Location (Join-Path $PSScriptRoot '..')

Write-Host "=== IP Recorder - Install ===" -ForegroundColor Green

Write-Host "[INFO] Installing dependencies..."
npm install

if (-not (Test-Path 'data')) { New-Item -ItemType Directory -Path 'data' | Out-Null }

if (-not (Test-Path 'data\ip2region.xdb')) {
    Write-Host "[INFO] Downloading ip2region.xdb..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    (New-Object Net.WebClient).DownloadFile('https://raw.githubusercontent.com/lionsoul2014/ip2region/master/data/ip2region.xdb', 'data\ip2region.xdb')
    Write-Host "[OK] ip2region.xdb downloaded."
}

if (-not (Test-Path '.env')) {
    if (Test-Path '.env.example') {
        Copy-Item '.env.example' '.env'
        Write-Host "[INFO] Created .env from .env.example."
    } else {
        "PORT=3000`nADMIN_PASSWORD=change_me_123`nSESSION_SECRET=please_change_this_secret" | Set-Content '.env' -Encoding UTF8
        Write-Host "[INFO] Generated default .env template."
    }
    Write-Host "[WARN] Please update ADMIN_PASSWORD and SESSION_SECRET in .env before starting."
}

Write-Host ""
Write-Host "[OK] Installation complete. Run scripts\start.ps1 to launch." -ForegroundColor Green
