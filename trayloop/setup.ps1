# TrayLoop Local Setup Script (Windows PowerShell)
# Run from the trayloop/ root directory

$ErrorActionPreference = "Stop"

Write-Host "`n=== TrayLoop Local Setup ===" -ForegroundColor Cyan

# 1. Start Docker containers
Write-Host "`n[1/5] Starting Docker containers..." -ForegroundColor Yellow
Push-Location infrastructure/docker
docker compose up -d
Pop-Location

# 2. Wait for Postgres to be ready
Write-Host "`n[2/5] Waiting for PostgreSQL..." -ForegroundColor Yellow
$attempts = 0
$maxAttempts = 15
while ($attempts -lt $maxAttempts) {
    $result = docker exec docker-postgres-1 pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  PostgreSQL is ready" -ForegroundColor Green
        break
    }
    $attempts++
    Start-Sleep -Seconds 2
    Write-Host "  Waiting... ($attempts/$maxAttempts)"
}
if ($attempts -eq $maxAttempts) {
    Write-Host "  ERROR: PostgreSQL did not start" -ForegroundColor Red
    exit 1
}

# 3. Install dependencies
Write-Host "`n[3/5] Installing dependencies..." -ForegroundColor Yellow
npm install

# 4. Push database schema
Write-Host "`n[4/5] Pushing database schema..." -ForegroundColor Yellow
Push-Location packages/database

# Remove stale drizzle.config.ts if it exists alongside .js
if (Test-Path "drizzle.config.ts") {
    Write-Host "  Removing stale drizzle.config.ts" -ForegroundColor Yellow
    Remove-Item "drizzle.config.ts"
}

npx drizzle-kit push --config=drizzle.config.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Schema push failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "  Schema pushed successfully" -ForegroundColor Green

# 5. Seed data
Write-Host "`n[5/5] Seeding database..." -ForegroundColor Yellow
npx tsx src/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Seed failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "`nTest credentials:"
Write-Host "  Email:    owner@trayloop.dev"
Write-Host "  Password: password123"
Write-Host "`nStart the API:"
Write-Host "  cd apps/api && npx tsx src/server.ts"
Write-Host "`nTest storefront:"
Write-Host "  http://localhost:3001/api/storefront/trayloop-catering"
Write-Host ""
