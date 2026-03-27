# Local Development Setup (Windows)

## Prerequisites
- Node.js 20+ ([nodejs.org](https://nodejs.org))
- Docker Desktop ([docker.com](https://www.docker.com/products/docker-desktop/))

## One-Command Setup

Open PowerShell in the `trayloop` folder and run:

```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

This will:
1. Start PostgreSQL + Redis via Docker
2. Wait for Postgres to be healthy
3. Install npm dependencies
4. Push the database schema
5. Seed sample data

## Manual Setup (if the script fails)

### Step 1: Start Docker

```powershell
cd infrastructure\docker
docker compose up -d
cd ..\..
```

Wait 10 seconds for Postgres to start. Verify:

```powershell
docker ps
```

You should see `docker-postgres-1` and `docker-redis-1` running.

### Step 2: Install dependencies

```powershell
npm install
```

### Step 3: Delete stale config (important)

```powershell
if (Test-Path packages\database\drizzle.config.ts) { Remove-Item packages\database\drizzle.config.ts }
```

### Step 4: Push schema

```powershell
cd packages\database
npx drizzle-kit push --config=drizzle.config.js
cd ..\..
```

Expected output: table creation statements, ending with no errors.

### Step 5: Seed data

```powershell
cd packages\database
npx tsx src/seed.ts
cd ..\..
```

Expected output:
```
Seeding database...
  Using password "password123" for all seed users
Creating users...
  Created Alex Rivera, Jordan Lee, Sam Chen
...
Seed complete!
```

## Start the API

```powershell
cd apps\api
npx tsx src/server.ts
```

## Test

- Health check: http://localhost:3001/health
- Storefront: http://localhost:3001/api/storefront/trayloop-catering

## Login Credentials

| Email | Password | Role |
|-------|----------|------|
| owner@trayloop.dev | password123 | Merchant (owner) |
| staff@trayloop.dev | password123 | Merchant (manager) |
| customer@trayloop.dev | password123 | Customer |

## Ports

| Service | Port |
|---------|------|
| API | 3001 |
| Marketing site | 3000 |
| Storefront | 3002 |
| Merchant dashboard | 3003 |
| Admin panel | 3004 |
| PostgreSQL | 5432 |
| Redis | 6379 |

## Troubleshooting

**"password authentication failed for user simon"**
Your local `packages/database/src/client.ts` has old code. Pull latest and verify it contains:
```ts
const client = postgres('postgresql://postgres:postgres@localhost:5432/trayloop');
```

**"url or host required"**
Delete the stale TypeScript config:
```powershell
Remove-Item packages\database\drizzle.config.ts
```

**"ECONNREFUSED :5432"**
Docker is not running. Open Docker Desktop first, then re-run.
