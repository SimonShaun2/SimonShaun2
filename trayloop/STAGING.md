# TrayLoop Staging Deployment Guide

## Architecture

| Service | Deploy Target | URL Pattern |
|---------|--------------|-------------|
| API | Vercel (Serverless) | `trayloop-api.vercel.app` |
| Storefront | Vercel (Next.js) | `trayloop-storefront.vercel.app` |
| Merchant | Vercel (Next.js) | `trayloop-merchant.vercel.app` |
| Database | Supabase (PostgreSQL) | `ozrfskbhowdjxbikauja.supabase.co` |

## Database (Supabase)

- **Project:** trayloop-staging
- **Region:** us-east-1
- **Dashboard:** https://supabase.com/dashboard/project/ozrfskbhowdjxbikauja
- **Connection string:** Get from Supabase Dashboard → Settings → Database → Connection string (URI)
- **Schema:** Already pushed (22 tables)

### Seed staging data

From your local machine with DATABASE_URL pointing to Supabase:

```powershell
$env:DATABASE_URL = "postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
cd trayloop\packages\database
npx tsx src/seed.ts
```

## Vercel Deployment

### Option A: Deploy from Vercel Dashboard

1. Go to https://vercel.com/simonshaun2-8939s-projects
2. Import the `SimonShaun2/SimonShaun2` repo (or connect existing projects)
3. For each app, set:

**API Project Settings:**
- Root Directory: `trayloop/apps/api`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `cd ../.. && npm install`
- Environment Variables: (see below)

**Storefront Project Settings:**
- Root Directory: `trayloop/apps/web-storefront`
- Framework: Next.js
- Install Command: `cd ../.. && npm install`
- Environment Variables:
  - `NEXT_PUBLIC_API_URL` = `https://your-api-project.vercel.app`

**Merchant Project Settings:**
- Root Directory: `trayloop/apps/web-merchant`
- Framework: Next.js
- Install Command: `cd ../.. && npm install`
- Environment Variables:
  - `NEXT_PUBLIC_API_URL` = `https://your-api-project.vercel.app`

### Option B: Deploy from CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy API
cd trayloop/apps/api
vercel --prod

# Deploy Storefront
cd ../web-storefront
vercel --prod

# Deploy Merchant
cd ../web-merchant
vercel --prod
```

## Environment Variables (set in Vercel Dashboard)

### API

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pw]@aws-0-us-east-1.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | Random 64-char string |
| `STRIPE_SECRET_KEY` | `sk_test_...` from Stripe dashboard |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from Stripe webhook setup) |
| `NODE_ENV` | `staging` |
| `EMAIL_PROVIDER` | `resend` (optional) |
| `EMAIL_FROM` | `TrayLoop <noreply@yourdomain.com>` (optional) |
| `RESEND_API_KEY` | `re_...` (optional) |

### Storefront

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.vercel.app` |

### Merchant

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.vercel.app` |

## Stripe Webhook for Staging

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://your-api.vercel.app/api/webhooks/stripe`
4. Events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` env var

## API on Vercel — Important Note

The API is a Fastify app, not a Next.js app. To run on Vercel serverless:

**Option 1: Use `tsx` runtime (simpler)**
Set the API's build command to `npx tsc` and start command to `node dist/server.js`.
This works for Vercel's Node.js runtime.

**Option 2: Use Railway/Render instead (recommended for API)**
Vercel serverless has cold starts and no persistent connections.
For the API specifically, consider:
- **Railway** (free tier, persistent Node.js)
- **Render** (free tier, persistent Node.js)
- **Fly.io** (free tier, persistent Node.js)

Deploy command for Railway/Render:
```bash
cd trayloop && npm install && cd apps/api && npx tsc && node dist/server.js
```

## Staging URLs (after deployment)

| Surface | URL |
|---------|-----|
| Storefront | `https://trayloop-storefront.vercel.app/trayloop-catering` |
| Merchant | `https://trayloop-merchant.vercel.app/login` |
| API Health | `https://your-api-host/health` |
| Stripe Webhook | `https://your-api-host/api/webhooks/stripe` |

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| owner@trayloop.dev | Printed during seed (or `TRAYLOOP_SEED_PASSWORD`) | Merchant (owner) |
| staff@trayloop.dev | Printed during seed (or `TRAYLOOP_SEED_PASSWORD`) | Merchant (manager) |
| customer@trayloop.dev | Printed during seed (or `TRAYLOOP_SEED_PASSWORD`) | Customer |

(Run seed against Supabase first)

## Updating Staging

1. Push to `claude/setup-monorepo-structure-t7rJc` branch
2. Vercel auto-deploys from connected branch
3. Database migrations: run init.sql against Supabase via dashboard SQL editor
