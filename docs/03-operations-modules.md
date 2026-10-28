# 3. Operations & Module Working Details

This document describes how each feature actually works, derived from the routes, controllers, models, and frontend pages. Route prefixes refer to `routes/web.php` unless noted. API equivalents (`routes/api.php`, Sanctum-authenticated) exist for nearly every admin module.

## 3.1 Public Website

Routes: `GET /`, `/properties`, `/properties/{property}`, `/about`, `/contact`.

### Home (`/`)
`PublicPageController::home` renders `public/Home` with:

- **Featured properties** — `featured = true` and `is_website_visible = true`.
- **Latest properties** — the 6 most recent visible listings.
- **Agents** — up to 4 sales roles (Sales Executive / Senior Agent) for display.
- **Category counts** — number of visible properties grouped by `type`.
- **Stats** — total properties, deals, customers, years in business (derived from the earliest record timestamp), and total revenue (sum of `deal_value` formatted as ₹L / ₹Cr).

### Property listings (`/properties`)
`PublicPageController::properties` renders `public/Properties`. Supports the following query parameters:

| Filter | Behavior |
| --- | --- |
| `search` | Matches title / city / type (`LIKE`) |
| `type` | Exact match on `type` (`All` = no filter) |
| `status` | Exact match on `status` (`All` = no filter) |
| `bedrooms` | `>=` match when `> 0` |
| `min_price` / `max_price` | Range match on `price` |
| `sort` | `price_asc`, `price_desc`, `featured` (desc), default `newest` |

Pagination is 6 per page. Only `is_website_visible = true` listings are returned.

### Property detail (`/properties/{property}`)
- Loads `agent` and `images`.
- Returns 404 if the property is not website-visible (soft-404 behavior).
- Shows up to 3 **similar** properties of the same `type` (falls back to any 3 if none match).
- Exposes the property's agent (name, phone, email, role).

### About (`/about`) & Contact (`/contact`)
- About renders the agent list and hard-coded marketing stats.
- Contact is a static page with the enquiry form.

### Enquiry forms (rate-limited)
Routes: `POST /contact/enquiry` and `POST /properties/{property}/enquiry`, both `throttle:5,10`.

Each creates a `Lead` (`source = Website`, `status = New`, `score = 0`) and a **Note** activity *Website enquiry submitted* / logs the message into `requirements`. Property enquiries set `interested_property_id`. Validation: `name` and `phone` required, `email` (nullable, format), `message` (nullable).

## 3.2 Authentication, Profile & Password

### Login
- `GET /login` renders the login page; `POST /login` authenticates, `throttle:5,1` (max 5 attempts/min).
- `POST /logout` logs out.

### Password reset
- `GET /forgot-password` + `POST /forgot-password` (`throttle:5,1`) send a reset link.
- `GET /reset-password/{token}/{email?}` renders the reset form; `POST /reset-password` (`throttle:5,1`) performs the reset.
- Uses a custom `ResetPasswordNotification` carrying a URL to the Inertia reset page.

### Profile & email change (OTP-verified)
- `GET/PUT /profile`, `PUT /password`.
- Changing email is a **three-step OTP flow** on both web and API:
  1. `POST /profile/email/otp` — sends an OTP to the current email.
  2. `POST /profile/email/verify-current` — verifies it (server always returns success to avoid email-enumeration).
  3. `POST /profile/email/new-otp` — sends an OTP to the new email.
  4. `POST /profile/email/verify-new` — verifies the new-email OTP and commits the change.
- Implementation lives in `OtpService` (see §7 Security for limits).

## 3.3 Dashboard

Route: `GET /admin/dashboard` (`permission:dashboard.view`).

`DashboardController::index` aggregates KPI cards, charts, and lists — e.g. total leads, deals by stage, pipeline value, recent leads/activities, site visits, payments — and renders `admin/Dashboard`. Sales roles see only their own data via the shared agent-scope helper. API mirror: `GET /api/dashboard`.

## 3.4 Leads

Routes (gated by `permission:leads.*`):

