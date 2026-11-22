# Implementation Decisions (Pending-Work Pass)

## Tenant Isolation
- `qrex.multi_tenant=false` preserves single-tenant behavior; `BelongsToTenant` auto-assigns/scopes only when enabled.
- Legacy `tenant_id=null` rows: treated as legacy/global in single-tenant mode; when multi-tenant is enabled, admin backfill command assigns Default Tenant.
- `X-Tenant-ID` header is only honored for authenticated super-admin/API administrative contexts; normal users cannot switch tenant by header.
- Global/shared models: `Permission`, `Role`, `Setting`, `Tenant`, `TenantBranding`.
- `sequences` include `tenant_id` for tenant-safe ID generation when multi-tenant is enabled.

## Quality Gates
- PHPUnit + Vite build required; CI runs both.
- Tests use MySQL testing DB (`qrex_db_testing`) in local env as configured; CI provisions MySQL service.

## Observability/Ops
- Sentry DSN/env hooks added; package install is optional if composer dependency unavailable in offline env.
- Docker/CI provided as baseline; production hardening requires infra secrets and deployment pipeline credentials.
