# Stripe Sandbox Branding And Domain Setup

This project uses the TrayLoop Stripe sandbox account as the platform Stripe context.

There are two Stripe layers in TrayLoop:

- Platform Stripe account
  - collects the TrayLoop Pro subscription
  - creates hosted subscription Checkout Sessions
  - creates Billing Portal sessions
  - owns the platform webhook endpoint
- Connect merchant accounts
  - are created per merchant through TrayLoop onboarding
  - receive customer deposit payouts for that merchant

## Sandbox scope

Use the TrayLoop sandbox account for:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- hosted subscription checkout verification
- Billing Portal verification
- Connect onboarding verification

Do not mix live and sandbox ids in the same Railway environment.

## Required product setup

Create the subscription product in the TrayLoop sandbox account:

- Product name: `TrayLoop Pro`
- Price: `$99 / month`
- Recurring interval: `month`

Set the resulting price id in Railway:

- `STRIPE_PRICE_ID=price_...`

Use the price id, not the product id.

## Branding checklist

Configure these directly in the Stripe dashboard for the TrayLoop sandbox account:

1. Business name: `TrayLoop`
2. Accent color aligned with TrayLoop brand
3. Logo uploaded in Stripe branding settings
4. Icon uploaded for hosted surfaces
5. Support email set to a TrayLoop-controlled address
6. Statement descriptor reviewed for billing clarity

These settings flow through to:

- hosted subscription Checkout
- Billing Portal
- portions of Connect onboarding

## Domain and return-url checklist

TrayLoop should remain the control center and Stripe should only appear for secure hosted payment steps.

Use TrayLoop-owned return destinations:

- Merchant onboarding return: `/onboarding`
- Billing return: `/billing`
- Merchant settings return: `/settings`
- Customer deposit return: storefront order page with `checkout` query params

Current production app surfaces:

- Merchant dashboard: `https://dashboard.trayloophq.com`
- Storefront: `https://order.trayloophq.com`
- Admin: `https://master.trayloophq.com`

Recommended follow-up:

- enable Stripe custom domain support for hosted payment surfaces if the current Stripe plan supports it
- keep Checkout and Billing Portal on a TrayLoop-branded subdomain when available

## Connect onboarding guidance

TrayLoop should introduce the merchant to payouts before redirecting to Stripe:

- explain why payouts are required
- explain that customer deposits route to the merchant account
- explain that Stripe is the regulated payment layer under the curtain
- return merchants to TrayLoop immediately after onboarding

Use Stripe-hosted onboarding or embedded onboarding, but keep TrayLoop responsible for:

- readiness state
- required next actions
- launch gating
- business profile context

## Webhook events in scope

TrayLoop currently depends on Stripe webhooks for:

- `checkout.session.completed`
- `checkout.session.expired`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Verify the sandbox webhook endpoint is subscribed to all of the above before testing end-to-end flows.

## End-to-end sandbox test checklist

1. Merchant signs up in TrayLoop
2. Merchant creates workspace
3. Merchant lands on TrayLoop onboarding
4. Merchant completes Connect onboarding
5. Merchant starts TrayLoop Pro subscription via hosted Checkout
6. Subscription webhooks sync back into Railway Postgres
7. Merchant opens Billing Portal from TrayLoop
8. Customer places storefront order
9. Deposit checkout opens using the platform sandbox account
10. Deposit webhook updates the order and deposit state

If all ten pass, the Stripe sandbox phase is wired correctly.
