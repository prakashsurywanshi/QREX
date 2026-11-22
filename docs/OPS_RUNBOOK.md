# QREX Ops Runbook (Baseline)

## Deploy
1. `composer install --no-dev --optimize-autoloader`
2. `npm ci && npm run build`
3. `php artisan migrate --force`
4. `php artisan storage:link`
5. `php artisan config:cache && php artisan route:cache && php artisan view:cache`
6. Run queue worker and scheduler.

## Multi-tenant enablement
- Set `QREX_MULTI_TENANT=true` only after validation.
- Run: `php artisan qrex:backfill-tenant --dry-run` then `php artisan qrex:backfill-tenant`.
- Verify tenant-safe unique indexes and no cross-tenant reads.

## Observability
- Set `SENTRY_LARAVEL_DSN` and `SENTRY_TRACES_SAMPLE_RATE`.
- Trigger a test exception in staging and confirm Sentry event.

## Security checklist
- `APP_DEBUG=false`, HTTPS, secure cookies, rotated secrets.
- Review admin/super-admin accounts and permissions.
- Verify rate limits on auth/export/bulk/webhooks.
- Run `composer audit` and patch vulnerable deps.

## Backup/restore
- Nightly DB backup + storage backup.
- Quarterly restore drill into staging; verify login, leads, bookings, payments, reports.
