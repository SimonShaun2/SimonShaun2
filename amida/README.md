# Amida — WooCommerce + PWA

Production build of **amida.com** — a login-gated, compliance-hardened
research-compound storefront for AM Holdings, LLC (DBA Amida).

> **Legal entity:** AM Holdings, LLC (Wyoming Single-Member LLC)
> **Address:** 30 N Gould Street, Sheridan, WY 82801
> **Hosting:** Pressable · **Stack:** WordPress + WooCommerce + PWA

## Layout

```
/amida/
├── wp-content/
│   ├── mu-plugins/
│   │   └── amida-brand.php               # Brand & legal constants
│   ├── plugins/
│   │   └── amida-compliance/             # Age gate + audit log + image masker
│   └── themes/
│       └── amida/                        # Custom editorial theme
├── pwa/                                  # Manifest + service worker fallbacks
├── scripts/
│   ├── products.csv                      # Seed catalog (45 SKUs)
│   ├── seed-catalog.php                  # wp-cli catalog seeder
│   └── seed-pages.php                    # wp-cli pages seeder
├── legal/                                # 7 legal policy markdown sources
├── build-state/                          # Multi-agent contract artifacts
├── docs/                                 # DEPLOYMENT, SECURITY, CHANGELOG
└── robots.txt                            # Root robots config
```

## Compliance architecture (six layers)

1. **Entry** — 21+ penalty-of-perjury age gate modal (v3)
2. **Login wall** — no catalog browsing without an authenticated researcher
3. **Product guards** — image-masked GLP compound names, RUO notices
4. **Checkout** — re-attestation, compliance-logged order
5. **Footer policies** — 7 linked legal pages on every rendered page
6. **Audit** — 15 event types logged, NY enhanced flow, CSV exporter

## Key features

- **Penalty-of-perjury age gate** — re-prompts NY visitors every session
- **Image-masking pipeline** for GLP compound names (Retatrutide, Tirzepatide,
  Semaglutide, Cagrilintide, Survodutide) — served through an authenticated
  PHP proxy with `Cache-Control: private, no-store`
- **Tiered pack pricing** — Single / 3-Pack / 5-Pack / 10-Pack, discounts
  roughly 0 / 15 / 20 / 28 %
- **Cart drawer** with free-shipping progress bar (`$250` threshold) and 4
  accessory upsells
- **Admin dashboard** — Compliance Log, Batch Log, CSV Exports (processor
  audits), NY Enhanced queue
- **Hashed IP logging** — SHA-256 with a per-install salt; raw IPs never
  persisted
- **PWA** — install banner after 2nd visit or first cart-add, service worker
  with strategy per route, offline fallback page

## Quickstart (local)

```bash
# 1. Copy files into a fresh WordPress install
cp -R amida/wp-content/* /path/to/wp-content/

# 2. Activate (CLI)
wp plugin activate amida-compliance woocommerce
wp theme activate amida

# 3. Seed catalog + pages
wp eval-file /path/to/amida/scripts/seed-pages.php
wp eval-file /path/to/amida/scripts/seed-catalog.php

# 4. Flush rewrites (new PWA + compound-img endpoints)
wp rewrite flush
```

## Non-negotiable guardrails

| Rule                                      | Enforced by                        |
|-------------------------------------------|------------------------------------|
| Homepage contains zero product names      | `page-templates/landing.php`       |
| GLP compound real names never crawlable   | `Amida_Image_Masker` + robots.txt  |
| 21+ attestation on every anonymous visit  | `Amida_Age_Gate`                   |
| 7 legal pages on every footer             | `theme/footer.php`                 |
| No therapeutic/claim language anywhere    | pre-launch `grep` (see docs)       |
| Processor descriptor ≤ 22 chars           | `AMIDA_BILLING_DESCRIPTOR`         |
| Compliance log retained ≥ 5 years         | `uninstall.php` (no-drop policy)   |

See `docs/PRE_LAUNCH_CHECKLIST.md` for the full grep list and validator
script.

## License

Proprietary — © 2026 AM Holdings, LLC. All rights reserved.
