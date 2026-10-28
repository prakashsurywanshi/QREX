# Project Proposal: QREX – Qodeigence Real Estate Experience

**Prepared by:** Qodeigence Inc.
**Project name:** QREX — Qodeigence Real Estate Experience
**Audience:** Real estate agencies, brokerages, and developers
**Version:** 1.0
**Status:** Proposal for discussion

> This proposal combines an independent market research summary with a technical and commercial description of QREX, a complete real estate marketing + sales CRM platform. All market figures cite their sources; commercial terms are indicative and open for discussion.

---

## 1. Executive Summary

Real estate is an increasingly value-driven, competitive, and digital-first industry. In India alone, the sector is valued at roughly **₹23.5 lakh crore (7.1% of GDP)**, and 2025 primary housing sales crossed **₹8.46 lakh crore, up 16% year-on-year** (CREDAI–Liases Foras). Yet the teams that win these deals run on fragmented tools. The global real estate CRM market is growing at **12–13% CAGR** (see §12), pushed by exactly this gap.

The industry research is blunt:

- Agents take an average of **15 hours** to respond to a new lead, but leads contacted within **5 minutes are 21× more likely to qualify** — and **78% of buyers work with the first agent who responds** (Inman; MIT/InsideSales; NAR).
- **87% of real estate deals are lost because follow-up fades** after the first touch (SureSend).
- Only ~**30–45% of agents use a CRM consistently**; the rest juggle spreadsheets, email folders, or nothing (NAR; Inside Real Estate).
- **68% of brokerages report CRM adoption below 50%**, driven by tool fragmentation and data-entry burden (T3 Sixty / TotalBrokerage; Salesforce).

**QREX (Qodeigence Real Estate Experience)** is the answer we built. It is a single, integrated platform that combines:

1. a **public-facing property website** that turns visitors into leads automatically,
2. a **full sales CRM** with lead lifecycle, activity history, and a Kanban deal pipeline,
3. **sales operations** for properties, customers, site visits, bookings, and payments,
4. **productivity automation** (follow-up tasks, reminders, notifications) that attacks the *real* reason deals die — slow, inconsistent follow-up,
5. **management reporting** with CSV/PDF exports to measure what actually works.

QREX was purpose-built for **Indian agencies**: INR-native value formatting (₹L/₹Cr), Indian phone/contact workflows, Mumbai-first demo market coverage, and team/role security that scales from a 3-person office to multi-branch enterprises.

We propose partnering with your agency to deploy QREX — from setup and data migration through team enablement and ongoing optimization.

QREX naturally pairs a **public-facing real-estate website** with an **internal admin CRM suite**. It covers the full sales lifecycle for a real-estate agency:

- **Public visitors** browse and filter property listings, view property galleries, and submit contact / property enquiries.
- **Enquiries automatically become leads** in the CRM.
- **Agents** manage leads through a status lifecycle, log activity, reassign/hand over leads, and schedule site visits.
- **Deals** are tracked on a Kanban-style pipeline from *New Lead* through to *Closed Won / Closed Lost*.
- **Operations** staff manage properties (with image galleries), customers, site visits, bookings, and payments.
- **Marketing** users run campaigns and manage media assets.
- **Management** monitors dashboards and reports with CSV/PDF export.
- **Super-admins** control users, roles, permissions, CMS content, and SMTP mail configuration.

The application follows the Latte stack: **Laravel 13** + **Inertia 3** + **React 19** + **TypeScript** + **Tailwind CSS 4** + **Vite 8**.

---

## 2. About Qodeigence Inc.

**Qodeigence Inc.** is a software company specializing in digital products for real estate and sales-driven industries. QREX — **Qodeigence Real Estate Experience** — is our flagship product, a production real estate marketing and CRM platform.

Our approach is partnership, not hand-off:

- We bring domain knowledge of the agency sales process (leads → site visits → bookings → payments).
- We ship a **complete, working product** rather than a template.
- We support deployment, data import, training, and ongoing operation.
- We are open to localizing QREX for your city, your property portfolio, and your branding.

---

## 3. Project Scope

### 3.1 Product Overview

QREX is a **property management and sales CRM** for a real-estate agency. It is a single Laravel application that exposes three surfaces:

