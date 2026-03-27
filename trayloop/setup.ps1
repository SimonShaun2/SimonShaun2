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

# 3. Install dependencies
Write-Host "`n[3/5] Installing dependencies..." -ForegroundColor Yellow
npm install
Push-Location packages/database
npm install drizzle-orm@0.44.2 postgres@3.4.5 --save-exact 2>$null
npm install drizzle-kit@0.31.1 tsx@4.19.4 --save-dev --save-exact 2>$null
Pop-Location

# 4. Create database tables via SQL (bypasses drizzle-kit interactive prompts)
Write-Host "`n[4/5] Creating database tables..." -ForegroundColor Yellow
$sqlPath = "packages/database/init.sql"
if (-not (Test-Path $sqlPath)) {
    Write-Host "  ERROR: init.sql not found at $sqlPath" -ForegroundColor Red
    exit 1
}
# Copy SQL file into container and execute
docker cp $sqlPath docker-postgres-1:/tmp/init.sql
docker exec docker-postgres-1 psql -U postgres -d trayloop -f /tmp/init.sql
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Schema creation failed" -ForegroundColor Red
    exit 1
}
Write-Host "  Tables created successfully" -ForegroundColor Green

# Verify tables exist
$tableCount = docker exec docker-postgres-1 psql -U postgres -d trayloop -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
Write-Host "  Verified: $($tableCount.Trim()) tables in database" -ForegroundColor Green

# 5. Seed data
Write-Host "`n[5/5] Seeding database..." -ForegroundColor Yellow
Push-Location packages/database
# Remove stale config if exists
if (Test-Path "drizzle.config.ts") { Remove-Item "drizzle.config.ts" }
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
