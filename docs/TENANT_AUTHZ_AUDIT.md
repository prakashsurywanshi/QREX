# Tenant/AuthZ Audit (Local Pass)

## Scope
- Static scan of `app/Http/Controllers`, `app/Services`, routes middleware, and tenant-owned models.
- Date: 2026-11-22 (local hardening pass).

## Verified/Fixed
- `ResolveTenant`: resets context; only active super-admin can switch via `X-Tenant-ID`; inactive tenants ignored.
- `BelongsToTenant` applied to tenant-owned business models; globals: `Permission, Role, Setting, Tenant, TenantBranding`.
- Tenant-aware IDs: `IdGenerator` uses tenant when multi-tenant; sequence backfill migration and `qrex:backfill-tenant` command.
- Tenant-safe unique indexes added for key IDs (leads/deals/bookings/payments/projects/properties/site_visits/customers).
- API routes: auth/sanctum protected; sensitive endpoints have `permission:*` middleware; auth/reset/webhook/export/bulk/device-token throttles.
- `SettingsApiController` updates allowlisted and require `settings.edit`.
- No `request->all()` mass-assignment in controllers; no controller raw `DB::table` writes found; `tenant_id` not accepted from request input.

## RBAC/Ownership Notes
- Many endpoints rely on permission middleware + `BelongsToTenant` global scope. This is baseline protection, not full object-level authorization for every edge case.
- User-owned endpoints (notifications, profile, device tokens) are auth-scoped and filtered by `user_id`.
- Admin/super-admin web routes for settings/tenants/roles are permission/role guarded.

## Remaining Manual Verification
- Full per-action RBAC matrix against seeded roles for all modules.
- Browser/E2E negative tests for cross-tenant ID access and privilege escalation.
- Production-like data rehearsal before `QREX_MULTI_TENANT=true`.
- File/download/export authorization review with real tenant data.