1. **Public website** — marketing site for prospective buyers (property listings, details, about, contact).
2. **Admin CRM** — password-protected management suite for the sales and operations teams (`/admin`).
3. **JSON API** — Sanctum-authenticated endpoints mirroring the admin modules (for mobile clients / integrations and used by the Inertia admin UI's data layer).

### 3.2 Who It Serves

| User | What they do |
| --- | --- |
| Public visitor | Browses properties, submits enquiries |
| Sales Executive | Manages assigned leads, logs activities, creates properties/customers/tasks, requests site visits |
| Senior Agent | Sales Executive scope plus pipeline (deals) access |
| Marketing User | Manages campaigns, media, and public-site content (CMS) |
| Accountant | Manages bookings & payments, views customers and reports |
| Admin | Most permissions across all modules (excludes a few system-level settings) |
| Super Admin | Full system access: users, roles, permissions, settings, SMTP, CMS, everything |

### 3.3 In-Scope

- Public property listings: search, filter (type, status, bedrooms, price range), sort (newest, price, featured).
- Property detail pages with image galleries and enquiry form.
- About and contact pages; contact/property enquiry forms that create leads.
- Lead management: status lifecycle, activity timeline, lead handovers/reassignment, CSV bulk import with template, conversion to deals.
- Sales pipeline: Kanban deal board with configurable stages and drag-style movement.
- Properties CRUD with multiple images per property, featured and website-visibility toggles, SEO fields.
- Customer records with detail views.
- Site visit scheduling with statuses (Scheduled → Completed/Cancelled/Rescheduled).
- Bookings with agreement and possession tracking.
- Payments with due/paid dates and statuses.
- Follow-up tasks with due dates; automated overdue detection + notifications.
- In-app notifications with read/unread.
- Marketing campaigns with budget/spend/ROI tracking.
- Media center for centralized file management.
- Reports: dashboard metrics, revenue, lead sources, pipeline funnel, agent performance, monthly bookings, payment collection, campaign performance, property performance, site-visit and lost-lead reports; CSV and PDF export.
- CMS: public-site section content and featured properties.
- Application settings incl. branding and social links.
- SMTP mail configuration (super-admin only) with a test-mail feature.
- User management, custom role-based access control with field-level permissions, password reset, OTP-verified email changes, login throttling.

### 3.4 Out-of-Scope (as implemented)

- No payment gateway integration — payments are recorded manually (mode, transaction id, status).
- No public user registration / buyer accounts — all leads are created by agents or via public enquiry forms.
- No lead auto-scoring algorithm — a `score` is stored (0–100) and set manually / via import; there is no scoring engine.
- No email sending library beyond the built-in SMTP mailer — no support for marketing campaign blasts.
- No multi-tenant / multi-branch isolation in the data model — the `branch` field exists on users but access scoping is role-based only.
- No real-time (websocket) notifications — notifications are polled via HTTP.
- No calendar integration for site visits; visits are stored as date/time strings.

### 3.5 System Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                        QREX application                     │
│                                                             │
│  Public website               Admin CRM          JSON API   │
│  (Inertia+React)          (Inertia+React, auth)  (Sanctum)  │
│  / /properties /about       /admin/…, /profile   /api/…     │
│  /contact + enquiries        + /login flow                  │
│        │                        │                │          │
│        └──────────┬─────────────┴────────────────┘          │
│                   ▼                                         │
│        Laravel 13 (routes, controllers, models,             │
│        services, console commands, RBAC)                    │
│                   │                                         │
│                   ▼                                         │
│        Database (MySQL/SQLite via Eloquent ORM)             │
│        + storage disk for uploads, DomPDF for PDFs          │
└─────────────────────────────────────────────────────────────┘
```

Key boundaries:

- The public website is read-only except the two enquiry endpoints.
- Every admin route requires authentication and, for gated modules, a specific permission.
- The API uses Laravel Sanctum tokens and the same permission middleware.

### 3.6 Key Behaviors (end-to-end examples)

**Visitor enquiries → lead:**

1. Visitor submits the contact enquiry form (`POST /contact/enquiry`, throttled 5/10min).
2. The controller creates a `Lead` (`source = Website`, `status = New`, `score = 0`) and logs a *Website enquiry submitted* activity.
3. Property enquiries additionally set `interested_property_id`.

**Lead → site visit → deal:**

1. Agent marks a lead *Site Visit Scheduled* (`POST /admin/leads/{lead}/status`).
2. If no visit exists yet for the lead, a `SiteVisit` is auto-created (`SV-xxx`), and the agent is notified.
3. Agent converts the lead to a deal (`POST /admin/leads/{lead}/convert`). This is wrapped in a transaction with a row lock, creates a `Deal` (`DL-xxx`, `stage = Qualified`, probability 30), flips the lead to `Converted`, logs the activity, and notifies the agent.

**Follow-up automation:**

1. Agents set `next_followup` on a lead (create/update/activity), which syncs a `Follow-up` task (`TSK-xxx`) assigned to the lead's agent.
2. The scheduled command `php artisan leads:check-followups` flags tasks due today (`Follow-up due today`) or past-due (`Overdue`) and creates in-app notifications, de-duplicating at 12-hour windows.

---

## 4. Project Vision & Objectives

QREX exists to give real-estate agencies:

1. **Speed to lead** — enquiries from the website land in the CRM instantly as leads (no manual entry).
2. **No dropped follow-up** — scheduled follow-up tasks, overdue detection, and in-app notifications ensure no lead is forgotten.
3. **One source of truth** — property inventory, customers, visits, bookings, and payments in one system.
4. **Accountable teams** — role-based and field-level permissions; every agent sees and manages their own pipeline.
5. **Data-driven decisions** — dashboards and CSV/PDF reports that show lead source ROI, agent performance, pipeline funnel, and revenue.

---

## 5. Solution Overview & Module Working Details

QREX is fully built (production Laravel application) and ready to deploy. This section describes the modules and how each feature actually works, derived from the routes, controllers, models, and frontend pages. Route prefixes refer to `routes/web.php` unless noted. API equivalents (`routes/api.php`, Sanctum-authenticated) exist for nearly every admin module.

### 5.1 Public Website

Routes: `GET /`, `/properties`, `/properties/{property}`, `/about`, `/contact`.

**Home (`/`)** — `PublicPageController::home` renders `public/Home` with:

- **Featured properties** — `featured = true` and `is_website_visible = true`.
- **Latest properties** — the 6 most recent visible listings.
- **Agents** — up to 4 sales roles (Sales Executive / Senior Agent) for display.
- **Category counts** — number of visible properties grouped by `type`.
- **Stats** — total properties, deals, customers, years in business (derived from the earliest record timestamp), and total revenue (sum of `deal_value` formatted as ₹L / ₹Cr).

**Property listings (`/properties`)** — `PublicPageController::properties` renders `public/Properties`. Supports the following query parameters:

| Filter | Behavior |
| --- | --- |
| `search` | Matches title / city / type (`LIKE`) |
| `type` | Exact match on `type` (`All` = no filter) |
| `status` | Exact match on `status` (`All` = no filter) |
| `bedrooms` | `>=` match when `> 0` |
| `min_price` / `max_price` | Range match on `price` |
| `sort` | `price_asc`, `price_desc`, `featured` (desc), default `newest` |

Pagination is 6 per page. Only `is_website_visible = true` listings are returned.

**Property detail (`/properties/{property}`)** — Loads `agent` and `images`. Returns 404 if the property is not website-visible (soft-404 behavior). Shows up to 3 **similar** properties of the same `type` (falls back to any 3 if none match). Exposes the property's agent (name, phone, email, role).

**About (`/about`) & Contact (`/contact`)** — About renders the agent list and hard-coded marketing stats. Contact is a static page with the enquiry form.

**Enquiry forms (rate-limited)** — Routes: `POST /contact/enquiry` and `POST /properties/{property}/enquiry`, both `throttle:5,10`. Each creates a `Lead` (`source = Website`, `status = New`, `score = 0`) and a **Note** activity *Website enquiry submitted* / logs the message into `requirements`. Property enquiries set `interested_property_id`. Validation: `name` and `phone` required, `email` (nullable, format), `message` (nullable).

### 5.2 Authentication, Profile & Password

- **Login** — `GET /login` renders the login page; `POST /login` authenticates, `throttle:5,1` (max 5 attempts/min). `POST /logout` logs out.
- **Password reset** — `GET /forgot-password` + `POST /forgot-password` (`throttle:5,1`) send a reset link. `GET /reset-password/{token}/{email?}` renders the reset form; `POST /reset-password` (`throttle:5,1`) performs the reset. Uses a custom `ResetPasswordNotification` carrying a URL to the Inertia reset page.
- **Profile & email change (OTP-verified)** — `GET/PUT /profile`, `PUT /password`. Changing email is a **three-step OTP flow** on both web and API:
  1. `POST /profile/email/otp` — sends an OTP to the current email.
  2. `POST /profile/email/verify-current` — verifies it (server always returns success to avoid email-enumeration).
  3. `POST /profile/email/new-otp` — sends an OTP to the new email.
  4. `POST /profile/email/verify-new` — verifies the new-email OTP and commits the change.
  - Implementation lives in `OtpService` (see §10 Security for limits).

### 5.3 Dashboard

Route: `GET /admin/dashboard` (`permission:dashboard.view`). `DashboardController::index` aggregates KPI cards, charts, and lists — e.g. total leads, deals by stage, pipeline value, recent leads/activities, site visits, payments — and renders `admin/Dashboard`. Sales roles see only their own data via the shared agent-scope helper. API mirror: `GET /api/dashboard`.

### 5.4 Leads

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

- **List / search** — Elastic-ish search on `name`, `phone`, `email` (`LIKE`), plus filters on `status`, `source`, `campaign`; 10 per page, newest first. **Agent scope**: Super Admins/Admins see all. Sales Executive / Senior Agent automatically see only leads where they are `assigned_agent_id` or `owner_id` (`applyAgentScope` / model `scopeVisibleTo`). The same rule is enforced on detail views (`authorizeLeadAccess` → 403).
- **Status lifecycle** — Valid statuses: `New, Contacted, Qualified, Site Visit Scheduled, Site Visit Completed, Negotiation, Converted, Lost`. Site visits are auto-created when a lead status becomes **Site Visit Scheduled** (once per lead — a `lead_id` exists check prevents duplicates). The visit date/time is parsed from `next_followup`, defaulting to tomorrow 10:00 AM. Each status change logs a **Status Change** activity and may trigger a `site_visit.scheduled` notification. Conversion is blocked for leads in `Converted` or `Lost`.
- **Activity timeline** — `POST /admin/leads/{lead}/activity` appends a `LeadActivity` row (type, title, description, duration, outcome, contact number, email subject, next follow-up, location). Logging an activity with `next_followup` also syncs the lead's follow-up task and updates `last_contact`.
- **Reassignment / handover** — `reassign` moves both `assigned_agent_id` and `owner_id`. If the assignee changed, a `LeadHandover` record is created (from, to, reason, notes) and a **Reassignment** activity logged.
- **Follow-up task sync** — Shared helper `syncFollowupTask`: parses `next_followup` into `(date, time)` using common formats (`Y-m-d`, `Y/m/d`, `d-m-Y`, `d/m/Y`, plus AM/PM or 24h times). If the raw value is empty, any open follow-up task is completed. Creates (`TSK-xxx`, title *Follow-up: {name}*, priority High, status Pending/Overdue) or updates the latest open follow-up task for the lead, assigned to the lead's agent.
- **CSV import** — `import` accepts `csv`/`txt`, max 2 MB, with optional campaign assignment: header auto-detection with **column aliases** (e.g., `name/full_name/lead_name`, `phone/mobile/contact_number`, `assigned_agent/agent/agent_name`, `interested_property/property` …). Falls back to sequential column mapping if no header is detected. Per-row validation: `name` + `phone` required; duplicate detection **within file** (by phone) and **against the DB** (phone, or name+phone). References (`interested_property`, `assigned_agent`) resolve by ID or by fuzzy name/title match (property title `LIKE`, agent name). `source`, `status`, `score` are normalized to allowed values / clamped 0–100. Runs in a transaction with rollback on failure; reports `X imported, Y skipped` with a per-row error list flashed to the session. Each row logs a **Lead Imported** activity and syncs a follow-up task when `next_followup` is present. `importTemplate` streams a CSV with headers and one example row.
- **Convert to deal** — `convertToDeal` runs inside a transaction, `lockForUpdate()` on the lead row (prevents double-conversion under concurrency): (1) Blocks if lead status is `Converted`/`Lost`. (2) Creates `Deal` (`DL-xxx`, customer = lead name, property = chosen or lead's `interested_property_id`, `stage = Qualified` (or provided), probability 30, `stage_changed_at = now`). (3) Sets lead `status = Converted`, logs a **Conversion** activity, notifies the lead's agent.

### 5.5 Sales Pipeline

- Kanban-style deal board with configurable stages (`New Lead → Contacted → Qualified → Property Shortlisted → Site Visit Scheduled → Site Visit Completed → Negotiation → Booking → Agreement → Payment → Closed Won / Closed Lost`).
- Days-in-stage tracking, close probability, assigned agent. New deals default to `stage = 'Qualified'` with `probability = 30`.

### 5.6 Properties

Routes gated by `permission:properties.view/create/edit/delete`.

- **Fields** (`Property` model + form): property ID, title, type (Apartment/Villa/Plot/Commercial/Office/Shop/Warehouse/Farm-Land), transaction type, description, status, price + price label (auto-formatted ₹L/₹Cr), area, bedrooms, bathrooms, floors, parking, furnishing, possession date, address/city/state/country/pincode, lat/long, amenities (JSON array), featured, website-visibility, SEO title/meta, slug, cover image.
- **Images**: multiple images per property (`PropertyImage` table) via `POST /admin/properties` (form data) and dedicated image endpoints in the API (store / delete / set cover). `coverOrImage()` returns the cover image, else the first image, else the raw `image` column.
- `featured` and `is_website_visible` toggles control what the public site shows.
- Detail view loads agent + images; soft-deleted properties are excluded from public listings.

### 5.7 Customers

Routes gated by `permission:customers.view/create/edit`. CRUD with detail view (`CustomerDetail.tsx`). Customers hold demographic + budget/notes info. Customers are not tied to a user typically; shared read access across sales & accountancy roles.

### 5.8 Site Visits

Routes gated by `permission:site_visits.*`.

- Auto-created when a lead is moved to *Site Visit Scheduled* (see §5.4); can also be created manually from the admin area.
- Fields: `visit_id` (`SV-xxx`), customer name, property name, agent name, `visit_date`, `visit_time`, `status`, location, notes, feedback.
- Statuses: `Scheduled, Confirmed, Completed, Cancelled, Rescheduled` (report groups `Scheduled`+`Confirmed` as scheduled).
- Linked to a lead via `lead_id` (added by later migration).

### 5.9 Bookings

Routes gated by `permission:bookings.*`.

- Captures the deal: `booking_id` (`BK-*` range), customer, property, agent, `booking_date`, `deal_value` + label, `booking_amount` + label.
- Three parallel status tracks:
  - `status` — booking lifecycle (default `Booking Pending`).
  - `agreement_status` — agreement progress (default `Pending`).
  - `possession_status` — possession progress (default `Pending`).
- API includes a delete route; web admin exposes index, show, store, update.

### 5.10 Payments

Routes gated by `permission:payments.*`.

- Fields: `payment_id`, customer, property, `amount` + label, `mode`, `txn_id`, `due_date`, `paid_date`, `status`.
- Statuses: `Pending, Paid, Overdue, Partially Paid` (report groups these three as "pending" when computing collection vs due).
- Payments are recorded manually — no gateway integration.

### 5.11 Tasks

Routes gated by `permission:tasks.*`.

- Tasks have title, description, `type` (e.g., **Follow-up**), priority, status (`Pending`, `Overdue`, `Completed`), `due_date`, `due_time`, `related_to`/`related_id`, `lead_id`, `assigned_to_id`, `created_by`.
- Follow-up tasks are generated automatically from lead `next_followup` values (see §5.4) and flagged overdue by `leads:check-followups`.

### 5.12 Notifications

Routes: `GET /admin/notifications`, `POST /admin/notifications/read-all`, `PUT /admin/notifications/{notification}/read` (all authenticated users, no permission gate).

- Rows: `user_id`, `title`, `message`, `type` (`followup`, `lead.converted`, `site_visit.scheduled`, …), `related_id`, `is_read`, `is_seen`.
- The follow-up automation creates `followup` notifications with a 12-hour de-duplication window (no duplicate unread notification for the same lead within 12h).
- Frontend polls/unreads via the API; the nav badge reflects unread count.

### 5.13 Marketing / Campaigns

Routes gated by `permission:marketing.*`.

- Campaign fields: name, channel (e.g., Facebook, Instagram, Google), budget, spent, leads count, conversions, revenue, ROI, status, `start_date`, `end_date`.
- Leads can carry a `campaign_id` (assigned at creation or via import), letting teams attribute leads to campaigns.

### 5.14 Media Center

Routes gated by `permission:media.*`.

- Centralized file management: upload, list, delete (`MediaFile` rows; soft-deleted).
- Files stored on the app's configured disk (public by default for web-accessible media).

### 5.15 Reports

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

### 5.16 CMS

Routes gated by `permission:cms.view/cms.edit`.

- `PUT /admin/cms/featured` — pick featured properties (via `updateFeatured`).
- `PUT /admin/cms/{section}` — edit a site content section (hero, about, contact text, etc.).
- The public site renders CMS values where wired (featured listings on Home, section content on About/Contact).

### 5.17 Settings

Routes gated by `permission:settings.view/settings.edit`; SMTP/logo routes additionally require the `super-admin` **role**.

`SettingController` holds a `$defaults` map (project name, tagline, contact info, currency, timezone, colors, social links, office hours, SEO defaults, analytics code, feature toggles such as `enable_contact_form`, `maintenance_mode`, `lead_auto_assign`, `visit_reminders`, `payment_alerts`). `Setting::allAsArray()` merges saved values over defaults.

- **Update** filters incoming fields against the caller's **field-level permissions** (`settings.edit.<key>`), so a user with limited permissions can only change allowed keys.
- **Logo** upload (`POST /admin/settings/logo`) stores to the public disk under `settings/`, saves `logo_url`; deletion removes the file safely (only inside the `settings/` prefix) and resets the value. Super-admin only.
- **SMTP** (`PUT /admin/settings/smtp`) — super-admin only. See `MailConfigService` (§7.3): masked password preserved when empty/`********`; runtime mailer config applied on demand (`applyForEmailSending`), degrading to the `log` mailer when disabled.
- **Test mail** (`POST /admin/settings/test-mail`) — super-admin only; sends a raw SMTP test to the configured `test_email` or a provided recipient and reports success/error.

### 5.18 Users

Routes gated by `permission:users.*`. Fields: name, email, password (hashed), phone, `role` (display), `branch`, `status`, `avatar`, `last_login_at`. List/detail with role attribution; store/update/destroy for admins.

### 5.19 Roles & Permissions

Web: `GET /admin/roles`, `/admin/permissions`, `POST/PUT/DELETE /admin/roles` (gated by `roles.*`). API mirrors these. See §6 Roles, Permissions & Data Access.

### 5.20 API (mobile/integration)

`routes/api.php` exposes the same modules under `/api` behind `auth:sanctum`:

- Auth: login, reset link, me, logout, profile, password, email-OTP flow.
- Dashboard, notifications; full CRUD for properties (incl. image management), leads (incl. import template/import/convert/activities), pipeline deals (incl. move stage), customers, site visits, tasks, bookings, payments, media, campaigns, reports (export/export-pdf), CMS, users, roles/permissions, settings (incl. SMTP test).
- All permission-gated identically to the web routes.

---

## 6. Roles, Permissions & Data Access

QREX implements a **custom role-based access control (RBAC)** system. It is not Spatie; roles and permissions are plain Eloquent models with pivot tables seeded by `RolesAndPermissionsSeeder`.

### 6.1 Model

| Table | Purpose |
| --- | --- |
| `roles` | Role definitions: `name`, `slug`, `description`, `is_system` |
| `permissions` | Permission definitions: `name`, `slug`, `module`, `action`, `field`, `description` |
| `role_has_permissions` | Many-to-many role ↔ permission |
| `model_has_roles` | Morph-many user ↔ role (polymorphic, model-aware) |

`User` helper methods (see `app/Models/User.php`):

- `isSuperAdmin()`, `hasRole(slug)`, `hasAnyRole([...])`
- `hasPermissionTo(slug)`, `hasAnyPermission([...])`, `getAllPermissions()`, `getPermissionSlugs()`
- `canAccessModule(module)` — true if the user has a `<module>.view` permission
- Per-user permission cache keyed by user id (reset per request in the app cache)

### 6.2 Permission Structure

Permissions are generated from **16 modules** and their actions:

| Module | Actions |
| --- | --- |
| `dashboard` | view |
| `properties` | view, create, edit, delete, export |
| `leads` | view, create, edit, delete, export |
| `customers` | view, create, edit, delete, export |
| `sales` | view, create, edit, delete, export |
| `tasks` | view, create, edit, delete |
| `site_visits` | view, create, edit, delete |
| `bookings` | view, create, edit, delete, approve |
| `payments` | view, create, edit, delete, export |
| `media` | view, create, delete |
| `marketing` | view, create, edit, delete, export |
| `reports` | view, export |
| `cms` | view, create, edit, delete |
| `users` | view, create, edit, delete |
| `settings` | view, edit |
| `roles` | view, create, edit, delete |

The slug convention is `{module}.{action}` (e.g., `leads.view`, `properties.create`).

### 6.3 Field-Level Permissions

For actions that touch record fields, additional permissions are seeded as `{module}.{action}.{field}`:

- `properties.edit.{price,title,status,description,area,bedrooms,bathrooms,amenities,featured,agent}`
- `leads.edit.{name,phone,email,source,status,budget,assigned_agent,score}`
- `customers.edit.{name,phone,email,type,budget,notes}`
- `tasks.edit.{title,status,priority,due_date,assigned_to}`
- `site_visits.edit.{date,time,status,feedback,notes}`
- `bookings.edit.{amount,status,payment_mode,notes}`
- `payments.edit.{amount,status,mode,date,notes}`
- `marketing.edit.{name,budget,status,channels,content}`
- `settings.edit.{project_name,agency_name,contact_email,contact_phone,address,tagline,logo}`
- `users.edit.{name,email,phone,role,branch,status,password}`
- `cms.edit.{content,featured,seo}`

Notable enforcement points:

- **Settings** (`SettingController::update`) filters each requested key by `settings.edit.<key>` so a partially-permitted user can only modify allowed settings.
- Other modules expose the permission set to the frontend (via `PermissionPayloadService`) so the UI can hide/disable controls the user cannot use; server-side route middleware is the authoritative gate.

### 6.4 Seeded Roles

| Role | slug | Permissions summary |
| --- | --- | --- |
| **Super Admin** | `super-admin` | All permissions (every module × action × field) |
| **Admin** | `admin` | All permissions except `settings.edit.project_name` and `roles.delete` |
| **Sales Executive** | `sales-executive` | dashboard, properties (view/create/edit), leads (view/create/edit + edit fields), customers (view/create/edit), tasks (view/create/edit), site visits (view/create/edit), media (view/create), reports (view) |
| **Senior Agent** | `senior-agent` | Sales Executive + `sales.view/create/edit` (pipeline) |
| **Marketing User** | `marketing-user` | dashboard, leads (view/create), marketing (view/create/edit), media (view/create), cms (view/create/edit), reports (view/export) |
| **Accountant** | `accountant` | dashboard, customers (view), sales (view), bookings (view/create/edit), payments (view/create/edit), reports (view/export), media (view) |

`roles.delete` is a true system-safety valve: even `admin` cannot delete roles, only super-admin can.

SMTP settings, logo management, and test-mail endpoints are further gated by the `super-admin` **role** (`role:super-admin` middleware) in addition to permissions.

### 6.5 Route-Level Enforcement

Web routes apply middleware per route group, e.g.:

```php
Route::middleware('permission:leads.edit')->group(function () {
    Route::put('/leads/{lead}', ...);            // leads.update
    Route::post('/leads/{lead}/reassign', ...);  // leads.reassign
    Route::post('/leads/{lead}/status', ...);    // leads.status
});
```

Each controller method also performs its own access checks where data-level restrictions apply (see below). The API uses the exact same `permission:` middleware on its routes.

### 6.6 Data-Level Scoping

Beyond action permissions, **row-level scoping** limits what agents see (but not what admins see).

`Lead::scopeVisibleTo($user)` / `LeadController::applyAgentScope`:

- Super Admin or role `admin` → no restriction.
- `sales-executive` or `senior-agent` → only leads where `assigned_agent_id = user.id` **or** `owner_id = user.id`.

`LeadController::authorizeLeadAccess` (used on show/update/reassign/status/activity/convert) aborts `403` if a scoped user accesses a lead they don't own or are not assigned.

Reports reuse `visibleTo` so agents' reports are limited to their own leads, while admins see the full picture.

### 6.7 Frontend Integration

`PermissionPayloadService` builds the user's permission slugs into Inertia props. The React admin layout uses them to:

- Show/hide navigation items per module.
- Disable or hide create/edit/delete actions the user cannot perform.
- Respect field-level permissions when rendering forms (e.g., Settings page hides fields the user may not edit).

---

## 7. Technology & Architecture

### 7.1 Technology Stack

**Backend (Laravel 13, PHP ^8.3)**

| Component | Purpose |
| --- | --- |
| [Laravel](https://laravel.com) 13 | Application framework, Eloquent ORM, routing, queues, validation, auth |
| [Inertia](https://inertiajs.com) 3 | Server-driven React rendering; controllers return page props instead of HTML strings |
| [Laravel Sanctum](https://laravel.com/docs/sanctum) 4 | API token authentication for `/api/*` routes |
| [barryvdh/laravel-dompdf](https://github.com/barryvdh/laravel-dompdf) 3 | PDF export for reports |
| [Laravel Tinker](https://github.com/laravel/tinker) | REPL for debugging / scripting |
| [Laravel Pint](https://laravel.com/docs/pint) | Code style tool (dev) |
| [PHPUnit](https://phpunit.de) 12 | Testing framework (dev) |
| [Laravel Pail](https://github.com/laravel/pail) 1 | Tail-style log viewer (dev) |

**Frontend**

| Component | Purpose |
| --- | --- |
| [React](https://react.dev) 19 | UI rendering |
| [TypeScript](https://www.typescriptlang.org) | Typed frontend code |
| [Tailwind CSS](https://tailwindcss.com) 4 | Styling |
| [Vite](https://vite.dev) 8 | Build tool & dev server |
| [Recharts](https://recharts.org) | Dashboard/report charts |
| [lucide-react](https://lucide.dev) | Icons |

**Why this stack:** server-rendered React pages are fast and SEO-friendly for the public site; a single PHP codebase keeps the platform inexpensive to host and maintain; the API keeps the platform ready for mobile & partner integrations.

### 7.2 Repository Layout

```
├── app/
│   ├── Console/Commands/        # Artisan commands (e.g. CheckFollowups)
│   ├── Http/
│   │   ├── Controllers/         # Web controllers
│   │   └── Controllers/Api/     # Sanctum API controllers
│   ├── Mail/                    # Mailable classes (email OTP, password reset)
│   ├── Models/                  # Eloquent models (19 models)
│   ├── Notifications/           # Laravel notifications
│   ├── Providers/               # Service providers
│   └── Services/                # Business services (ID gen, OTP, mail config, permission payload)
├── bootstrap/
├── config/                      # Laravel config files
├── database/
│   ├── factories/               # Model factories
│   ├── migrations/              # 33 migrations incl. schema + data migrations
│   └── seeders/                 # 10 seeders for roles, users, and demo data
├── public/                      # Web root (index.php, built assets)
├── resources/
│   ├── js/                      # React + TypeScript frontend (Inertia pages)
│   ├── views/                   # Blade layouts (app shell, exports/report.blade.php)
│   └── css/
├── routes/                      # web.php, api.php, console.php
├── tests/                       # PHPUnit tests
└── package.json, composer.json, vite.config.js
```

### 7.3 Services

| Service | Location | Responsibility |
| --- | --- | --- |
| `IdGenerator` | `app/Services/IdGenerator.php` | Generates collision-free human-readable IDs (`L-001`, `DL-012`) using the auto-increment `sequences` table |
| `OtpService` | `app/Services/OtpService.php` | Email OTP generate/send/verify with TTL (10 min), resend cooldown (60 s), max attempts (5), rate limiting |
| `MailConfigService` | `app/Services/MailConfigService.php` | Reads/saves SMTP settings from the `settings` table, applies them to the mailer config at runtime, sends a test email, preserves masked passwords |
| `PermissionPayloadService` | `app/Services/PermissionPayloadService.php` | Builds permission payloads for the frontend (nav visibility, ability checks) |

### 7.4 Console Commands

| Command | Purpose | Scheduling |
| --- | --- | --- |
| `php artisan leads:check-followups` | Finds due/overdue `Follow-up` tasks and creates in-app notifications for assigned agents (12-hour dedupe) | Should be scheduled (e.g., daily); command is idempotent |

### 7.5 Record ID Generation

Human-readable record IDs are generated from the `sequences` table:

```
L-006   Lead       (LeadController::nextId('L'))
DL-012  Deal       (LeadController::nextId('DL'))
TSK-007 Task       (LeadController::nextId('TSK'))
SV-003  Site visit (LeadController::nextId('SV'))
```

`IdGenerator::next($prefix)` inserts a row into `sequences` and returns `PREFIX-NNN`, where `NNN` is the auto-incrementing ID zero-padded to 3 digits. This guarantees uniqueness even under concurrency (no two requests can produce the same ID).

### 7.6 Notification Strategy

- There is a custom `notifications` table (user-scoped rows with `title`, `message`, `type`, `related_id`, `is_read`, `is_seen`).
- Notifications are created by the application (e.g., lead conversion, site-visit scheduling, follow-up reminders) as DB rows, not via the framework's default table.
- The frontend reads them via `/admin/notifications` and can mark single or all as read.
- Laravel `Notification` classes are used for email (password reset) and OTP delivery.

### 7.7 Request Flow

1. A browser hits a route (`routes/web.php`) → the web middleware stack runs.
2. For admin routes, `auth` + `permission:` middleware gates access before the controller runs.
3. The controller queries models, computes page props, and returns `Inertia::render('admin/Leads', [...])`.
4. Inertia resolves the matching React component in `resources/js/pages/`, merges the props, and swaps the page client-side (no full reload).
5. Mutations POST/PUT/DELETE back to the same routes; controllers validate, mutate, and `back()` with a flash message rendered by the frontend.
6. The mobile/JSON API mirrors these operations through Sanctum-authenticated controllers in `routes/api.php`.

---

## 8. Database Schema

All entities are created via Eloquent migrations in `database/migrations/`. Unless noted, tables use `StringField`s (Laravel 13 native string columns) and standard `timestamps()`.

### 8.1 Entity List

| Entity | Table | Notes |
| --- | --- | --- |
| User | `users` | + profile fields (phone, role, branch, status, avatar, last_login_at) |
| Role | `roles` | name, slug, description, is_system |
| Permission | `permissions` | name, slug, module, action, field, description |
| Role↔Permission | `role_has_permissions` | pivot |
| User↔Role | `model_has_roles` | polymorphic morph pivot (`model_type`, `model_id`) |
| Property | `properties` | soft deletes; `property_id` unique readable ID |
| Property Image | `property_images` | per-property gallery; `is_cover` flag |
| Lead | `leads` | soft deletes; `lead_id` unique; source/status strings; extended columns (created_by, campaign_id, owner_id) |
| Lead Activity | `lead_activities` | timeline; `type`, `title`, `description`, communication fields (duration, outcome, contact_number, email_subject, next_followup, location) |
| Lead Handover | `lead_handovers` | from_user_id, to_user_id, reason, notes |
| Deal | `deals` | soft deletes; `deal_id` unique; stage/probability/days_in_stage + stage_changed_at |
| Customer | `customers` | soft deletes |
| Site Visit | `site_visits` | soft deletes; `visit_id` unique; lead_id (via later migration) |
| Booking | `bookings` | soft deletes; `booking_id` unique; status/agreement_status/possession_status |
| Payment | `payments` | soft deletes; `payment_id` unique; status/due/paid dates |
| Campaign | `campaigns` | marketing campaigns |
| Media File | `media_files` | soft deletes |
| Notification | `notifications` | custom user-scoped notifications (not the framework's default) |
| Task | `tasks` | follow-ups & to-dos; `task_id` unique; lead_id, assigned_to_id |
| Setting | `settings` | `key`/`value`/`group` key-value store |
| Email OTP | `email_otps` | user_id, email, purpose, new_email, hashed code, expires_at, used_at |
| Sequence | `sequences` | prefix, context — backing the readable-ID generator |
| Personal access token | `personal_access_tokens` | Laravel Sanctum tokens |
| Cache, jobs, job batches, sessions | framework tables | default Laravel |

### 8.2 Key Relationships

```
User ──< Lead (assigned_agent_id / owner_id / created_by / agent as User)
User ──< Property (agent_id)
Property ──< PropertyImage
Property ──< Lead (interested_property_id)
Lead ──< LeadActivity ──< User
Lead ──< LeadHandover ──< User (from_user_id / to_user_id)
Lead ──0..1 Deal (lead_id)
Deal ──< Property (property_id)
Deal ──< User (assigned_agent_id)
Lead ──< Campaign (campaign_id)
SiteVisit ──< Lead (lead_id)
Task ──< Lead (lead_id) ──< User (assigned_to_id / created_by)
User >--< Role >--< Permission           (role_has_permissions, model_has_roles)
User ──< Notification
User ──< EmailOtp
```

### 8.3 Status Enums / Value Sets

**Lead status** — `New, Contacted, Qualified, Site Visit Scheduled, Site Visit Completed, Negotiation, Converted, Lost`

**Lead source** — `Website, Facebook, Instagram, Google, Referral, Walk-in, Phone, WhatsApp, Campaign`

**Deal stages (canonical pipeline order)** — `New Lead → Contacted → Qualified → Property Shortlisted → Site Visit Scheduled → Site Visit Completed → Negotiation → Booking → Agreement → Payment → Closed Won / Closed Lost`. New deals default to `stage = 'Qualified'` with `probability = 30`. `stage_changed_at` records when a stage was last changed; `days_in_stage` is derived as the difference between now and `stage_changed_at`.

**Booking statuses** — `status`: `Booking Pending`, `Confirmed`, etc. (default `Booking Pending`); `agreement_status`: default `Pending`; `possession_status`: default `Pending`.

**Payment status** — `Pending, Paid, Overdue, Partially Paid` (report treats Pending/Overdue/Partially Paid as outstanding).

**Site visit status** — `Scheduled, Confirmed, Completed, Cancelled, Rescheduled`.

**Task type / status** — `type`: e.g., `Follow-up`, general to-dos; `status`: `Pending, Overdue, Completed`; priority: e.g., `High`, `Medium`, `Low`.

**Property flags** — `type`: Apartment, Villa, Plot, Commercial, Office, Shop, Warehouse, Farm/Land; `featured` (bool), `is_website_visible` (bool), `transaction_type`, `status`; `amenities` stored as a JSON array cast; `price`/`area` as decimal(15,2)/decimal casts.

### 8.4 Soft Deletes & Data Retention

Primary business entities are **soft-deleted** so records remain queryable and reportable after deletion: `leads, properties, customers, deals, bookings, payments, site_visits, media_files` (plus `roles`/`permissions` force-deleted only during seeding).

### 8.5 Indexes (enterprise hardening migration)

Hot query paths are indexed:

- `leads(branch: phone, status, source, assigned_agent_id, created_at)`
- `deals(stage, assigned_agent_id, lead_id)`
- `payments(status, due_date)`
- `bookings(status, booking_date)`
- `site_visits(status, lead_id, visit_date)`
- `tasks(lead_id, status, assigned_to_id)`
- `notifications(user_id, is_read, created_at)`
- `lead_activities(lead_id)`
- `property_images(property_id)`

### 8.6 `sequences` Table (readable ID generation)

`IdGenerator::next('L')` inserts `{prefix: 'L', context: ''}` and returns `L-<zero-padded id>`:

```
L-006    →  Lead
DL-012   →  Deal
TSK-007  →  Task
SV-003   →  Site visit
```

Other record-prefixing modules may reuse the same generator with their own prefixes (e.g., bookings/payments), using the same collision-free mechanism. Concurrency is safe because uniqueness derives from the auto-increment primary key, never from a read-then-write race.

### 8.7 Settings Key Store

`Setting` is a generic `key`/`value`/`group` store. Key groups include `general`, `branding`, and `smtp_*` (e.g., `smtp_enabled`, `smtp_host`, `smtp_port`, `smtp_username`, `smtp_password`, `smtp_encryption`, `smtp_from_address`, `smtp_from_name`, `smtp_test_email`). `Setting::allAsArray()` returns saved values; controllers merge over their defaults.

---

## 9. Operations & Deployment

### 9.1 Prerequisites

- PHP ^8.3 (with required extensions for Laravel 13)
- [Composer](https://getcomposer.org)
- Node.js & npm
- A database driver supported by Laravel (SQLite for local dev, MySQL/PostgreSQL for production)

### 9.2 Installation

**Quick setup:**

```bash
composer setup
```

`composer setup` performs, in order:

1. `composer install`
2. Creates `.env` from `.env.example` (if absent)
3. Generates the application key
4. Runs `php artisan migrate --force`
5. `npm install --ignore-scripts`
6. `npm run build`

**Manual setup:**

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run build
```

### 9.3 Seeding (optional demo/initial data)

```bash
php artisan db:seed
```

`DatabaseSeeder` runs these seeders in order:

| Seeder | Purpose |
| --- | --- |
| `RolesAndPermissionsSeeder` | Wipes roles/permissions, recreates 16 module sets + 6 roles |
| `UsersTableSeeder` | Default users incl. a root admin (check seeder for credentials) and agent/role users |
| `PropertiesTableSeeder` | Demo property listings with images |
| `LeadsTableSeeder` | Demo leads with activities, handovers, follow-ups |
| `DealsTableSeeder` | Demo deals across pipeline stages |
| `CustomersTableSeeder` | Demo customer records |
| `OpsTableSeeder` | Site visits, bookings, payments |
| `MarketingMediaSeeder` | Campaigns + media files |
| `TasksTableSeeder` | Follow-up and general tasks |

### 9.4 Running

Development (two terminals):

```bash
php artisan serve        # terminal 1 — web server on http://localhost:8000
npm run dev              # terminal 2 — Vite HMR for the React frontend
```

Production-like:

```bash
npm run build
php artisan serve        # or configure a web server / PHP-FPM to serve public/
```

### 9.5 Public URLs

| URL | Purpose |
| --- | --- |
| `http://localhost:8000/` | Public website home |
| `http://localhost:8000/properties` | Property listings |
| `http://localhost:8000/login` | Admin login |
| `http://localhost:8000/admin/dashboard` | CRM dashboard |

### 9.6 Scheduled Automation

**Follow-up checker** — flags overdue/due-today follow-up tasks and notifies agents:

```bash
php artisan leads:check-followups
```

Behavior (see `app/Console/Commands/CheckFollowups.php`):

- Selects all tasks with `type = Follow-up`, `status != Completed`, `due_date <= today`.
- Marks tasks with `due_date < today` as `Overdue`.
- Notifies the assigned agent (12-hour de-duplication per lead) with *Follow-up due today* / *Follow-up overdue* messages.
- Recommend scheduling it daily; it is idempotent.

Schedule it via Laravel's scheduler (`routes/console.php` / `app/Console/Kernel`) or cron, e.g.:

```cron
0 9 * * * cd /path/to/app && php artisan leads:check-followups >> /dev/null 2>&1
```

### 9.7 Maintenance / Housekeeping

- `php artisan migrate` — apply schema changes.
- `php artisan storage:link` — link public storage for uploads (logo, media).
- `php artisan config:clear` — clear cached config after deployment.
- `npm run build` — rebuild production assets after frontend changes.

### 9.8 SMTP / Email Operations

Email configuration is stored in the database (`settings` table, `smtp_*` keys) and managed by super-admins from the Settings page — **not** `.env`. `MailConfigService`:

- Reads SMTP settings (enabled, host, port, username, password, encryption, from address/name, test email).
- When enabled and `applyForEmailSending()` is called, applies them to the mailer at runtime. When disabled, the mailer falls back to `log` (safe default — emails are written to `storage/logs/laravel.log`).
- Test mail: `POST /admin/settings/test-mail` (super-admin only) sends a raw test message to the configured `test_email` or a provided recipient.
- Saving never overwrites an existing password when the form submits the masked value.

### 9.9 Testing

```bash
composer test
```

Runs the PHPUnit suite via `php artisan test`. The suite covers the web routes/controllers and command behavior.

### 9.10 Code Style

```bash
vendor/bin/pint --test     # check style
vendor/bin/pint            # fix style
```

The project uses [Laravel Pint](https://laravel.com/docs/pint) (PSR-12-based preset) as configured in `pint.json`/defaults.

### 9.11 Common Troubleshooting

| Symptom | Likely fix |
| --- | --- |
| `key already exists` / JWT-ish errors on login | Not applicable (session auth) — check session table + `SESSION_DRIVER` |
| 419 page expired | Session lifetime too short / CSRF on long-running forms |
| Emails not arriving | Check Settings → SMTP (enabled + host/port); if disabled, mail is written to the app log instead |
| `Permission does not exist` 403s | Seeder not run (`php artisan db:seed`) or user missing role |
| OTP "too many attempts" | Wait for the attempt window to clear or run `OtpService::forgetAttempts` |
| Public property 404 | `is_website_visible` is false on that listing |

### 9.12 Deployment Model

- **Cloud-ready** deployment (production server or your own infra), with a documented operations guide: install, migrate, seed, scheduled automation, backup, and SMTP setup.
- **Scheduled automation** runs daily (follow-up checker).
- **Managed migration** of your existing leads/properties from spreadsheets or a legacy CRM via the CSV import pipeline.
- Optional **on-premise** deployment for enterprises with strict data-residency needs.

---

## 10. Security & Hardening

QREX applies defense-in-depth across authentication, authorization, rate limiting, and export safety.

### 10.1 Authentication

- Admin uses session-based auth (`auth` middleware).
- The JSON API uses **Laravel Sanctum** tokens (`auth:sanctum`) — tokens stored hashed in `personal_access_tokens`. Create tokens on login, revoke on logout.
- Passwords are stored with Laravel's default `bcrypt`/`argon` hashing (`'password' => 'hashed'` cast).
- Login throttled: `throttle:5,1` (5 attempts per minute).
- Password reset links are emailed with a custom `ResetPasswordNotification`; forgot/reset endpoints are throttled (`throttle:5,1`).

### 10.2 Rate Limiting

| Endpoint | Limit |
| --- | --- |
| `POST /login` | 5 per minute |
| `POST /forgot-password`, `POST /reset-password` | 5 per minute |
| `POST /contact/enquiry` | 5 per 10 minutes |
| `POST /properties/{property}/enquiry` | 5 per 10 minutes |
| Email OTP send/verify (per user+purpose) | see below |

### 10.3 Email OTP Flow (profile email changes)

`OtpService` enforces strict rules for the email-change flow:

- OTP is a random 6-digit code, stored **hashed** (`Hash::make`), single-use (`used_at`).
- **TTL**: 10 minutes.
- **Resend cooldown**: 60 seconds.
- **Verification attempts**: max 5 per user+purpose; exceeding throws *"Too many verification attempts…"*.
- Server always returns the same response for "correct" and "incorrect" code to prevent **email-enumeration** during current-email verification.

### 10.4 Authorization (RBAC)

- Route-level `permission:` middleware for every module action (see §6).
- Controller-level access checks on scoped data (lead ownership vs admin) — 403 on unauthorized access.
- Field-level permission checks (e.g., Settings page keys).
- Role-only gates for destructive/system config: `role:super-admin` on SMTP update, test mail, logo upload/remove; `roles.delete` excludes even `admin`.
- CSRF protection automatically enabled on web routes (Laravel default).

### 10.5 Data Exposure Control

- `Lead::scopeVisibleTo` restricts lead lists, reports, and detail views for `sales-executive` / `senior-agent`.
- Soft deletes preserve data (see §8.4) and public web queries filter `is_website_visible` consistently — hidden properties return 404 on the public site.
- API mirrors the same permission middleware as web routes.

### 10.6 CSV & Reporting Safety

- **Formula injection protection** (`ReportController::escapeCsvRow`): string values starting with `= + - @ \t \r` are prefixed with a single quote before being written into CSV — prevents spreadsheet formula execution from exported report data.
- Export type is validated against an allow-list (`revenue, leads, payments, agents, properties, sitevisits, campaigns, bookings`); unknown types fall back to `revenue`.
- Export responses set `Cache-Control: no-store` and `Content-Disposition: attachment`.
- Lead CSV import accepts only `csv`/`txt` ≤ 2 MB, normalizes/validates every row, dedupes within-file and against the DB, and runs in a transaction with rollback.

### 10.7 Secrets & Configuration

- `.env` is git-ignored; `.env.example` holds placeholders only.
- SMTP credentials live in the `settings` table; the API masks the password (`********`) in read responses and never overwrites a stored password on save unless a real new one is submitted.
- No secrets appear in frontend props; permission payloads exclude sensitive data.

### 10.8 Idempotency / Concurrency Guards

- **Lead → deal conversion** uses `lockForUpdate()` on the lead row inside a transaction, so a concurrent double-submit cannot create duplicate deals.
- **Readable IDs** rely on `sequences` auto-increment (no read-modify-write race).
- **Site-visit auto-creation** checks for an existing `lead_id` visit before creating.

### 10.9 Summary of Hardening Migration

Deployed with the enterprise-hardening migration: rich indexes on hot query paths, `stage_changed_at` for stage analytics, and consistent soft deletes across primary entities — supporting reliable, indexed, and auditable reads at team scale.

---

## 11. Methodology Note

This proposal was informed by:

1. **Independent market research** — global & India real estate CRM/sector reports (see §12 and Appendix A for sources).
2. **Primary product evidence** — the QREX codebase (routes, controllers, models, migrations, services, frontend).
3. **Industry adoption research** — NAR Technology Surveys, brokerage technology surveys (T3 Sixty, TotalBrokerage), CRM sales research (Salesforce, HubSpot, SugarCRM), and academic response-time studies (MIT/InsideSales).

Every statistic below carries its source. Nothing is fabricated.

---

## 12. Market Research

### 12.1 Global Real Estate CRM Market

| Indicator | Value | Source |
| --- | --- | --- |
| Global real estate CRM software market, 2026 | **US$ 5.58 B** (est. US$ 5.31 B) | Morgan Reed Insights; Business Research Insights |
| Forecast, 2035 | **US$ 14.98–16.51 B** | Business Research Insights; Morgan Reed Insights |
| CAGR (2026–2035) | **12.2–12.8%** | Same sources |

The fastest-growing real estate software segment is disorganized — a handful of fragmented specialists (US-centric) and generic enterprise CRMs that real-estate agents don't use. Our research review found **no India-native, end-to-end website + CRM + operations platform** that addresses the industry's core adoption problem (see §12.3), which is a market gap QREX targets directly.

### 12.2 India Market Context

| Indicator | Value | Source |
| --- | --- | --- |
| India real estate sector size | **~₹23.5 lakh crore**, **7.1% of GDP** | CREDAI–Liases Foras, CY2025 Report |
| Primary developer-market sales (2025) | **₹8.46 lakh crore**, **+16% YoY**; 6,14,218 units | CREDAI–Liases Foras |
| Premium segment share of sales value (₹1 Cr+) | **78%** | CREDAI–Liases Foras |
| India real estate market (2026 → 2031) | **US$ 585 B → US$ 927 B**, 9.63% CAGR | Mordor Intelligence |
| Residential share of market | **70.1%** | Mordor Intelligence |
| Mumbai Metropolitan Region revenue share | **28.4%** (largest) | Mordor Intelligence |
| Registered residential transactions 2025 | **5.45 lakh units** (−5% vol), **₹4.46 lakh crore** (+11% value), avg deal **₹0.81 Cr** (+22%) | SquareYards, 2025 Recap / 2026 Outlook |

**Outlook:** 2026 spending is shifting to the **mid-segment (₹80 L–₹1.5 Cr)**, with sales volumes steadying but ticket sizes and total value still rising. Agencies that respond fast, follow-up systematically, and prove their ROI with data will capture the value-led demand — exactly what QREX enables.

### 12.3 The Agency Problem (Why Deals Are Lost)

The market research consistently identifies **four structural reasons** agencies leak revenue:

**1. Slow response to leads.** Lead-response speed is the single highest-leverage metric in real estate.

- Average agent response to a new lead: **~15 hours** (Inman, 2025 Real Estate Technology Survey).
- Contact within **5 minutes** → leads are **21× more likely to qualify**; within 1 minute → **391% better contact rate** than at 2 minutes (MIT/InsideSales.com; Velocify).
- **78% of buyers work with the first agent who responds** (NAR Profile of Home Buyers & Sellers).
- Delta for an agency generating ~50 paid leads/month: **₹– … lakh to ₹– lakh per year in lost commissions** (see ROI model, §17).

**2. CRM underuse.** The tools exist; the habit doesn't.

- Only ~**30% of agents use a CRM consistently**; **72.5% of companies own one** (NAR 2025 Tech Survey; Software Advice 2024).
- Of agents, **45%** manage leads in a CRM consistently; **26%** use spreadsheets, **15%** email folders, **14%** no system (Inside Real Estate, Agent Technology Report 2024).
- **83% of executives** call staff CRM adoption their biggest technology challenge (Really Simple Systems).

**3. Friction & fragmentation.** Agents abandon tools that demand effort and don't return value.

- CRM data entry consumes **~4.5 hours/week**; salespeople spend only **28–30% of their week selling** (Salesforce, 2024 State of Sales).
- **76%** of CRM users cite complexity as their primary frustration (SugarCRM).
- **68% of sellers** call data entry their most time-consuming task; only **2% trust the data they enter** (2024 industry survey).
- **68% of brokerages** have CRM adoption **below 50%**; the average brokerage runs **20+ disconnected tools** (T3 Sixty / TotalBrokerage 2023–24).

**4. Follow-up dies.** The pipeline doesn't leak at the top — it leaks at the follow-up.

- **87% of deals are lost to follow-up that fades** (SureSend 2026).
- **80% of new leads never convert without ongoing nurturing**; most need **8–12 touchpoints** (MarketingSherpa).
- The average buyer researches for **~10 weeks** and **97% start online** (NAR), so a tool that tracks and reminds follow-ups is worth more than a tool that only stores contacts.

### 12.4 What Agencies Actually Need

Most-used → most-skipped CRM features (Capterra CRM User Behavior Survey 2024):

| Feature | Usage |
| --- | --- |
| Contact management | 94% |
| Email integration | 89% |
| Task management | 82% |
| Pipeline tracking | 78% |
| Automated workflows | 61% |
| **Reporting / analytics** | **48%** (least used, most valuable) |

The most-requested features in real-estate CRMs: **MLS/IDX-style listing integration, automated drip/follow-up, transaction management** — the operational layer, not just a contact book (industry feature-request research).

### 12.5 India Market & Pricing Benchmarks

**India real-estate CRM price benchmarks (per user / per month):**

| Platform | Entry price | Typical plan | Source |
| --- | --- | --- | --- |
| ClosingFox (India) | ₹499/u | ₹699/u (Growth), ₹1,499/u (Developer/Mandate) | ClosingFox pricing, Apr 2026 |
| TeleCRM (India) | ₹799/u (annual) | ₹1,049/u (quarterly) | TeleCRM pricing, Apr 2026 |
| Realatic (India) | ₹0 (3 users) | ₹499/u (Pro) | Realatic pricing |
| Zoho CRM | ₹800/u | ₹1,400/u (Professional) | Zoho pricing, 2026 |
| Kylas | ₹1,999 flat (unlimited users) | flat | Kylas pricing |
| Salesforce | ₹2,075/u | ₹5,500+/u | Salesforce pricing |
| Follow Up Boss (US) | $69/u | $499/mo (10 users), $1,000/mo (30 users) | FUB pricing, 2026 |
| BoomTown (US) | quote | ~$1,000–3,000+/mo | Third-party estimates |

**Takeaways for pricing design:**

- The Indian mid-market clears **₹500–1,500 per user/month**; **₹1,999 flat** (Kylas) is the disruptive low-anchor for small teams.
- US platforms price per-seat ($69/seat) or flat bundles with seats included ($499/10); effective per-seat cost drops with team size — a useful pattern to copy.
- **No India-native player sells an integrated public website + CRM + site-visit/booking/payment operations + platform management as one product.** QREX can price per-agency (not just per-seat), justified by the consolidated value.

**India SaaS operating-cost benchmarks (2026):**

| Item | Typical range/month | Source |
| --- | --- | --- |
| Hosting (early-stage VPS, 4 vCPU/8 GB) | ₹5,000–8,000 | ZenoCloud; ZoopCoder |
| Infra at seed stage (50–500 users) | ₹15,000–30,000 | ZenoCloud |
| Transactional email / SMS | ₹500–3,000 | ZoopCoder / Jaison Christopher |
| Payment gateway | ~1.9–2% per transaction | Razorpay (via Nevatrix/ZoopCoder) |
| Maintenance & updates | ₹3,000–15,000 | ZoopCoder |
| Google Ads CPC (SaaS keywords, India) | ₹50–500/click | Codingclave, 2026 |
| B2B SaaS sales cycle | 4–8 months (plan ≥18-month runway) | Codingclave, 2026 |
| Months to SaaS break-even (custom build) | 9–18 months | Codingclave, 2026 |

### 12.6 Mumbai-First Launch Context

| Indicator | Value | Source |
| --- | --- | --- |
| Real-estate agencies in Mumbai | **5,477** (Apr 2026); 96.7% single-owner, ~181 larger multi-branch brands | Rentech Digital |
| Active MMR channel partners (CPs) | **45,000–60,000**, of which **12,000–18,000 institutional/semi-organised**; CPs drive **50–60% of MMR residential transactions** | CREDAI-MCHI; Ghar.TV |
| MMR annual residential sales | **≈ ₹2.5 lakh crore, roughly 40% of India's total** | CREDAI-MCHI |
| Organised brokerage growth in MMR | **18–25% annually** vs. 10–15% for the wider CP ecosystem | CREDAI-MCHI; Ghar.TV |

### 12.7 Competitive Landscape

| Platform | Type | Strengths | Gaps for a modern Indian agency |
| --- | --- | --- | --- |
| **Salesforce / HubSpot / Zoho** | General-purpose CRM | Power, integrations, ecosystem | Enterprise complexity (76% cite complexity), RE-specific flows absent, high setup effort, weak India/INR convention |
| **Follow Up Boss / kvCORE / BoomTown / LionDesk** | US real-estate CRMs | RE-native pipelines, portal lead import | North-America/MLS-centric, $50–300+/agent/mo, no INR formatting, no site-visit/booking/payment ops |
| **Propertybase / Top Producer** | Transaction + marketing | Deeper listings/transaction mgmt | US-centric, expensive, integration-heavy |
| **Zillow Premier Agent / portal tools** | Lead portals | High lead volume | Not a CRM; leads must be captured elsewhere |
| **Spreadsheets / Notion** | Manual | Free, flexible | Cause the problem: no follow-up automation, no speed-to-lead, no reporting |
| **QREX (this proposal)** | All-in-one website + CRM + operations, India-native | Website, leads, pipeline, site visits, bookings, payments, tasks, automation, reports — one system | Younger product (mitigated by custom deployment & managed service) |

### 12.8 QREX Positioning

**A single, India-native platform where the agency's entire sale-to-settlement journey lives** — from the public website that captures a lead to the follow-up task that wins it, the site visit, the booking, the payment, and the report that proves the ROI. No 4–6 disconnected tools, no 14-field intake forms, no enterprise-bloat interface.

---

## 13. How QREX Works (Key Workflows)

- **Enquiry → Lead** — Visitor submits the enquiry on the website → a `New` lead (source = Website) is created instantly and an activity is logged → assigned agent is notified. No manual data entry.
- **Lead → Site Visit → Booking → Payment** — Agent updates lead status → moving a lead to *Site Visit Scheduled* **auto-creates the site visit** and notifies the agent → converting the lead creates a deal → booking captures agreement & possession tracks → payments are recorded and reported.
- **Follow-up Automation** — Agent sets a next follow-up date on a lead → a follow-up task is auto-created for that agent → on the due date, `leads:check-followups` flags it → if missed, the task becomes **Overdue** and the agent is notified → nothing slips.
- **Reporting** — Management filters by date range / agent / property → exports leads, deals, payments, agent performance, site visits, campaigns, bookings as **CSV or branded PDF** for weekly reviews and board reporting.

---

## 14. Commercial Proposal

### 14.1 Engagement Tiers (Indicative)

Three engagement tiers. Pricing is indicative (INR, ex-GST) and open for negotiation; seat counts are per-license.

| | **Starter** | **Growth** | **Enterprise** |
| --- | --- | --- | --- |
| **Target** | 1–5 users, single branch | up to 15 users, growing team | 15+ users, multi-branch / developer |
| **Public website** | ✔ | ✔ | ✔ |
| **Leads & pipeline** | ✔ | ✔ | ✔ |
| **Tasks & follow-ups** | ✔ | ✔ | ✔ |
| **Properties & customers** | ✔ | ✔ | ✔ |
| **Site visits, bookings, payments** | — | ✔ | ✔ |
| **Marketing campaigns & media** | — | ✔ | ✔ |
| **Reports (CSV)** | ✔ | ✔ | ✔ |
| **Reports (PDF)** | — | ✔ | ✔ |
| **CMS & settings** | ✔ | ✔ | ✔ |
| **SMTP/test-mail (super-admin)** | ✔ | ✔ | ✔ |
| **API access & integrations** | — | — | ✔ |
| **On-premise option** | — | — | ✔ |
| **Implementation & data migration** | Standard | Standard | Dedicated project manager |
| **Support** | Standard (email) | Priority (email + chat) | Dedicated SLA |
| **Indicative subscription** | **₹4,999/mo** | **₹9,999/mo** | **Custom** |

**One-time onboarding**: ₹25,000 (Starter), ₹50,000 (Growth), custom (Enterprise) — includes setup, data import, branding, training.

### 14.2 SaaS Pricing (Layer A) — Mumbai Launch

Flat per-agency plans with included seats. Extra seats are billed as incremental per-user passes.

| Plan | ₹/mo (monthly billing) | ₹/mo (annual billing, 2 months free) | Seats included | Extra seat pass ₹/mo | Best for |
| --- | --- | --- | --- | --- | --- |
| **Starter** | ₹4,999 | ₹4,166 | 3 | ₹800 | Single-owner / small broker offices (96.7% of Mumbai agencies) |
| **Growth** | ₹9,999 | ₹8,333 | 10 | ₹600 | 5–15 agent teams, channel-partner firms |
| **Enterprise** | Custom | Custom | 25+ | Quote | Developer sales teams, multi-branch brands |

**What every plan includes:** public website (branded), property listings & enquiries→lead capture, leads + pipeline, tasks/notifications + follow-up automation, properties & customers, CMS & settings basics, reports (CSV on Starter; +PDF on Growth), SMTP/test-mail (super-admin).

**Feature gating by layer split:**

- Starter: site visits only if added; no PDF export, no bookings/payments gate (available on Growth).
- Growth: full operations (site visits, bookings, payments), marketing campaigns, media center, PDF export.
- Enterprise: everything + API access eligible, on-prem eligible via PaaS.

**One-time onboarding fee:** Starter ₹25,000 · Growth ₹50,000 · Enterprise custom (scope-based). Includes setup, branding, data migration (CSV import), agent training, import template.

**Annual billing incentive:** 2 months free (standard 2026 India pattern). Quarterly invoicing accepted at ₹/mo monthly rate (no discount).

### 14.3 PaaS Pricing (Layer B) — "Platform as a Service"

Stackable, per-instance add-ons that turn QREX from software into a managed platform. Any SaaS plan can carry one PaaS tier. Price bands are indicative; small-platform agencies rarely need B2.

| PaaS tier | ₹/mo | Included | Target |
| --- | --- | --- | --- |
| **B1 · Core Ops** | ₹2,500 | Managed hosting (application server + database + backups), uptime monitoring + alerts, security patching & updates, scheduled automation ops (`php artisan leads:check-followups` cron), storage for uploads, 1×/mo maintenance window | Any SaaS customer who wants "it just runs" |
| **B2 · Pro / Managed** | ₹9,999 | Everything in B1, **plus**: REST API access & integration support, custom integrations (WhatsApp, portals, Excel/CSV automation), data-migration retainers, SMTP/deliverability management, priority support, dedicated solutions engineer (named contact) | Growth + Enterprise agencies, channel-partner firms scaling |
| **B3 · Private / On-prem** | Custom (est. ₹25,000–60,000/mo) | Dedicated/private-cloud or on-premise deployment, white-label branding, custom development days, compliance support (DPDP/India data residency), custom SLA + business-hours support, monthly platform reporting | Developers, multi-branch corporates, data-residency-sensitive firms |

**Bundling guidance:** Starter + B1 is the natural "get us running" offer (≈ ₹7.5K/mo all-in for a small office). Growth + B2 is the midline managed-platform offer (≈ ₹20K/mo all-in for ~10 seats). Enterprise/B3 is quote-driven.

**Why PaaS matters in this market:** 96.7% of Mumbai's agencies are single-owner shops with no IT staff; raw SaaS self-serve would stall on hosting/SMTP/backups. Packaging managed platform services captures that revenue and differentiates vs ₹499/seat commodity CRMs.

### 14.4 Licensing Terms (Indicative)

- Annual (2 months free) or quarterly billing; per-user upgrade increments.
- Base hosting, backups, and scheduled automation included in subscription (B1+ upgrades available).
- No long-term lock-in: your data is exportable (CSV) at any time.

---

## 15. Revenue Model & Year-1 Budget

### 15.1 Year-1 Objectives (Mumbai Launch)

| Objective | Target |
| --- | --- |
| Paying SaaS customers by month 12 | 25–40 agencies |
| Paying PaaS subscribers by month 12 | 8–15 agencies |
| Recurring revenue run-rate (month 12) | ₹4–10 L MRR |
| Time to break-even (monthly) | Months 9–15 |
| Channel mix | Direct sales + channel-partner associations + developer referrals |

### 15.2 Revenue Assumptions (year 1, base scenario)

| Parameter | Base | Notes |
| --- | --- | --- |
| Sales cycle (decision → paid) | 2–3 months | Faster than generic B2B (4–8 mo) for the Starter micro-segment; Growth takes 3–5 mo |
| Churn (monthly) | 2.5% (Starter), 1.5% (Growth+), 1.0% (PaaS) | SaaS norms for SMB |
| Seat mix | Starter avg 3 seats · Growth avg 12 seats | Growth earns ₹10K base + 2 extra seats |
| PaaS attach | 30% of customers take B1, 15% B2, 5% B3 | Higher for Growth/Enterprise |
| Onboarding fee capture | 80% of new Starter, 100% of Growth | One-time revenue stream |

### 15.3 Quarterly Ramp (base scenario, indicative)

| Quarter | New SaaS customers (cum.) | SaaS MRR (₹) | PaaS MRR (₹) | One-time revenue (₹) | Total revenue Y1 (₹) |
| --- | --- | --- | --- | --- | --- |
| Q1 | 5 | 24,995 | 7,500 | 1,36,000 | 2,38,000 |
| Q2 | 12 | 60,000 | 20,000 | 93,000 | 4,70,000 |
| Q3 | 21 | 1,10,000 | 40,000 | 1,11,000 | 9,20,000 |
| Q4 | 32 | 1,70,000 | 62,000 | 1,30,000 | 16,70,000 |

*Q1 revenue includes partial start; Y1 total ≈ ₹16–17 L under the base scenario. Optimistic scenario ≈ ₹25–30 L; conservative ≈ ₹10–12 L.*

### 15.4 Month-12 Run-Rate (base)

- **SaaS MRR ≈ ₹1.7 L** (32 customers: ~17 Starter + 12 Growth + 3 Enterprise-equivalent)
- **PaaS MRR ≈ ₹62 K** (out of the above: ~11 B1 + 4 B2 + 1 B3)
- **Total MRR ≈ ₹2.3 L** → annualized ≈ ₹28 L (before churn discount it to ~₹24–26 L)
- vs. the 2026 India benchmark of "₹1–3 L MRR with 10–25 paying customers by day 90–180" (Codingclave), this is a healthy but ambitious trajectory for an enterprise-informed product.

### 15.5 Year-1 Budget — Mumbai Launch

**One-time setup costs (pre-launch):**

| Item | ₹ (range) |
| --- | --- |
| Company incorporation (Pvt Ltd) + PAN/TAN/DSC + GST + MSME + DPIIT Startup registration | 20,000 – 45,000 |
| Legal docs (ToS, Privacy, DPA, customer contract) + DPDP Act compliance basics | 30,000 – 80,000 |
| Branding (logo, design system, landing page), domain + SSL | 40,000 – 1,00,000 |
| Infrastructure setup & hardening (server, backups, monitoring, CI) | 15,000 – 35,000 |
| **Subtotal (one-time)** | **₹1,05,000 – 2,60,000** |

**Monthly operating opex (post-launch):**

| Line | ₹/month (range) | Notes |
| --- | --- | --- |
| **Payroll (70–80% of burn)** | 2,50,000 – 4,50,000 | Founder/tech lead (~₹1.2–1.8L), 1–2 full-stack devs (₹60K–1.2L each), 1 sales/BDE (₹40–70K incl. variable). Mumbai salaries run ~40% above tier-2 cities |
| Cloud infrastructure | 5,000 – 12,000 | Single VPS → ₹15–30K as users scale (ZenoCloud stages) |
| Tools: Sentry, analytics, email (transactional), SMS, SMTP, backups | 5,000 – 12,000 | Per-seat stack + email/SMS (ZoopCoder) |
| Domain/SSL amortized | 400 – 1,500 | |
| Marketing & sales | 50,000 – 1,50,000 | Google/LinkedIn (₹50–500 CPC), content/SEO, CREDAI-MCHI & CP-association expos, referral program |
| Office / misc / banking | 10,000 – 30,000 | Coworking, travel for demos |
| **Fixed/month before buffer** | **3,20,000 – 6,55,000** | |
| Contingency buffer (10–15%) | 32,000 – 98,000 | |
| **Total monthly burn** | **₹3,50,000 – 7,50,000** | |

**Full-year cash requirement:**

| Scenario | Assumptions | Year-1 cash (₹) |
| --- | --- | --- |
| Lean | Founder-led sales, 1 dev, minimal ads (₹50K/mo marketing) | ~₹42–45 L |
| Base | 2 devs + 1 BDE, ₹1L/mo marketing | ~₹65–75 L |
| Ambitious | Full team, ₹1.5L/mo marketing, stronger infrastructure | ~₹85–95 L |

> **Planning rule (2026):** B2B SaaS sales cycles are 4–8 months; carry **≥18 months of runway**, not 12. If raising/investing, the recommendation is ₹1.2–1.5 Cr to burn ≥18 months comfortably in the base scenario.

### 15.6 Unit Economics & Break-Even

**Unit economics by channel:**

| Channel | CAC (₹) | Payback (months) | LTV (₹, 3-yr) |
| --- | --- | --- | --- |
| Direct sales (BDE-led, demos at expos) | 15,000 – 30,000 | 3 – 6 | 1,50,000 – 2,50,000 |
| Google/LinkedIn paid | 8,000 – 20,000 | 2 – 4 | 1,20,000 – 2,00,000 |
| Referral / CP-association & developer partnerships | 0 – 5,000 | < 1 | same |

*LTV assumes Growth-tier avg ₹12K/month gross, ~60% gross margin after hosting/support → ~₹7K net, 70% retention over 3 years.*

**Break-even:**

- **Fixed monthly opex (lean/base):** ₹3.5L (lean) to ₹5.5L (base).
- **Blended gross margin per customer:** Starter ≈ ₹4.5K/mo, Growth ≈ ₹8.5K/mo, PaaS B1 ≈ ₹2.2K/mo, B2 ≈ ₹8.5K/mo net of admin.
- **Break-even customer base:** ≈ 35–45 paying accounts at an average ₹7–9K net/month, or ≈ **₹3.5–5.5 L MRR**.
- **Expected month of break-even:** base scenario ≈ **months 11–15** (matches the 9–18-month India benchmark).

**Cumulative month-12 view (base):**

| | ₹ |
| --- | --- |
| Year-1 expenses (lean but realistic, ~₹55–65 L) | 60,00,000 |
| Year-1 revenue (base, §15) | 16,00,000 |
| **Year-1 net cash position** | **≈ −₹44 L** |
| Monthly run-rate at month 12 (MRR) | ₹2.3 L |
| Projected break-even (if growth holds) | Month ~12–15 |

---

## 16. Billing, GST & Payment Operations

- **GST 18%** added to all SaaS/PaaS/onboarding invoices (standard software-service rate). Input credit claimed on infra/tools.
- **Billing:** annual (2-months-free) preferred; quarterly at monthly rate; monthly at monthly rate + no discount. Razorpay (or Stripe) at **~1.9–2% + GST** per transaction (Razorpay via Nevatrix/ZoopCoder benchmarks).
- **Automatic GST-compliant invoicing** per customer; recurring billing with dunning on failed cards.
- **Contract:** monthly/quarterly/annual; no long-term lock-in — **full CSV data export guarantee** (matches product's built-in CSV export capability).
- **Refund:** 14-day money-back on first paid month (Starter/Growth); on-prem POCs priced separately.

---

## 17. ROI & Business Benefits

An illustrative financial model using industry benchmarks — figures are directional, not guarantees:

| Lever | Industry evidence | Implication for an agency |
| --- | --- | --- |
| Responsiveness | 5-min response = 21× qualification; 78% of buyers pick the first responder | Leads captured & assigned instantly by the website = more qualified conversations |
| Conversion | Consistent CRM use → **47% more deals closed/year** (T3 Sixty/WAV Group) | Even half that delta on an existing pipeline is material |
| Nurturing | Nurtured leads → **+20% opportunities**, **47% larger purchases** (DemandGen) | Systematic follow-up (QREX automation) converts the 80% who aren't ready today |
| ROI of CRM | **$8.71 returned per $1 invested** (industry ROI benchmark) | A ₹9,999/mo platform recovering one extra closing/year pays for itself many times over |
| Data entry | CRM admin = ~4.5 hrs/week/rep (Salesforce) | Auto-created leads & tasks free agent time for selling |

**Example (illustrative):** An agency doing 200 leads/month with one extra closing per agent per year — at an average registered deal value of **₹0.81 Cr** and a typical **1–2%** agency commission (~₹81,000–₹1,62,000/close) — recovers tens of lakhs annually against a subscription cost in the low thousands of rupees per month.

**Non-financial benefits:** complete audit trail per lead, agent accountability, brand-consistent public site, and a defensible, exportable data asset for the agency.

---

## 18. Implementation Roadmap

| Phase | Activities | Indicative duration |
| --- | --- | --- |
| **1. Setup & configuration** | Provision hosting, configure application & SMTP, brand site (logo, colors, contact info) | 1 week |
| **2. Data migration & inventory** | Import property catalog, leads, customers from CSV; clean duplicates | 1–2 weeks |
| **3. Team enablement** | Configure roles/permissions to the org chart; train super-admins & agents; import template walkthrough | 1 week |
| **4. Launch** | Go-live on public site + CRM; verify enquiries → leads end-to-end | — |
| **5. Optimization** | Monthly reporting reviews, workflow tuning, additional fields/modules as needed | Ongoing |

Total typical ramp: **3–4 weeks** from contract to full operation.

---

## 19. Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| **Adoption stalls** (the industry's #1 failure) | Churn | Minimal-field lead intake (name + phone + source) mirrors what high-adoption tools do; automation removes manual step that causes drop-off; training is included; quarterly adoption reviews |
| **Data migration quality** | Friction | CSV import with header aliasing, duplicate detection, and per-row error reports; cleanup phase in roadmap |
| **Feature gaps vs. US tools (MLS/IDX)** | Perception | Virtual Scout/scout-free model fits India (no MLS); QREX links leads to the in-app property catalog; API available for portal integrations |
| **Team roster changes** | Data drift | Handovers & reassignment flows, activity audit trail, role/field permissions adjustable per user |
| **Vendor lock-in** | Trust | Full CSV export; on-premise option for enterprise tier |
| **B2B sales cycle longer than modeled (4–8 mo)** | Cash gap | ≥18-month runway; Starter self-serve to shorten cycle; freemium 14-day trial |
| **₹499–1,499/seat commodity pricing pressure** | Margin squeeze | Position per-agency value (website+CRM+ops+PaaS); emphasize ROI; avoid a price war on per-seat alone |
| **Concentration on single-owner micro-agencies (96.7%)** | Low ARPU | Growth-tier focus via 12–18K institutional CP firms; developer/B3 pathway for large brands |
| **Infra/SMTP/backup failures** | Trust damage | PaaS-managed ops, monitoring, backups with defined RPO/RTO in SLA |
| **DPDP compliance (India)** | Legal | Compliance in one-time budget line; consent + data-residency flow in B3 |

---

## 20. Summary Recommendation

1. **Launch three SaaS plans** (Starter ₹4,999 · Growth ₹9,999 · Enterprise custom) with **annual 2-months-free** and **extra-seat passes**.
2. **Sell PaaS as the differentiator** — B1 core ops (₹2,500/mo) bundled into most deals, B2 managed (₹9,999/mo) for channel-partner firms, B3 private/on-prem (custom) for developers/corporates.
3. **Fund ≈ ₹1.2–1.5 Cr runway** (≥18 months) OR keep burn lean (~₹45 L/yr) with founder-led sales and a ₹50K/mo marketing budget.
4. **Target the 12,000–18,000 institutional channel partners + ~181 multi-branch Mumbai brands** as anchor customers; single-owner agencies via referral + self-serve.
5. **Measure break-even at ≈ ₹3.5–5.5 L MRR** (months 11–15 base case).

---

## 21. Next Steps

1. **Discovery call** — 45 minutes to map your agency's team size, branches, property portfolio, and current tools.
2. **Live demo & pilot** — we configure a pilot with your branding and sample data so your team can evaluate it hands-on.
3. **Proposal lock** — finalize tier, seat count, onboarding scope, and SLA.

We are ready to begin.

---

## 22. Glossary

Terms as used across QREX, the admin UI, and this documentation.

| Term | Definition |
| --- | --- |
| **Lead** | A prospective buyer/enquirer recorded with name, phone, source, status, budget, and preferences. Created from website enquiries, manually, or by CSV import. |
| **Lead source** | Where a lead came from: `Website, Facebook, Instagram, Google, Referral, Walk-in, Phone, WhatsApp, Campaign`. |
| **Lead status** | Stage of a lead's journey: `New, Contacted, Qualified, Site Visit Scheduled, Site Visit Completed, Negotiation, Converted, Lost`. |
| **Lead score** | An integer 0–100 indicating lead quality/priority. Set manually or via import; sanitized to the valid range. |
| **Lead activity** | An entry appended to a lead's timeline (call, email, note, meeting) including communication fields (duration, outcome, contact number, email subject, next follow-up, location). |
| **Lead handover** | A transfer of a lead from one agent to another, recorded with reason/notes. Reassignment updates both assigned agent and owner. |
| **Lead owner vs assigned agent** | `assigned_agent_id` is the current working agent; `owner_id` tracks who retains ownership. Agent-scoped users can see leads where they are either. |
| **Deal** | A sales opportunity created when a lead is converted (or entered directly). Has a value, stage, probability, and assigned agent. |
| **Pipeline** | The Kanban deal board. Deals move through stages; `days_in_stage` measures time spent at the current stage. |
| **Pipeline stage** | One of `New Lead, Contacted, Qualified, Property Shortlisted, Site Visit Scheduled, Site Visit Completed, Negotiation, Booking, Agreement, Payment, Closed Won, Closed Lost`. |
| **Close probability** | Estimate of a deal's likelihood to close, set per deal (a new deal defaults to 30). |
| **Value label** | Human-readable money formatting: `₹X.XX Cr` (≥ ₹1 Cr) or `₹X.XX L` (≥ ₹1 L). |
| **Property** | A listing the agency sells/rents, with type, transaction type, price, area, configuration, amenities, images, featured/website-visibility flags, and SEO fields. |
| **Property image / cover** | Images attached to a property; one is the cover. `coverOrImage()` resolves the display image. |
| **Featured property** | A property flagged `featured = true` (and website-visible) shown on the public home. |
| **Website-visible property** | A property with `is_website_visible = true`; hidden properties 404 on the public site. |
| **Customer** | A recorded party (buyer/seller/renter) with contact details, type, budget, and notes. |
| **Site visit** | A scheduled/held visit of a customer to a property, with status `Scheduled, Confirmed, Completed, Cancelled, Rescheduled` plus location, notes, and feedback. Auto-created when a lead becomes *Site Visit Scheduled*. |
| **Booking** | A reservation holding a deal: captures booking amount, and three tracks — booking `status`, `agreement_status`, and `possession_status`. |
| **Payment** | A financial record (amount, mode, txn id, due/paid dates, status `Pending, Paid, Overdue, Partially Paid`). Payments are recorded manually; there is no gateway integration. |
| **Campaign** | A marketing initiative tracked for attribution (channel, budget, spent, leads, conversions, revenue, ROI). Leads may carry a `campaign_id`. |
| **Follow-up task** | A `Follow-up`-type task with a due date/time, auto-synchronized from a lead's `next_followup`, assigned to the lead's agent, and flagged overdue by automation. |
| **Notification** | An in-app notification row (title, message, type, related id, read/seen flags) delivered to a user; e.g., follow-up, lead conversion, site-visit scheduled. |
| **Readable ID** | A human-friendly record identifier such as `L-006`, `DL-012`, `TSK-007`, `SV-003`, generated collision-free from the `sequences` table. |
| **CMS** | Content management for the public site: content sections and featured-property selection. |
| **Settings** | The key-value store (`settings` table) holding branding, contact info, SEO defaults, feature toggles, and SMTP configuration. |
| **Super Admin / Admin / Sales Executive / Senior Agent / Marketing User / Accountant** | The six seeded roles controlling module access. See §6. |
| **Field-level permission** | A permission of the form `{module}.{action}.{field}` (e.g., `leads.edit.phone`) that restricts which fields a user may edit. |
| **Agent scope** | The row-level rule that limits `sales-executive`/`senior-agent` users to leads they are assigned to or own. |
| **CSV import** | Bulk creation of leads from a CSV, with header aliasing, validation, deduplication, reference resolution, and per-row error reporting. |
| **Waterfall / funnel** | Report visualization of deals across pipeline stages (count and value per stage). |
| **Recharts** | The charting library used on the dashboard and reports pages. |
| **DomPDF** | The PDF renderer used for report PDF export. |
| **SMTP test mail** | A super-admin action that sends a real test email to verify DB-stored mail configuration. |

---

## Appendix A: Sources & Methodology

Market statistics cited above are sourced from publicly reported research:

| Statistic | Source |
| --- | --- |
| Global RE CRM market size/CAGR (2026→2035) | Morgan Reed Insights; Business Research Insights (public summaries) |
| India sector value, ₹8.46 lakh crore sales, premium share | CREDAI–Liases Foras, *Indian Real Estate CY2025 Report* |
| India market size/CAGR, residential/sales shares, MMR | Mordor Intelligence, *India Real Estate Market* & *Residential Real Estate* reports |
| Registered transactions/value, avg deal size, 2026 mid-segment outlook | SquareYards, *2025 Recap, 2026 Outlook: Residential Real Estate* |
| CRM as lead source, daily usage, adoption rates, buyer behavior (78% first responder, 10-week search, 97% online) | NAR (2024/2025) Technology Survey and *Profile of Home Buyers & Sellers* |
| 15-hour response time | Inman, 2025 Real Estate Technology Survey |
| 5-minute 21×; 1-minute 391% | MIT/InsideSales.com Lead Response Management Study; Velocify |
| 87% deals lost to follow-up fade | SureSend (2026) |
| CRM admin 4.5h/wk; 28–30% selling time | Salesforce, 2024 State of Sales |
| 76% complexity frustration; data-entry complaints | SugarCRM; HubSpot, 2025 State of CRM |
| Brokerage adoption <50% (68%); 20+ tools; satisfaction drop | TotalBrokerage × T3 Sixty, 2023 & 2024 Surveys |
| 83% executive adoption challenge | Really Simple Systems (research compilation) |
| Feature usage (94% contact mgmt → 48% reporting) | Capterra, CRM User Behavior Survey 2024 |
| Nurtured leads +20%/47% larger; 80% never convert; 8–12 touchpoints; 25% ready now | DemandGen; MarketingSherpa Lead Gen Benchmark; industry compilations |
| Consistent CRM use → 47% more closings | WAV Group / T3 Sixty, Technology Effectiveness Study 2024 |
| $8.71 per $1 CRM ROI | Industry CRM ROI benchmark compilation |
| 5,477 Mumbai agencies; 96.7% single-owner; ~181 larger brands | Rentech Digital business directory (Apr 2026) |
| 45–60K active MMR channel partners; 12–18K institutional; 50–60% of transactions; 18–25% organised-brokerage growth; ₹2.5L Cr MMR residential (~40% of India) | CREDAI-MCHI (2026); Ghar.TV India Broker Report (2026); GeoSquare (2026) |
| India CRM prices (ClosingFox, TeleCRM, Realatic, Zoho, Kylas, Salesforce) | Vendor pricing pages / ClosingFox India comparison (Apr 2026) |
| US CRMs (Follow Up Boss, BoomTown, Sierra, Real Geeks) | Vendor pricing & third-party reports (2026) |
| Hosting/infra stage costs | ZenoCloud SaaS infrastructure guide (2026); ZoopCoder SaaS cost guide (2026) |
| Email/SMS, gateway ~2%, maintenance | ZoopCoder (2026); Nevatrix (2026) |
| CPC ₹50–500; 4–8 mo sales cycle; ≥18-mo runway; ₹1–3L MRR / 10–25 customers day-90 benchmark; 9–18 mo break-even | Codingclave India SaaS guide (2026) |
| Payroll 70–80% of burn; fully-loaded multiplier; cost-of-run categories | RunFutureProof startup budget template (2026); Awasero (2026) |

> Figures marked (est.) vary by research house; we use rounded ranges and name the source for each. Full source titles and links are available on request. All pricing and budget figures are indicative planning numbers for discussion, not contractual offers.

---

*End of proposal — QREX, by Qodeigence Inc. Let's build your agency's next 10 years.*