# Changelog

All notable changes to this build follow [Keep a Changelog](https://keepachangelog.com/).

## [2.0.0] — 2026-04-18

Initial production build matching the v3 orchestrated build prompt.

### Added

- `amida-brand.php` must-use plugin with canonical legal + address constants
  (30 N Gould Street, Sheridan, WY 82801).
- Custom `amida` theme (Storefront child):
  - Design system (CSS vars for sage/cream/amber, Cormorant + DM Sans).
  - Public landing template with **zero** product names.
  - Split login/register template with penalty-of-perjury re-attestation
    checkbox.
  - Catalog, PDP, account, legal page templates.
  - WooCommerce single-product override with image-mask slot, tiered pack
    selector, COA card, RUO notice.
  - Cart drawer partial, mobile bottom tab bar, offline fallback page.
  - Service worker (`/sw.js`), PWA manifest (`/manifest.json`).
- `amida-compliance` plugin:
  - Compliance log + Batch log tables (`dbDelta`-managed).
  - 21+ age gate modal with penalty-of-perjury disclaimers.
  - Login wall + registration handler with 3-checkbox compliance
    attestation.
  - Checkout re-attestation (`Amida_Checkout_Attestation`).
  - NY enhanced flow (`Amida_NY_Enhanced`) — no cookie caching.
  - Rate limiter for `/login` + `/register`.
  - Image-masking pipeline with authenticated PHP proxy
    (`/compound-img/{hash}.png`), `Cache-Control: private, no-store`.
  - Admin dashboard with Compliance Log, Batch Log, CSV exporter, NY queue,
    Settings.
  - 15 canonical event types.
- Legal pages (7): RUO, Terms, Privacy, Shipping, Refund, Disclaimer,
  Age Verification — all referencing the real Sheridan, WY address.
- Seed scripts:
  - `scripts/products.csv` — 45 SKUs (25 safe-name + 10 GLP family + 6
    blends + 4 accessories).
  - `scripts/seed-catalog.php` — WP-CLI upsert seeder.
  - `scripts/seed-pages.php` — WP-CLI page seeder.
- Transactional email template for order confirmation with brand + legal
  footer.
- `robots.txt` — locks down `/catalog`, `/product`, `/category`, `/cart`,
  `/checkout`, `/account`, `/compound-img`, and `/wp-content/uploads/compound-names/`.
- Docs: README, DEPLOYMENT, SECURITY, PRE_LAUNCH_CHECKLIST.
- `build-state/` JSON contracts for multi-agent coordination.

### Compliance

- Age minimum raised to 21 globally (`AMIDA_MIN_AGE`).
- Penalty-of-perjury attestation wording is canonical; do not edit without
  legal sign-off.
- IPs in the compliance log are SHA-256 hashed with a per-install salt.
- Compliance tables are retained on plugin uninstall.

### Known follow-ups

- Phone `(307) XXX-XXXX` is a placeholder — update `AMIDA_SUPPORT_PHONE`.
- Telegram URL is empty — set `AMIDA_TELEGRAM_URL` after channel is created.
- Icon assets (`/assets/images/icon-*.png`) are placeholders.
- Self-host Google Fonts before post-launch GDPR audit.
