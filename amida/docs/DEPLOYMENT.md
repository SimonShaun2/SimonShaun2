# Amida — Deployment Runbook (Pressable)

## 0. Prerequisites

- Pressable WordPress plan (Automattic-managed)
- Domain: `amida.com` — DNS managed at registrar
- Mercury business banking account (EIN required)
- Bankful merchant application approved (or fallback: Easy Pay Direct,
  Corepay, AllayPay, Durango)
- Telegram channel provisioned (update `AMIDA_TELEGRAM_URL`)
- SFTP / WP-CLI access to Pressable

## 1. Initial site

1. Create a new site in the Pressable dashboard; name it `amida-prod`.
2. Connect the domain; verify TLS auto-provisioning.
3. Enable Pressable WAF, CDN, automatic backups.
4. Create a staging site (`amida-staging`) mirrored from prod.

## 2. Upload build artifacts

```bash
sftp amida@sftp.pressable.com
> cd htdocs/wp-content
> put -r amida/wp-content/mu-plugins/amida-brand.php mu-plugins/
> put -r amida/wp-content/plugins/amida-compliance plugins/
> put -r amida/wp-content/themes/amida themes/
```

Copy `robots.txt` to document root.

## 3. Plugins (via admin)

Install and activate in order:

1. WooCommerce
2. Advanced Custom Fields (ACF) Pro
3. Custom Post Type UI
4. Really Simple SSL
5. Wordfence Security
6. WP 2FA
7. Force Login (WPForce)
8. WP Rocket
9. Rank Math SEO
10. Klaviyo for WooCommerce
11. CartFlows
12. Pricing Deals for WooCommerce
13. **amida-compliance** (our plugin)

Activate the Amida theme.

## 4. Seed the site

```bash
wp --ssh=sftp://amida@sftp.pressable.com plugin activate amida-compliance
wp --ssh=... theme activate amida
wp --ssh=... eval-file wp-content/../scripts/seed-pages.php
wp --ssh=... eval-file wp-content/../scripts/seed-catalog.php
wp --ssh=... rewrite flush
```

## 5. Processor

- Configure Bankful API credentials in `wp-config.php`:

  ```php
  define('AMIDA_PROCESSOR_API_KEY', '...');
  define('AMIDA_PROCESSOR_IFRAME_URL', '...');
  ```
- Set billing descriptor in processor portal to `AMIDA RESEARCH`.
- Confirm fallback chain is documented internally (Easy Pay → Corepay →
  AllayPay → Durango).

## 6. Security hardening

- Change `/wp-admin` to a custom URL via Wordfence or WPS Hide Login.
- Enforce 2FA for every `administrator` and `shop_manager`.
- Limit login attempts to 5 per 15 minutes per IP (Wordfence).
- Disable XML-RPC.
- Hide WordPress version.
- Configure off-site weekly backup to S3 or Backblaze B2.

## 7. Smoke tests

Run `docs/PRE_LAUNCH_CHECKLIST.md` from top to bottom. Every box must be
checked before switching DNS to Pressable.

## 8. Go-live

1. Confirm all smoke tests pass on `amida-staging`.
2. Switch DNS to Pressable; verify TLS.
3. Run `wp cache flush` and `wp rewrite flush` on prod.
4. Monitor compliance log for 24 hours; confirm no prohibited-term flags.
5. Submit URL to Google Search Console (public pages only).
