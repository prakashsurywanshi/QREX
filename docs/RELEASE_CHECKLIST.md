# Release Checklist

## Pre-release
- [ ] `php artisan test` passes
- [ ] `npm run build` passes
- [ ] `php artisan migrate --force` on staging
- [ ] `php artisan qrex:backfill-tenant --dry-run` reviewed (multi-tenant)
- [ ] `.env` secrets set (DB, mail, WhatsApp, FCM, Sentry, maps)
- [ ] Storage linked and writable
- [ ] Queue worker + scheduler configured

## Security
- [ ] APP_DEBUG=false in production
- [ ] HTTPS/TLS enabled
- [ ] Admin/super-admin accounts reviewed
- [ ] Tenant header trust rules verified
- [ ] File upload and export endpoints validated

## SaaS / Tenant
- [ ] Default tenant/backfill verified
- [ ] Domain/subdomain mapping verified
- [ ] Branding assets per tenant verified
- [ ] Cross-tenant access tests pass

## Ops
- [ ] DB backup/restore tested
- [ ] Error monitoring (Sentry) receiving events
- [ ] Logs/alerts configured
- [ ] Rollback plan documented
