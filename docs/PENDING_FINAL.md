# Pending Final - QREX

## Done in this hardening pass
- Tenant header trust fixed (`X-Tenant-ID` super-admin only, inactive tenant ignored)
- Tenant-aware sequence IDs; sequence/backfill migration; tenant-safe unique indexes
- `qrex:backfill-tenant --dry-run|--tenant=`
- Settings API allowlist + permission check
- Security headers enabled (web+api)
- Sentry Laravel SDK installed; config/hook present (DSN required)
- API route permission tightening for dashboard/projects-api/whatsapp status/units-api
- Tests: 53 passed, 182 assertions; build passes

## Remaining blockers (external/manual)
- Push to GitHub: credentials required for QREX and QREX_Flutter
- Sentry: set `SENTRY_LARAVEL_DSN` in env and verify event delivery
- Browser/E2E QA: run servers and smoke core flows (auth, leads→deals→bookings→payments→commissions, projects/units, payment plans/installments, communications, WhatsApp, portal, reports/exports/imports)
- Production-like tenant backfill rehearsal and uniqueness collision check
- Security/perf: dependency audit triage, rate limits/abuse checks, N+1 profiling, backup/restore drill
- Flutter: API contract QA, FCM device flow, store signing/build/assets

## Risk notes
- Many controllers still lack explicit per-record ownership checks beyond permission middleware/global tenant scope; full audit needed.
- Models without `BelongsToTenant`: Permission, Role, Setting, Tenant, TenantBranding (intentional/global).
- Legacy single-tenant rows are backfilled to Default Tenant by migration/command; verify before enabling `QREX_MULTI_TENANT=true`.
