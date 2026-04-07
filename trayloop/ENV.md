# TrayLoop Environment Variables

## API (apps/api)

### Required
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |

### Stripe (required for payments)
| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_... or sk_live_...) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### Email (optional)
| Variable | Description |
|----------|-------------|
| `EMAIL_PROVIDER` | `resend` or `smtp` |
| `EMAIL_FROM` | Sender address |
| `RESEND_API_KEY` | Resend API key (if provider=resend) |
| `SMTP_HOST` | SMTP host (if provider=smtp) |
| `SMTP_PORT` | SMTP port (default 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |

### URLs
| Variable | Description |
|----------|-------------|
| `MERCHANT_URL` | Merchant dashboard URL for redirects |
| `PORT` | Server port (default 3001) |
| `NODE_ENV` | `development`, `staging`, or `production` |
| `AUTOMATIONS_ENABLED` | Enable approval-first automation routes (`true` in staging, `false` in live) |

## Storefront (apps/web-storefront)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key with Places enabled for delivery address autocomplete |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID for storefront ecommerce tracking |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key for product analytics and replay |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (for example `https://us.i.posthog.com`) |
| `NEXT_PUBLIC_APP_ENV` | `development`, `staging`, or `production` for environment labeling |

## Merchant (apps/web-merchant)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL |
| `NEXT_PUBLIC_APP_ENV` | `development`, `staging`, or `production` for environment labeling |
| `NEXT_PUBLIC_AUTOMATIONS_ENABLED` | Show automation surfaces (`true` in staging, `false` in live) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key for merchant product analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (for example `https://us.i.posthog.com`) |

## Admin (apps/web-admin)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL |
| `NEXT_PUBLIC_APP_ENV` | `development`, `staging`, or `production` for environment labeling |
| `NEXT_PUBLIC_AUTOMATIONS_ENABLED` | Show automation intelligence (`true` in staging, `false` in live) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key for admin product analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (for example `https://us.i.posthog.com`) |

## Marketing (apps/web-marketing)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID for marketing traffic and conversion tracking |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key for marketing funnel analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (for example `https://us.i.posthog.com`) |
| `NEXT_PUBLIC_APP_ENV` | `development`, `staging`, or `production` for environment labeling |

## Analytics stack

- `@vercel/analytics` and `@vercel/speed-insights` are enabled in every web app and do not need extra env vars.
- `NEXT_PUBLIC_GA_ID` should be set separately per Vercel project if you want different GA4 streams for marketing vs storefront.
- `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` can point to the same PostHog project or separate projects depending on how you want to split marketing vs product reporting.

## Suggested live vs staging split

### Production
- `AUTOMATIONS_ENABLED=false`
- `NEXT_PUBLIC_AUTOMATIONS_ENABLED=false`
- `NEXT_PUBLIC_APP_ENV=production`

### Staging
- `AUTOMATIONS_ENABLED=true`
- `NEXT_PUBLIC_AUTOMATIONS_ENABLED=true`
- `NEXT_PUBLIC_APP_ENV=staging`
