# TrayLoop Local Setup Script (Windows PowerShell)
# Run from the trayloop/ root directory

$ErrorActionPreference = "Stop"

Write-Host "`n=== TrayLoop Local Setup ===" -ForegroundColor Cyan

# 1. Start Docker containers
Write-Host "`n[1/6] Starting Docker containers..." -ForegroundColor Yellow
Push-Location infrastructure/docker
docker compose up -d
Pop-Location

# 2. Wait for Postgres to be ready
Write-Host "`n[2/6] Waiting for PostgreSQL..." -ForegroundColor Yellow
$attempts = 0
$maxAttempts = 15
while ($attempts -lt $maxAttempts) {
    docker exec docker-postgres-1 pg_isready -U postgres 2>$null | Out-Null
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

# 3. Install root dependencies
Write-Host "`n[3/6] Installing root dependencies..." -ForegroundColor Yellow
npm install

# 4. Force correct drizzle versions in database package
Write-Host "`n[4/6] Installing database dependencies..." -ForegroundColor Yellow
Push-Location packages/database

# Remove stale config
if (Test-Path "drizzle.config.ts") {
    Write-Host "  Removing stale drizzle.config.ts" -ForegroundColor Yellow
    Remove-Item "drizzle.config.ts"
}

# Force exact versions regardless of lockfile
npm install drizzle-orm@0.44.2 postgres@3.4.5 --save-exact
npm install drizzle-kit@0.31.1 tsx@4.19.4 --save-dev --save-exact

# 5. Push database schema
Write-Host "`n[5/6] Pushing database schema..." -ForegroundColor Yellow
npx drizzle-kit push --config=drizzle.config.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Schema push failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "  Schema pushed successfully" -ForegroundColor Green

# 6. Seed data
Write-Host "`n[6/6] Seeding database..." -ForegroundColor Yellow
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
Write-Host "  cd apps\api"
Write-Host "  npx tsx src/server.ts"
Write-Host "`nTest storefront:"
Write-Host "  http://localhost:3001/api/storefront/trayloop-catering"
Write-Host ""