| Action | Route | Permission |
| --- | --- | --- |
| List | `GET /admin/leads` | `leads.view` |
| Detail | `GET /admin/leads/{lead}` | `leads.view` |
| Create | `POST /admin/leads` | `leads.create` |
| Update | `PUT /admin/leads/{lead}` | `leads.edit` |
| Reassign | `POST /admin/leads/{lead}/reassign` | `leads.edit` |
| Activity | `POST /admin/leads/{lead}/activity` | `leads.edit` |
| Status | `POST /admin/leads/{lead}/status` | `leads.edit` |
| Convert | `POST /admin/leads/{lead}/convert` | `sales.create` |
| Import | `POST /admin/leads/import` | `leads.create` |
| Template | `GET /admin/leads/import-template` | `leads.create` |

### List / search
- Elastic-ish search on `name`, `phone`, `email` (`LIKE`), plus filters on `status`, `source`, `campaign`; 10 per page, newest first.
- **Agent scope**: Super Admins/Admins see all. Sales Executive / Senior Agent automatically see only leads where they are `assigned_agent_id` or `owner_id` (`applyAgentScope` / model `scopeVisibleTo`). The same rule is enforced on detail views (`authorizeLeadAccess` → 403).

### Status lifecycle
Valid statuses: `New, Contacted, Qualified, Site Visit Scheduled, Site Visit Completed, Negotiation, Converted, Lost`.

- `site visits` are auto-created when a lead status becomes **Site Visit Scheduled** (once per lead — a `lead_id` exists check prevents duplicates). The visit date/time is parsed from `next_followup`, defaulting to tomorrow 10:00 AM.
- Each status change logs a **Status Change** activity and may trigger a `site_visit.scheduled` notification.
- Conversion is blocked for leads in `Converted` or `Lost`.

### Activity timeline
`POST /admin/leads/{lead}/activity` appends a `LeadActivity` row (type, title, description, duration, outcome, contact number, email subject, next follow-up, location). Logging an activity with `next_followup` also syncs the lead's follow-up task and updates `last_contact`.

### Reassignment / handover
- `reassign` moves both `assigned_agent_id` and `owner_id`.
- If the assignee changed, a `LeadHandover` record is created (from, to, reason, notes) and a **Reassignment** activity logged.

### Follow-up task sync
Shared helper `syncFollowupTask`:

- Parses `next_followup` into `(date, time)` using common formats (`Y-m-d`, `Y/m/d`, `d-m-Y`, `d/m/Y`, plus AM/PM or 24h times). If the raw value is empty, any open follow-up task is completed.
- Creates (`TSK-xxx`, title *Follow-up: {name}*, priority High, status Pending/Overdue) or updates the latest open follow-up task for the lead, assigned to the lead's agent.

### CSV import
`import` accepts `csv`/`txt`, max 2 MB, with optional campaign assignment:

- Header auto-detection with **column aliases** (e.g., `name/full_name/lead_name`, `phone/mobile/contact_number`, `assigned_agent/agent/agent_name`, `interested_property/property` …).
- Falls back to sequential column mapping if no header is detected.
- Per-row validation: `name` + `phone` required; duplicate detection **within file** (by phone) and **against the DB** (phone, or name+phone).
- References (`interested_property`, `assigned_agent`) resolve by ID or by fuzzy name/title match (property title `LIKE`, agent name).
- `source`, `status`, `score` are normalized to allowed values / clamped 0–100.
- Runs in a transaction with rollback on failure; reports `X imported, Y skipped` with a per-row error list flashed to the session.
- Each row logs a **Lead Imported** activity and syncs a follow-up task when `next_followup` is present.
- `importTemplate` streams a CSV with headers and one example row.

### Convert to deal
`convertToDeal` runs inside a transaction, `lockForUpdate()` on the lead row (prevents double-conversion under concurrency):

