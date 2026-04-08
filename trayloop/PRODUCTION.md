# TrayLoop Production

This document describes the current live production setup.

For the operator runbook, see:

- [Launch flow](C:\Users\simon\SimonShaun2\trayloop\docs\runbooks\launch-flow.md)

## Current Architecture

```text
Vercel
  - trayloophq.com
  - order.trayloophq.com
  - dashboard.trayloophq.com
  - master.trayloophq.com
  - api.trayloophq.com (proxy)

Railway
  - simonshaun2-production.up.railway.app (Fastify API)
  - Railway Postgres

Stripe
  - Billing for TrayLoop subscription
  - Connect for merchant payouts
  - Checkout for customer payments

Resend
  - transactional email
```

## Production Domains

- Marketing: `https://trayloophq.com`
- Storefront: `https://order.trayloophq.com`
- Merchant: `https://dashboard.trayloophq.com`
- Admin: `https://master.trayloophq.com`
- Public API: `https://api.trayloophq.com`
- Railway API origin: `https://simonshaun2-production.up.railway.app`

## Required Production Environment

### Railway API

```env
NODE_ENV=production
DATABASE_URL=...
JWT_SECRET=...
MERCHANT_URL=https://dashboard.trayloophq.com
ADMIN_URL=https://master.trayloophq.com
STOREFRONT_URL=https://order.trayloophq.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
EMAIL_PROVIDER=resend
EMAIL_FROM=TrayLoop <orders@mail.trayloophq.com>
RESEND_API_KEY=...
OPENAI_API_KEY=...
OPENAI_MODEL=...
AUTOMATIONS_ENABLED=false
```

### Merchant Vercel

```env
NEXT_PUBLIC_API_URL=https://api.trayloophq.com
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_AUTOMATIONS_ENABLED=false
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
```

### Admin Vercel

```env
NEXT_PUBLIC_API_URL=https://api.trayloophq.com
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_AUTOMATIONS_ENABLED=false
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
```

### Storefront Vercel

```env
NEXT_PUBLIC_API_URL=https://api.trayloophq.com
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_GA_ID=G-...
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
```

### Marketing Vercel

```env
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_GA_ID=G-...
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
```

## Production Deployment Order

When payment, auth, or shared API behavior changes:

1. Deploy Railway API
2. Verify `https://api.trayloophq.com/health`
3. Deploy merchant
4. Deploy storefront
5. Deploy admin
6. Run the live checklist in [LAUNCH_CHECKLIST.md](C:\Users\simon\SimonShaun2\trayloop\LAUNCH_CHECKLIST.md)

## Stripe Notes

- The platform must have live Connect enabled.
- Merchant payouts onboarding depends on Stripe Connect, not just Stripe Billing.
- The current connected-account creation flow uses controller properties aligned to the newer Connect responsibility model.
- Webhook verification depends on the signing secret for the Railway endpoint, not the proxy domain.

## Staging Policy

Keep risky or incomplete work in staging first:

- staging dashboard
- staging storefront
- staging admin
- staging API

Production should stay conservative:

- automation off by default
- migrations applied intentionally
- one real merchant validated before broader rollout
