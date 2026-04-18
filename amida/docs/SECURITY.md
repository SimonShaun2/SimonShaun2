# Amida — Security Policy

## Reporting a vulnerability

Report suspected vulnerabilities to **security@amida.com** (preferred) or
legal@amida.com. Please include:

- A minimal reproduction
- The impact you observed
- Your recommended remediation (optional)

We commit to an initial response within 3 business days. Do not publicly
disclose until we have confirmed a fix is deployed.

## Hardening in this build

- **Transport:** TLS 1.3 enforced site-wide (Really Simple SSL + HSTS via WAF)
- **Auth:** 2FA required for `administrator` and `shop_manager`
- **Rate limiting:** 5 attempts / 15 min on `/login` and `/register`
  (`Amida_Rate_Limiter`)
- **PII at rest:** IPs are SHA-256 hashed with a per-install salt before
  persistence (`amida_hash_ip()`)
- **Admin:** `/wp-admin` relocated; XML-RPC disabled
- **Image proxy:** `/compound-img/*` requires authentication, returns
  `Cache-Control: private, no-store`, logs `product_viewed`
- **Uploads:** filenames are hashed (`prod_*.ext`), EXIF is stripped on
  upload, generic alt text required for GLP product images
- **Uninstall:** compliance tables are **never** dropped by `uninstall.php`
  — they are regulated records

## Operator guardrails

- `AMIDA_PUBLIC_CATALOG_ENABLED` MUST be `false` in production
- Changing `AMIDA_PROCESSOR` requires a new underwriting application
- The per-install salt (`amida_compliance_salt` option) must not be rotated
  without first archiving the existing compliance log (would de-link IP
  hashes)

## Backups

Weekly off-site backup to S3 (or Backblaze B2). Retain 90 days rolling and
indefinite yearly. Test a restore quarterly.
