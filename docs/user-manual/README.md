# QREX — User Manual

**QREX** (Qodeigence Infocircle Private Limited) is a **property management and sales CRM** for a real-estate agency. This manual is written for the people who **use** it day to day — sales agents, marketing staff, accountants, admins and managers — not for developers.

> **Where to start**
> - New to QREX? → [`01-overview-and-getting-started.md`](./01-overview-and-getting-started.md)
> - Want to know what your login can and cannot do? → [`02-roles-and-access.md`](./02-roles-and-access.md)
> - Want the end-to-end story of a sale? → [`03-sales-lifecycle.md`](./03-sales-lifecycle.md)
> - Need to do a specific task? → the module guides in `04`–`06`
> - Blocked by an error? → [`09-troubleshooting-and-faq.md`](./09-troubleshooting-and-faq.md)

---

## 1. Document Index

| # | Document | Who it is for | Contents |
| --- | --- | --- | --- |
| 00 | **This file** | Everyone | Manual index, role quick-reference, module map, lifecycle at a glance, reading conventions |
| 01 | [`01-overview-and-getting-started.md`](./01-overview-and-getting-started.md) | Everyone | What QREX is, the three surfaces, first-login tour, profile & password, email change, demo accounts |
| 02 | [`02-roles-and-access.md`](./02-roles-and-access.md) | Everyone | The seven personas, capability matrix, row-level scoping, what happens when access is denied |
| 03 | [`03-sales-lifecycle.md`](./03-sales-lifecycle.md) | Sales, Managers | Enquiry → Lead → Site Visit → Deal → Booking → Payment → Closed Won |
| 04 | [`04-modules-sales.md`](./04-modules-sales.md) | Sales, Marketing | Dashboard, Properties, Amenities, Leads, Customers, Site Visits |
| 05 | [`05-modules-operations.md`](./05-modules-operations.md) | Sales, Accounts | Sales Pipeline, Tasks, Bookings, Payments, Notifications |
| 06 | [`06-modules-marketing-and-admin.md`](./06-modules-marketing-and-admin.md) | Marketing, Admins | Campaigns, Media Center, Reports, CMS, Users, Roles, Settings |
| 07 | [`07-public-website.md`](./07-public-website.md) | Visitors, Marketing | Browsing, filtering, property detail, enquiry forms, how enquiries become leads |
| 08 | [`08-reference.md`](./08-reference.md) | Everyone | Every status vocabulary, field reference, ID prefixes, notification types, permission catalog |
| 09 | [`09-troubleshooting-and-faq.md`](./09-troubleshooting-and-faq.md) | Everyone | Errors you may hit, what they mean, how to fix them |

---

## 2. Role Quick-Reference

QREX limits what you can use. The **sidebar** only shows modules you have **view** access to — a module you cannot open does not appear at all. Elsewhere, action buttons are not hidden: pressing a control you lack permission for is refused by the server with a red toast. The table below is the plain-English version.

| Persona | Sees | Can do | Cannot do |
| --- | --- | --- | --- |
| **Public visitor** | Public website only | Browse & filter properties, submit enquiries | Anything in the admin area |
| **Sales Executive** | Dashboard, Properties, Leads, Customers, Tasks, Site Visits, Media, Reports | Work **their own** leads end-to-end; log activity; schedule site visits; create properties, customers, tasks | See other agents' leads; use the pipeline; record bookings/payments; delete records; export reports; change settings or roles |
| **Senior Agent** | Everything a Sales Executive sees, **plus** Sales Pipeline | Same as above **plus** create deals and move deals between pipeline stages; edit a lead's *source* | Delete records; bookings/payments; administration |
| **Marketing User** | Dashboard, Leads (read + create), Marketing, Media, CMS, Reports | Run campaigns, manage website content and featured properties, upload media, create leads, export reports | Edit leads, use the pipeline, properties, customers, tasks, bookings, payments, admin |
| **Accountant** | Dashboard, Customers, Sales Pipeline (read), Bookings, Payments, Reports, Media | Create & update bookings and payments, view customers and the pipeline, export reports | Edit leads, properties, campaigns, CMS, admin; cannot create deals |
| **Admin** | Almost every module | Everything except two system-level permissions (rename the project; delete roles) | Delete roles; change the project name; SMTP & logo are Super-Admin-only |
| **Super Admin** | Everything | Full access, including SMTP, logo, user and role management | System roles cannot be modified or deleted; the Super Admin account cannot be deleted |

