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

## Storefront (apps/web-storefront)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL |

## Merchant (apps/web-merchant)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL |
