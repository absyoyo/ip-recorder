# start.ps1
Set-Location (Join-Path $PSScriptRoot '..')

Write-Host "=== IP Recorder ===" -ForegroundColor Green
Write-Host "[INFO] Starting server..."
Write-Host "[INFO] Homepage : http://localhost:3000/"
Write-Host "[INFO] Admin    : http://localhost:3000/admin"
Write-Host ""

node server/app.js
