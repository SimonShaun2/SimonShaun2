# TrayLoop Launch Flow

This runbook is the source of truth for taking TrayLoop live with real merchants.

## Live Stack

- Marketing: Vercel
- Storefront: Vercel at `order.trayloophq.com`
- Merchant dashboard: Vercel at `dashboard.trayloophq.com`
- Admin dashboard: Vercel at `master.trayloophq.com`
- Public API: Vercel proxy at `api.trayloophq.com`
- Core API + Postgres: Railway
- Payments: Stripe Billing + Stripe Connect + Stripe Checkout
- Email: Resend
- Analytics: GA4, PostHog, Vercel Analytics/Speed Insights

## Stabilization Rules

- Keep production automation off until it is explicitly ready.
- Put risky or incomplete work in staging first.
- Do not onboard real merchants until both of these are true:
  - platform subscription is active
  - merchant payouts onboarding in Stripe Connect is complete
- Treat Stripe and the database as the source of truth for money movement.

## Production Flags

### Railway API

```env
AUTOMATIONS_ENABLED=false
MERCHANT_URL=https://dashboard.trayloophq.com
ADMIN_URL=https://master.trayloophq.com
STOREFRONT_URL=https://order.trayloophq.com
```

### Vercel Web Apps

```env
NEXT_PUBLIC_API_URL=https://api.trayloophq.com
NEXT_PUBLIC_APP_ENV=production
```

Merchant and admin should also keep:

```env
NEXT_PUBLIC_AUTOMATIONS_ENABLED=false
```

## Merchant Launch Sequence

Every merchant should follow this order:

1. Create merchant account.
2. Complete TrayLoop subscription checkout.
3. Open Launch Setup.
4. Click `Start Merchant Payments`.
5. Complete Stripe Connect onboarding.
6. Create at least one active package.
7. Create at least one active location with service settings.
8. Open the live storefront and validate the menu renders.
9. Place one controlled real order.
10. Confirm order, payment, and payout readiness in merchant/admin views.

## What Must Be True Before A Merchant Accepts Real Orders

- Billing status is `active`
- Connect status is `ready`
- `stripe_account_id` exists on the organization
- `stripe_charges_enabled = true`
- `stripe_payouts_enabled = true`
- `stripe_onboarding_complete = true`
- At least one active package exists
- At least one active location exists
- Storefront URL resolves and loads

## First Live Order Validation

Use a real merchant with a real live Stripe Connect account.

### Expected customer experience

1. Customer opens merchant storefront.
2. Customer selects package and any add-ons.
3. Customer submits order.
4. Customer is redirected to Stripe Checkout.
5. Customer pays `subtotal + 5%`.

### Expected TrayLoop math

- Merchant subtotal = `100%`
- Platform fee = `5%`
- Customer charge = `105%`

### Expected outcomes

- Order record created
- Payment record created
- Stripe Checkout session created
- Webhook confirms payment
- Order transitions to `confirmed`
- Merchant receives full subtotal
- TrayLoop keeps the platform fee

## If Merchant Payouts Fails

Check this order:

1. Is Stripe Connect enabled on the live TrayLoop platform account?
2. Did the merchant complete Connect onboarding?
3. Does the organization have a valid live `stripe_account_id`?
4. Does Railway production use the current API deploy?

Common causes:

- Connect not enabled on the platform account
- stale or invalid merchant `stripe_account_id`
- merchant completed billing but not payouts onboarding
- Stripe mode mismatch between account data and live keys

## If Checkout Skips Payment

This almost always means one of these:

- merchant has no valid live connected Stripe account
- full-order checkout creation failed and the API fell back
- the wrong merchant/org is attached to the storefront

Check:

- Railway API logs for `/api/storefront/:slug/order`
- the organization row in Postgres
- Stripe Connect onboarding completion

## Webhook Health

Stripe should point to:

- `https://simonshaun2-production.up.railway.app/api/webhooks/stripe`

Verify:

- live signing secret in Stripe matches `STRIPE_WEBHOOK_SECRET` in Railway
- recent deliveries return `200`
- `customer.subscription.updated`
- `checkout.session.completed`
- `checkout.session.expired`

## Immediate Post-Launch Monitoring

During the first 24 hours, watch:

- Railway API logs for `500` and Stripe errors
- Stripe webhook deliveries
- Stripe Checkout completion
- merchant login/session issues
- storefront order creation rate
- payment failures
- payout onboarding failures

## Operational Cleanup After Launch

- rotate any exposed Stripe, Postgres, or email credentials
- keep staging for automation and risky features
- do not migrate major payment architecture during initial merchant onboarding
