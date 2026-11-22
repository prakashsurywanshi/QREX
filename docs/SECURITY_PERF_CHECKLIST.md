# Security & Performance Checklist (Local Readiness)

## Security
- [x] SecurityHeaders enabled on web+API
- [x] Auth/reset/webhook/export/bulk/device-token throttles
- [x] Settings update allowlisted + permission check
- [x] Tenant header trust restricted to active super-admin
- [x] No controller mass assignment via `request->all()`
- [x] Sentry SDK/config/hook wired; DSN env documented
- [ ] Connected env: `composer audit` triage/remediate
- [ ] Connected env: secret scan, dependency/license review
- [ ] Staging: pentest/abuse tests, file upload/download auth verification

## Performance
- [x] Safe DB indexes migration present
- [x] Inertia shared settings/permissions cached
- [x] Export endpoints limited/paginated where applicable
- [ ] Profile N+1 on dashboard/reports/exports/lists with realistic data
- [ ] Queue/scheduler load test for notifications/WhatsApp/FCM
- [ ] Cache invalidation review for settings/permissions/branding

## Operations
- [x] `qrex:readiness-check` command
- [x] `qrex:backfill-tenant --dry-run` rehearsal command
- [ ] Backup/restore drill on staging
- [ ] Prod secrets/SSL/domain/queue/scheduler monitoring