Full detail, including the exact permission behind every capability, is in [`02-roles-and-access.md`](./02-roles-and-access.md).

---

## 3. Module Map

The admin area (`/admin`) is a single sidebar with four groups. Items appear only if you have view access to that module.

```
OVERVIEW
  └─ Dashboard

SALES
  ├─ Properties        ── the listing inventory (create, edit, photos, publish to website)
  ├─ Leads             ── every enquiry and prospect, with a full activity timeline
  ├─ Customers         ── buyer records kept separately from leads
  ├─ Sales Pipeline    ── Kanban board of live deals
  ├─ Site Visits       ── scheduled property visits
  ├─ Tasks & Follow-ups── to-dos and automatic follow-up reminders
  ├─ Bookings          ── a deal that has been booked, with agreement & possession status
  └─ Payments          ── money received and money due

OPERATIONS
  ├─ Media Center      ── shared image / document library
  ├─ Marketing        ── campaigns, budget, spend, ROI
  ├─ Reports & Analytics ── 10 report tabs, CSV and PDF export
  └─ CMS / Website    ── homepage sections, featured properties, site copy

ADMINISTRATION
  ├─ Users             ── create, edit, deactivate team members
  ├─ Roles & Permissions ── what each role can do
  ├─ Amenities         ── which amenities are valid for which property type
  └─ Settings          ── branding, notifications, security, SMTP
```

---

## 4. Lifecycle at a Glance

A single property sale moves through the system like this. Each step is covered in detail in [`03-sales-lifecycle.md`](./03-sales-lifecycle.md).

```
  Visitor                    Sales team                    Accounts              Management
  ───────                    ──────────                    ────────              ──────────
  Enquiry form  ──────────▶  LEAD (status: New)
  (auto-created)                │
                                 ├─ log activity ──────────────▶  Follow-up TASK
                                 │  (updates next_followup)         (auto-synced,
                                 │                                   auto-flagged Overdue)
                                 ├─ status ▸ Site Visit Scheduled ─▶ SITE VISIT
                                 │  (auto-created, agent notified)  (Scheduled ▸ Confirmed
                                 │                                   ▸ Completed)
                                 ├─ status ▸ Qualified
                                 ├─ status ▸ Negotiation
                                 │
                                 └─ Convert to Deal ────────────▶  DEAL  (stage: Qualified)
                                                                     │
                                                                     ├─ drag across 12 stages
                                                                     ├─ ▸ Booking
                                                                     └─ ▸ Closed Won
                                                                             │
                                                                             ▼
                                                                  BOOKING  (status + agreement
                                                                            + possession tracks)
                                                                             │
                                                                             ├─ record payment
                                                                             ▼
                                                                    PAYMENT  (Pending ▸ Partially
                                                                                       Paid ▸ Paid)
```

**What happens automatically** (you do not have to do it twice):

| Trigger | Automatic effect |
| --- | --- |
| Visitor submits an enquiry | A **Lead** is created (`source = Website`, `status = New`) with a *Website enquiry submitted* activity |
| Lead is created or imported | A **Follow-up task** is created for the assigned agent if a next-follow-up date is set |
| Lead status set to **Site Visit Scheduled** | A **Site Visit** is created (once per lead) and the assigned agent is notified |
| Lead activity logged with a next-follow-up date | The lead's follow-up task is updated and `last contact` is stamped |
| Lead is **converted** | A **Deal** is created (`stage = Qualified`, probability 30), the lead becomes `Converted`, and the agent is notified |
| Deal is created with an agent | That agent gets a *New deal assigned* notification |
| Booking is created | The creator gets a *Booking created* notification |
| A payment is recorded from a booking | A **Payment** row is created (`status = Paid`) and the customer is notified |
| Every day at **09:00** | The scheduler flags overdue follow-up tasks and notifies the assigned agents (no repeat notice for the same lead within 12 hours) |

