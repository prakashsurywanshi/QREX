# 1. Project Scope

## 1.1 Product Overview

QREX is a **property management and sales CRM** for a real-estate agency. It is a single Laravel application that exposes three surfaces:

1. **Public website** — marketing site for prospective buyers (property listings, details, about, contact).
2. **Admin CRM** — password-protected management suite for the sales and operations teams (`/admin`).
3. **JSON API** — Sanctum-authenticated endpoints mirroring the admin modules (for mobile clients / integrations and used by the Inertia admin UI's data layer).

## 1.2 Who It Serves

| User | What they do |
| --- | --- |
| Public visitor | Browses properties, submits enquiries |
| Sales Executive | Manages assigned leads, logs activities, creates properties/customers/tasks, requests site visits |
| Senior Agent | Sales Executive scope plus pipeline (deals) access |
| Marketing User | Manages campaigns, media, and public-site content (CMS) |
| Accountant | Manages bookings & payments, views customers and reports |
| Admin | Most permissions across all modules (excludes a few system-level settings) |
| Super Admin | Full system access: users, roles, permissions, settings, SMTP, CMS, everything |

## 1.3 In-Scope

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

## 1.4 Out-of-Scope (as implemented)

- No payment gateway integration — payments are recorded manually (mode, transaction id, status).
- No public user registration / buyer accounts — all leads are created by agents or via public enquiry forms.
- No lead auto-scoring algorithm — a `score` is stored (0–100) and set manually / via import; there is no scoring engine.
- No email sending library beyond the built-in SMTP mailer — no support for marketing campaign blasts.
- No multi-tenant / multi-branch isolation in the data model — the `branch` field exists on users but access scoping is role-based only.
- No real-time (websocket) notifications — notifications are polled via HTTP.
- No calendar integration for site visits; visits are stored as date/time strings.

## 1.5 System Boundaries

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

## 1.6 Key Behaviors (end-to-end examples)

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