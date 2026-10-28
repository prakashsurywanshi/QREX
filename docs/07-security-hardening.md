# 7. Security & Hardening

QREX applies defense-in-depth across authentication, authorization, rate limiting, and export safety.

## 7.1 Authentication

- Admin uses session-based auth (`auth` middleware).
- The JSON API uses **Laravel Sanctum** tokens (`auth:sanctum`) — tokens stored hashed in `personal_access_tokens`. Create tokens on login, revoke on logout.
- Passwords are stored with Laravel's default `bcrypt`/`argon` hashing (`'password' => 'hashed'` cast).
- Login throttled: `throttle:5,1` (5 attempts per minute).
- Password reset links are emailed with a custom `ResetPasswordNotification`; forgot/reset endpoints are throttled (`throttle:5,1`).

## 7.2 Rate Limiting

| Endpoint | Limit |
| --- | --- |
| `POST /login` | 5 per minute |
| `POST /forgot-password`, `POST /reset-password` | 5 per minute |
| `POST /contact/enquiry` | 5 per 10 minutes |
| `POST /properties/{property}/enquiry` | 5 per 10 minutes |
| Email OTP send/verify (per user+purpose) | see below |

## 7.3 Email OTP Flow (profile email changes)

`OtpService` enforces strict rules for the email-change flow:

- OTP is a random 6-digit code, stored **hashed** (`Hash::make`), single-use (`used_at`).
- **TTL**: 10 minutes.
- **Resend cooldown**: 60 seconds.
- **Verification attempts**: max 5 per user+purpose; exceeding throws *"Too many verification attempts…"*.
- Server always returns the same response for "correct" and "incorrect" code to prevent **email-enumeration** during current-email verification.

## 7.4 Authorization (RBAC)

- Route-level `permission:` middleware for every module action (see [`04-roles-permissions.md`](./04-roles-permissions.md)).
- Controller-level access checks on scoped data (lead ownership vs admin) — 403 on unauthorized access.
- Field-level permission checks (e.g., Settings page keys).
- Role-only gates for destructive/system config: `role:super-admin` on SMTP update, test mail, logo upload/remove; `roles.delete` excludes even `admin`.
- CSRF protection automatically enabled on web routes (Laravel default).

## 7.5 Data Exposure Control

- `Lead::scopeVisibleTo` restricts lead lists, reports, and detail views for `sales-executive` / `senior-agent`.
- Soft deletes preserve data (see §5.4) and public web queries filter `is_website_visible` consistently — hidden properties return 404 on the public site.
- API mirrors the same permission middleware as web routes.

## 7.6 CSV & Reporting Safety

- **Formula injection protection** (`ReportController::escapeCsvRow`): string values starting with `= + - @ \t \r` are prefixed with a single quote before being written into CSV — prevents spreadsheet formula execution from exported report data.
- Export type is validated against an allow-list (`revenue, leads, payments, agents, properties, sitevisits, campaigns, bookings`); unknown types fall back to `revenue`.
- Export responses set `Cache-Control: no-store` and `Content-Disposition: attachment`.
- Lead CSV import accepts only `csv`/`txt` ≤ 2 MB, normalizes/validates every row, dedupes within-file and against the DB, and runs in a transaction with rollback.

## 7.7 Secrets & Configuration

- `.env` is git-ignored; `.env.example` holds placeholders only.
- SMTP credentials live in the `settings` table; the API masks the password (`********`) in read responses and never overwrites a stored password on save unless a real new one is submitted.
- No secrets appear in frontend props; permission payloads exclude sensitive data.

## 7.8 Idempotency / Concurrency Guards

- **Lead → deal conversion** uses `lockForUpdate()` on the lead row inside a transaction, so a concurrent double-submit cannot create duplicate deals.
- **Readable IDs** rely on `sequences` auto-increment (no read-modify-write race).
- **Site-visit auto-creation** checks for an existing `lead_id` visit before creating.

## 7.9 Summary of Hardening Migration

Deployed with the enterprise-hardening migration: rich indexes on hot query paths, `stage_changed_at` for stage analytics, and consistent soft deletes across primary entities — supporting reliable, indexed, and auditable reads at team scale.