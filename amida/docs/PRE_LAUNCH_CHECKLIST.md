# Pre-Launch Checklist

Every box must be checked before switching DNS.

## Technical

- [ ] Homepage contains zero product names
      `grep -riE 'BPC|TB-500|GLP|Retatrutide|Semaglutide|Tirzepatide|Cagrilintide|Survodutide' amida/wp-content/themes/amida/page-templates/landing.php` returns **no results**.
- [ ] Age gate renders for every unauthenticated request
- [ ] `/catalog`, `/product/*`, `/cart`, `/checkout`, `/account/*` redirect to `/login` when anonymous
- [ ] GLP products show only image-masked compound names in view-source
- [ ] All image filenames are hashed (no `retatrutide.png` or similar)
- [ ] All uploaded images have EXIF stripped (`exiftool` confirms)
- [ ] Tiered pack pricing (Single / 3 / 5 / 10) visible on every peptide
- [ ] Cart drawer opens from right with free-shipping progress bar + 4 upsell toggles
- [ ] 4-step checkout completes end-to-end with a test card
- [ ] 3 upsells + 2 downsells display in the correct sequence (CartFlows)
- [ ] Compliance log fires on all 15 event types (verify via Admin → Amida → Dashboard)
- [ ] PWA manifest validates (Chrome DevTools → Application)
- [ ] Service worker caches per strategy (static vs network-first)
- [ ] iOS "Add to Home Screen" launches standalone
- [ ] Lighthouse — Performance 90+, Accessibility 95+, Best Practices 95+,
      SEO 95+, PWA 100

## Brand / Legal

- [ ] Footer on every page contains **30 N Gould Street, Sheridan, WY 82801**
- [ ] All 8 transactional email templates contain the same address
- [ ] All 7 legal pages link from the footer
- [ ] No "18+" language anywhere — grep the legal files:
      `grep -r '18' amida/legal/` should not match age-related sentences.
- [ ] "Chemical supplier / not 503A/503B" language is on every page footer
- [ ] No prohibited copy (grep):
      `grep -riE 'heals|cures|treats|prevents|fat loss|muscle growth|anti-aging|rejuvenate|dosing|dosage|before/after' amida/` returns **no results**.

## Security

- [ ] SSL enforced site-wide
- [ ] `/wp-admin` relocated
- [ ] Admin accounts have 2FA
- [ ] Wordfence active
- [ ] Rate limiter engaged on `/login` and `/register`
- [ ] Compliance log IPs are SHA-256 hashed (no raw IPs in DB)
- [ ] Off-site backup running to S3 / Backblaze

## Processor / Banking

- [ ] Bankful application submitted
- [ ] Mercury business account active (EIN required)
- [ ] Billing descriptor configured: `AMIDA RESEARCH`
- [ ] Shipping carriers confirmed (USPS + FedEx)
- [ ] Telegram channel link set in `AMIDA_TELEGRAM_URL`

## Content

- [ ] Every product has a batch number set (`_amida_batch`)
- [ ] Every product has a COA URL set (`_amida_coa_url`)
- [ ] GLP products have `_amida_real_compound` populated so the image-mask
      pipeline generated a PNG
- [ ] 4 accessory SKUs exist (`BACWATER-30`, `SYRINGES-100`, `SWABS-200`, `VIALS-5`)

## Post-launch (day 1)

- [ ] 5 manual orders placed (team) across pack tiers
- [ ] Compliance CSV export downloaded; spot-check events
- [ ] Telegram channel announcement sent
