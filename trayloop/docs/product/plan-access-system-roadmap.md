# Plan Access System

TrayLoop's plan access initiative makes Starter, Pro, and Growth real across billing, backend authorization, frontend visibility, and future add-ons.

## PAS-1: Foundation
- Add typed plans: `starter`, `pro`, `growth`
- Add shared feature-key catalog
- Add base feature maps per plan
- Add plan fields to organization/subscription schema
- Add entitlement resolver foundation that can compute included and add-on features

## PAS-2: Backend Enforcement
- Add centralized backend feature checks
- Return machine-readable authorization errors
- Protect recurring scheduling endpoints
- Protect upsell endpoints
- Protect campaign and analytics endpoints

## PAS-3: Frontend Gating
- Add frontend feature-access hook
- Add locked-feature states and upgrade prompts
- Gate merchant modules based on entitlements

## PAS-4: Billing And Plan UX
- Add `Billing & Plan` experience
- Show current plan, included features, and locked features
- Add plan-aware upgrade CTAs

## PAS-5: Add-on Scalability
- Support base plans plus add-ons
- Support promo unlocks and trials
- Migrate Growth Advisor to the shared entitlement model

## PAS-6: Verification
- Add entitlement-focused tests
- Verify backend blocking behavior
- Verify locked frontend states
- Verify upgrade targets and plan mapping