---

## 5. Reading Conventions

**Record IDs.** Every record carries a short human-readable ID you can quote over the phone. You will see them in lists, emails and URLs.

| Record | ID looks like | Record | ID looks like |
| --- | --- | --- | --- |
| Lead | `L-006` | Booking | `B-001` |
| Deal | `DL-012` | Payment | `PAY-001` |
| Task | `TSK-005` | Campaign | `CAM-001` |
| Site visit | `SV-003` | Customer | `C-001` |
| Property | `PROP-001` | | |

**Money.** Amounts are stored in whole rupees and displayed short. `₹18,500,000` shows as **₹1.85 Cr**; `₹750,000` shows as **₹7.50 L**. Always confirm the unit — "1.85 Cr" and "18.5 L" are the same number.

**Dates.** Displayed in Indian format: `21 Oct 2026`. A follow-up date and time is what the system uses to decide a task is overdue.

**Status values.** Every screen with a status dropdown offers a fixed list of values — for example a lead can only be `New`, `Contacted`, `Qualified`, `Site Visit Scheduled`, `Site Visit Completed`, `Negotiation`, `Converted` or `Lost`. **Always pick from the dropdown.** The full vocabulary for every module is in [`08-reference.md`](./08-reference.md).

**Toasts.** A green toast at the top-right confirms a successful action. A red toast means the action was refused — most often "You do not have permission to perform this action." Red toasts disappear after about 3.5 seconds; if you missed the reason, check [`09-troubleshooting-and-faq.md`](./09-troubleshooting-and-faq.md).

**Permissions.** A permission is written as `module.action` (`leads.view`) or `module.action.field` (`leads.edit.budget`). The second form is a **field-level** permission. There are 17 modules and 132 permissions in total; the catalog is in [`08-reference.md`](./08-reference.md).

> **Field-level permissions are only enforced on the Settings screen today.** The other field permissions are catalogued but not read by the application, so they neither hide nor lock a field. Details in [`02-roles-and-access.md`](./02-roles-and-access.md#idea-2-some-permissions-are-field-level).

---

## 6. Where the Technical Documentation Lives

This manual explains **how to use** QREX. If you need to know **how it is built**, the `docs/` folder next to this one covers that:

| Doc | Topic |
| --- | --- |
| [`../01-project-scope.md`](../01-project-scope.md) | Product overview, in/out of scope, system boundaries |
| [`../02-architecture.md`](../02-architecture.md) | Tech stack, request flow, services, ID generation |
| [`../03-operations-modules.md`](../03-operations-modules.md) | Module-by-module *implementation* detail |
| [`../04-roles-permissions.md`](../04-roles-permissions.md) | RBAC model, field-level permissions, data scoping |
| [`../05-database-schema.md`](../05-database-schema.md) | Entities, relationships, indexes, status enums |
| [`../06-operations.md`](../06-operations.md) | Install, run, seed, scheduled automation, SMTP ops |
| [`../07-security-hardening.md`](../07-security-hardening.md) | Authentication, throttling, OTP, CSV safety, secrets |
| [`../08-glossary.md`](../08-glossary.md) | Domain glossary |

> **Note on [`../04-roles-permissions.md`](../04-roles-permissions.md):** it states there are **15** modules. The current catalog actually has **17** — it also includes `amenities` and `sales` as separate modules. This manual uses the live 17-module catalog, which matches the `Roles & Permissions` screen in the application.

---

*QREX — Qodeigence Infocircle Private Limited.*
