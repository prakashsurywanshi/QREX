# 99% Status (Working)

## Verified now
- `php artisan test`: 53 passed, 182 assertions
- `npm run build`: pass
- Tenant migration + sequence backfill applied locally; tenant-safe unique indexes added
- `qrex:backfill-tenant --dry-run|--tenant=` available
- Tenant regressions: boundary, isolation, header trust, API tenant isolation, backfill command
- Sentry scaffold: config + reporter hook (package/DSN still required)

## Implemented hardening
- `ResolveTenant`: resets context, ignores `X-Tenant-ID` for non-super-admin/inactive tenants
- `IdGenerator`: tenant-aware sequence IDs in multi-tenant mode
- `SettingsApiController`: allowlist + `settings.edit` permission
- Report controllers: removed unscoped `::all()` patterns

## Still pending / must verify before claiming 99%
- Full tenant/authZ audit across all web/API controllers, services, jobs, exports, imports, raw queries, file access, uniqueness constraints
- RBAC permission-matrix coverage and negative tests for every module/action
- End-to-end browser QA: auth, leads→deals→bookings→payments→commissions, projects/units hold/release, payment plans/installments, communications, WhatsApp, portal, reports/exports/imports
- Production-like data migration rehearsal for legacy `tenant_id=null` rows and unique collisions
- Sentry real package + DSN + alert verification
- Security: dependency audit, secret scanning, upload/export abuse checks, rate limits, CSP/headers in prod, backup/restore drill
- Performance: N+1/query profiling, indexes, cache invalidation, queue/scheduler/load behavior
- Ops: Docker/prod env/secrets, SSL/domain/tenant provisioning, monitoring/log rotation
- Flutter: API contract parity QA, FCM device flow, store signing/build, Play/App Store assets
- GitHub push/deploy blocked by credentials