1. Blocks if lead status is `Converted`/`Lost`.
2. Creates `Deal` (`DL-xxx`, customer = lead name, property = chosen or lead's `interested_property_id`, `stage = Qualified` (or provided), probability 30, `stage_changed_at = now`).
3. Sets lead `status = Converted`, logs a **Conversion** activity, notifies the lead's agent.

## 3.5 Properties

Routes gated by `permission:properties.view/create/edit/delete`.

- **Fields** (`Property` model + form): property ID, title, type (Apartment/Villa/Plot/Commercial/Office/Shop/Warehouse/Farm-Land), transaction type, description, status, price + price label (auto-formatted ₹L/₹Cr), area, bedrooms, bathrooms, floors, parking, furnishing, possession date, address/city/state/country/pincode, lat/long, amenities (JSON array), featured, website-visibility, SEO title/meta, slug, cover image.
- **Images**: multiple images per property (`PropertyImage` table) via `POST /admin/properties` (form data) and dedicated image endpoints in the API (store / delete / set cover). `coverOrImage()` returns the cover image, else the first image, else the raw `image` column.
- `featured` and `is_website_visible` toggles control what the public site shows.
- Detail view loads agent + images; soft-deleted properties are excluded from public listings.

## 3.6 Customers

Routes gated by `permission:customers.view/create/edit`.

- CRUD with detail view (`CustomerDetail.tsx`). Customers hold demographic + budget/notes info.
- Customers are not tied to a user typically; shared read access across sales & accountancy roles.

## 3.7 Site Visits

Routes gated by `permission:site_visits.*`.

- Auto-created when a lead is moved to *Site Visit Scheduled* (see §3.4); can also be created manually from the admin area.
- Fields: `visit_id` (`SV-xxx`), customer name, property name, agent name, `visit_date`, `visit_time`, `status`, location, notes, feedback.
- Statuses: `Scheduled, Confirmed, Completed, Cancelled, Rescheduled` (report groups `Scheduled`+`Confirmed` as scheduled).
- Linked to a lead via `lead_id` (added by later migration).

## 3.8 Bookings

Routes gated by `permission:bookings.*`.

- Captures the deal: `booking_id` (`BK-*` range), customer, property, agent, `booking_date`, `deal_value` + label, `booking_amount` + label.
- Three parallel status tracks:
  - `status` — booking lifecycle (default `Booking Pending`).
  - `agreement_status` — agreement progress (default `Pending`).
  - `possession_status` — possession progress (default `Pending`).
- API includes a delete route; web admin exposes index, show, store, update.

## 3.9 Payments

Routes gated by `permission:payments.*`.

- Fields: `payment_id`, customer, property, `amount` + label, `mode`, `txn_id`, `due_date`, `paid_date`, `status`.
- Statuses: `Pending, Paid, Overdue, Partially Paid` (report groups these three as "pending" when computing collection vs due).
- Payments are recorded manually — no gateway integration.

## 3.10 Tasks

Routes gated by `permission:tasks.*`.

- Tasks have title, description, `type` (e.g., **Follow-up**), priority, status (`Pending`, `Overdue`, `Completed`), `due_date`, `due_time`, `related_to`/`related_id`, `lead_id`, `assigned_to_id`, `created_by`.
- Follow-up tasks are generated automatically from lead `next_followup` values (see §3.4) and flagged overdue by `leads:check-followups`.

## 3.11 Notifications

Routes: `GET /admin/notifications`, `POST /admin/notifications/read-all`, `PUT /admin/notifications/{notification}/read` (all authenticated users, no permission gate).

- Rows: `user_id`, `title`, `message`, `type` (`followup`, `lead.converted`, `site_visit.scheduled`, …), `related_id`, `is_read`, `is_seen`.
- The follow-up automation creates `followup` notifications with a 12-hour de-duplication window (no duplicate unread notification for the same lead within 12h).
- Frontend polls/unreads via the API; the nav badge reflects unread count.

## 3.12 Marketing / Campaigns

Routes gated by `permission:marketing.*`.

- Campaign fields: name, channel (e.g., Facebook, Instagram, Google), budget, spent, leads count, conversions, revenue, ROI, status, `start_date`, `end_date`.
- Leads can carry a `campaign_id` (assigned at creation or via import), letting teams attribute leads to campaigns.

## 3.13 Media Center

Routes gated by `permission:media.*`.

- Centralized file management: upload, list, delete (`MediaFile` rows; soft-deleted).
- Files stored on the app's configured disk (public by default for web-accessible media).

## 3.14 Reports

Routes gated by `permission:reports.view` and `reports.export`.

`ReportController::index` computes the following datasets, honoring filters (`range`, `agent_id`, `property_id`):

| Dataset | Description |
| --- | --- |
| `revenueByMonth` | Monthly closed-won revenue (₹Cr) and lead counts |
| `leadSourceData` | Leads grouped by source |
| `pipelineFunnel` | Deal counts/values per stage across the 12 canonical stages |
| `agentPerformance` | Closed-won deals + revenue per sales agent (first names), filtered by range/property |
| `monthlyBookings` | Bookings count + deal value per month |
| `paymentData` | Collected (paid) vs pending (pending/overdue/partially paid) per month |
| `propertyPerformance` | Top 8 properties: views (sample), leads, deals |
| `siteVisitReport` | Totals: scheduled/confirmed, completed, cancelled, rescheduled |
| `lostLeadReport` | Lost vs converted leads, lost leads by source |
| `campaignPerformance` | Campaign budget/spend/leads/conversions/ROI |
| `reportTables` | Latest 50 leads, deals, payments for tabular views |

**Range bounds**: `today`, `7d`, `30d`, `90d`, `ytd`, `all`.

**Exports** (require `reports.export`):

- `GET /admin/reports/export?type=<t>` streams a **CSV**. Allowed types: `revenue, leads, payments, agents, properties, sitevisits, campaigns, bookings`. Unknown types fall back to `revenue`.
  - CSV values are escaped against **spreadsheet formula injection**: leading `= + - @ \t \r` are prefixed with `'`.
- `GET /admin/reports/export-pdf?type=<t>` renders `resources/views/exports/report.blade.php` via **DomPDF** into a downloadable PDF (filename `report-<type>-<timestamp>.pdf`).
- Monies are converted from raw rupees to ₹L/₹Cr in several datasets ("in Cr", "in L").

## 3.15 CMS

Routes gated by `permission:cms.view/cms.edit`.

- `PUT /admin/cms/featured` — pick featured properties (via `updateFeatured`).
- `PUT /admin/cms/{section}` — edit a site content section (hero, about, contact text, etc.).
- The public site renders CMS values where wired (featured listings on Home, section content on About/Contact).

## 3.16 Settings

Routes gated by `permission:settings.view/settings.edit`; SMTP/logo routes additionally require the `super-admin` **role**.

`SettingController` holds a `$defaults` map (project name, tagline, contact info, currency, timezone, colors, social links, office hours, SEO defaults, analytics code, feature toggles such as `enable_contact_form`, `maintenance_mode`, `lead_auto_assign`, `visit_reminders`, `payment_alerts`). `Setting::allAsArray()` merges saved values over defaults.

- **Update** filters incoming fields against the caller's **field-level permissions** (`settings.edit.<key>`), so a user with limited permissions can only change allowed keys.
- **Logo** upload (`POST /admin/settings/logo`) stores to the public disk under `settings/`, saves `logo_url`; deletion removes the file safely (only inside the `settings/` prefix) and resets the value. Super-admin only.
- **SMTP** (`PUT /admin/settings/smtp`) — super-admin only. See `MailConfigService` (§2.4): masked password preserved when empty/`********`; runtime mailer config applied on demand (`applyForEmailSending`), degrading to the `log` mailer when disabled.
- **Test mail** (`POST /admin/settings/test-mail`) — super-admin only; sends a raw SMTP test to the configured `test_email` or a provided recipient and reports success/error.

## 3.17 Users

Routes gated by `permission:users.*`.

- Fields: name, email, password (hashed), phone, `role` (display), `branch`, `status`, `avatar`, `last_login_at`.
- List/detail with role attribution; store/update/destroy for admins.

## 3.18 Roles & Permissions

Web: `GET /admin/roles`, `/admin/permissions`, `POST/PUT/DELETE /admin/roles` (gated by `roles.*`). API mirrors these. See [`04-roles-permissions.md`](./04-roles-permissions.md).

## 3.19 API (mobile/integration)

`routes/api.php` exposes the same modules under `/api` behind `auth:sanctum`:

- Auth: login, reset link, me, logout, profile, password, email-OTP flow.
- Dashboard, notifications; full CRUD for properties (incl. image management), leads (incl. import template/import/convert/activities), pipeline deals (incl. move stage), customers, site visits, tasks, bookings, payments, media, campaigns, reports (export/export-pdf), CMS, users, roles/permissions, settings (incl. SMTP test).
- All permission-gated identically to the web routes.