# TrayLoop Launch Checklist

This checklist is for final production validation, not general QA.

For the full operator flow, see:

- [Launch flow](C:\Users\simon\SimonShaun2\trayloop\docs\runbooks\launch-flow.md)

## Platform Readiness

- [ ] `https://api.trayloophq.com/health` returns `200`
- [ ] Railway API is on the expected production commit
- [ ] Merchant app loads at `https://dashboard.trayloophq.com`
- [ ] Storefront loads at `https://order.trayloophq.com`
- [ ] Admin app loads at `https://master.trayloophq.com`
- [ ] `AUTOMATIONS_ENABLED=false` in production

## Billing And Payouts

- [ ] TrayLoop subscription checkout succeeds for a merchant
- [ ] Merchant billing status shows `active`
- [ ] `Start Merchant Payments` opens Stripe onboarding
- [ ] Merchant completes Stripe Connect onboarding
- [ ] Merchant payout status becomes `ready`
- [ ] Organization has a valid live `stripe_account_id`

## Merchant Setup

- [ ] At least one active package exists
- [ ] At least one active location exists
- [ ] Storefront URL is generated correctly
- [ ] Storefront menu renders packages and add-ons

## First Live Order

- [ ] Place one real controlled order on a merchant with live Connect onboarding completed
- [ ] Customer is redirected to Stripe Checkout
- [ ] Customer is charged `subtotal + 5%`
- [ ] Checkout completes successfully
- [ ] Order appears in merchant dashboard
- [ ] Payment appears in Stripe
- [ ] Order reaches `confirmed`
- [ ] Merchant receives the intended subtotal
- [ ] TrayLoop keeps the platform fee

## Auth And Sessions

- [ ] Merchant login works
- [ ] Admin login works
- [ ] Customer account login works
- [ ] Protected API calls succeed with cookie auth
- [ ] Logout clears session

## Webhooks

- [ ] Live Stripe endpoint points to `https://simonshaun2-production.up.railway.app/api/webhooks/stripe`
- [ ] `STRIPE_WEBHOOK_SECRET` matches the live endpoint signing secret
- [ ] Recent Stripe webhook deliveries return `200`
- [ ] `customer.subscription.updated` syncs billing correctly
- [ ] `checkout.session.completed` confirms order payments correctly

## Monitoring

- [ ] Railway logs are clean of repeated `500` errors during launch
- [ ] Stripe dashboard shows successful recent requests
- [ ] Resend shows successful email delivery
- [ ] PostHog / GA4 events are arriving

## After First Merchant Launch

- [ ] Rotate any exposed credentials
- [ ] Document merchant onboarding support steps
- [ ] Keep automation/testing work in staging
