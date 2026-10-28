# Project Proposal: QREX – Qodeigence Real Estate Experience

**Prepared by:** Qodeigence Inc.
**Project name:** QREX — Qodeigence Real Estate Experience
**Audience:** Real estate agencies, brokerages, and developers
**Version:** 1.0
**Status:** Proposal for discussion

> This proposal combines an independent market research summary with a technical and commercial description of QREX, a complete real estate marketing + sales CRM platform. All market figures cite their sources; commercial terms are indicative and open for discussion.

---

## 1. Executive Summary

Real estate is an increasingly value-driven, competitive, and digital-first industry. In India alone, the sector is valued at roughly **₹23.5 lakh crore (7.1% of GDP)**, and 2025 primary housing sales crossed **₹8.46 lakh crore, up 16% year-on-year** (CREDAI–Liases Foras). Yet the teams that win these deals run on fragmented tools. The global real estate CRM market is growing at **12–13% CAGR** (see §4.1), pushed by exactly this gap.

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

---

## 2. About Qodeigence Inc.

**Qodeigence Inc.** is a software company specializing in digital products for real estate and sales-driven industries. QREX — **Qodeigence Real Estate Experience** — is our flagship product, a production real estate marketing and CRM platform.

Our approach is partnership, not hand-off:

- We bring domain knowledge of the agency sales process (leads → site visits → bookings → payments).
- We ship a **complete, working product** rather than a template.
- We support deployment, data import, training, and ongoing operation.
- We are open to localizing QREX for your city, your property portfolio, and your branding.

---

## 3. Methodology Note

This proposal was informed by:

1. **Independent market research** — global & India real estate CRM/sector reports (see §4 and Appendix A for sources).
2. **Primary product evidence** — the QREX codebase (routes, controllers, models, migrations, services, frontend), documented separately in the companion project documents (`docs/01`–`docs/08`).
3. **Industry adoption research** — NAR Technology Surveys, brokerage technology surveys (T3 Sixty, TotalBrokerage), CRM sales research (Salesforce, HubSpot, SugarCRM), and academic response-time studies (MIT/InsideSales).

Every statistic below carries its source. Nothing is fabricated.

---

## 4. Market Research

### 4.1 Global Real Estate CRM Market

| Indicator | Value | Source |
| --- | --- | --- |
| Global real estate CRM software market, 2026 | **US$ 5.58 B** (est. US$ 5.31 B) | Morgan Reed Insights; Business Research Insights |
| Forecast, 2035 | **US$ 14.98–16.51 B** | Business Research Insights; Morgan Reed Insights |
| CAGR (2026–2035) | **12.2–12.8%** | Same sources |

The fastest-growing real estate software segment is disorganized — a handful of fragmented specialists (US-centric) and generic enterprise CRMs that real-estate agents don't use. Our research review found **no India-native, end-to-end website + CRM + operations platform** that addresses the industry's core adoption problem (see §4.3), which is a market gap QREX targets directly.

### 4.2 India Market Context

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

### 4.3 The Agency Problem (Why Deals Are Lost)

The market research consistently identifies **four structural reasons** agencies leak revenue:

**1. Slow response to leads.** Lead-response speed is the single highest-leverage metric in real estate.

- Average agent response to a new lead: **~15 hours** (Inman, 2025 Real Estate Technology Survey).
- Contact within **5 minutes** → leads are **21× more likely to qualify**; within 1 minute → **391% better contact rate** than at 2 minutes (MIT/InsideSales.com; Velocify).
- **78% of buyers work with the first agent who responds** (NAR Profile of Home Buyers & Sellers).
- Delta for an agency generating ~50 paid leads/month: **₹– … lakh to ₹– lakh per year in lost commissions** (see ROI model, §12).

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

### 4.4 What Agencies Actually Need

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

### 4.5 Competitive Landscape

| Platform | Type | Strengths | Gaps for a modern Indian agency |
| --- | --- | --- | --- |
| **Salesforce / HubSpot / Zoho** | General-purpose CRM | Power, integrations, ecosystem | Enterprise complexity (76% cite complexity), RE-specific flows absent, high setup effort, weak India/INR convention |
| **Follow Up Boss / kvCORE / BoomTown / LionDesk** | US real-estate CRMs | RE-native pipelines, portal lead import | North-America/MLS-centric, $50–300+/agent/mo, no INR formatting, no site-visit/booking/payment ops |
| **Propertybase / Top Producer** | Transaction + marketing | Deeper listings/transaction mgmt | US-centric, expensive, integration-heavy |
| **Zillow Premier Agent / portal tools** | Lead portals | High lead volume | Not a CRM; leads must be captured elsewhere |
| **Spreadsheets / Notion** | Manual | Free, flexible | Cause the problem: no follow-up automation, no speed-to-lead, no reporting |
| **QREX (this proposal)** | All-in-one website + CRM + operations, India-native | Website, leads, pipeline, site visits, bookings, payments, tasks, automation, reports — one system | Younger product (mitigated by custom deployment & managed service) |

### 4.6 QREX Positioning

**A single, India-native platform where the agency's entire sale-to-settlement journey lives** — from the public website that captures a lead to the follow-up task that wins it, the site visit, the booking, the payment, and the report that proves the ROI. No 4–6 disconnected tools, no 14-field intake forms, no enterprise-bloat interface.

---

## 5. Project Vision & Objectives

QREX exists to give real-estate agencies:

1. **Speed to lead** — enquiries from the website land in the CRM instantly as leads (no manual entry).
2. **No dropped follow-up** — scheduled follow-up tasks, overdue detection, and in-app notifications ensure no lead is forgotten.
3. **One source of truth** — property inventory, customers, visits, bookings, and payments in one system.
4. **Accountable teams** — role-based and field-level permissions; every agent sees and manages their own pipeline.
5. **Data-driven decisions** — dashboards and CSV/PDF reports that show lead source ROI, agent performance, pipeline funnel, and revenue.

---

## 6. Solution Overview & Scope

QREX is fully built (production Laravel application) and ready to deploy. The complete working details are documented in companion files (`docs/03-operations-modules.md`, etc.); a summary follows.

### 6.1 Public Website (Marketing Surface)

- Searchable, filterable property listings (type, status, bedrooms, price range, sort).
- Property detail pages with image galleries and related properties.
- About & contact pages with the agency's branding (CMS-managed content).
- **Enquiry forms that auto-create CRM leads** (rate-limited against spam).

### 6.2 Lead Management

- Full status lifecycle: `New → Contacted → Qualified → Site Visit Scheduled → Site Visit Completed → Negotiation → Converted / Lost`.
- **Activity timeline** — every call, email, note, and meeting logged with outcome & follow-up.
- **Handovers & reassignment** between agents with reason/notes and audit history.
- **Bulk CSV import** with downloadable template, header aliasing, duplicate detection, and per-row error reports.
- **One-click conversion** of a lead into a pipeline deal (concurrency-safe).

### 6.3 Sales Pipeline

- Kanban-style deal board with configurable stages (`New Lead → Contacted → Qualified → Property Shortlisted → Site Visit Scheduled → Site Visit Completed → Negotiation → Booking → Agreement → Payment → Closed Won / Lost`).
- Days-in-stage tracking, close probability, assigned agent.

### 6.4 Sales Operations

- **Properties** — full CRUD with multiple images per property, featured & website-visibility toggles, SEO fields.
- **Customers** — record, view, manage customer details.
- **Site Visits** — schedule and manage visits (Scheduled/Confirmed/Completed/Cancelled/Rescheduled) with feedback.
- **Bookings** — booking amount plus agreement & possession tracks.
- **Payments** — track amounts, modes, due/paid dates, statuses (Pending/Paid/Overdue/Partially Paid).

### 6.5 Productivity & Automation

- **Tasks** — follow-ups and to-dos with due dates, priorities, assignments.
- **Notifications** — in-app read/unread.
- **Follow-up automation** — a scheduled check (`php artisan leads:check-followups`) flags overdue/due-today follow-ups and notifies the responsible agent, automatically.

### 6.6 Marketing & Reporting

- **Campaigns** — budget, spend, leads, conversions, revenue, ROI, with campaign attribution on leads.
- **Media center** — centralized file management.
- **Reports** — dashboard KPIs, revenue-by-month, lead sources, pipeline funnel, agent performance, monthly bookings, payment collection, property performance, site-visit & lost-lead reports; **CSV and PDF export** (with spreadsheet-formula-injection protection).

### 6.7 CMS & Settings

- Manage public-site content sections and featured properties.
- Application/site settings (branding, contact info, SEO, feature toggles).
- **SMTP mail configuration** (super-admin) with a test-mail feature — emails work from the dashboard, no developer needed.

### 6.8 Team, Roles & Security

- User management, custom **role-based authorization with granular field-level permissions**.
- Six built-in roles (Super Admin, Admin, Sales Executive, Senior Agent, Marketing User, Accountant) that map to an agency's org chart.
- Agent-scoped data visibility — agents see only their own leads.
- Email OTP verification for profile changes, password reset, login rate-limiting.

### 6.9 API (for scale)

A Sanctum-secured JSON API mirrors all admin modules — for mobile clients, partner integrations, and automation.

---

## 7. How QREX Works (Key Workflows)

### Enquiry → Lead
Visitor submits the enquiry on the website → a `New` lead (source = Website) is created instantly and an activity is logged → assigned agent is notified. No manual data entry.

### Lead → Site Visit → Booking → Payment
Agent updates lead status → moving a lead to *Site Visit Scheduled* **auto-creates the site visit** and notifies the agent → converting the lead creates a deal → booking captures agreement & possession tracks → payments are recorded and reported.

### Follow-up Automation
Agent sets a next follow-up date on a lead → a follow-up task is auto-created for that agent → on the due date, `leads:check-followups` flags it → if missed, the task becomes **Overdue** and the agent is notified → nothing slips.

### Reporting
Management filters by date range / agent / property → exports leads, deals, payments, agent performance, site visits, campaigns, bookings as **CSV or branded PDF** for weekly reviews and board reporting.

---

## 8. Technology & Architecture

| Layer | Technology |
| --- | --- |
| Backend | **Laravel 13** (PHP ^8.3), Eloquent ORM, Inertia 3, Laravel Sanctum, DomPDF |
| Frontend | **React 19**, **TypeScript**, **Tailwind CSS 4**, **Vite 8**, Recharts |
| Data | Relational DB (SQLite for local, MySQL/Postgres for production), soft deletes, indexed hot paths |
| Security | Role + field-level permissions, agent-scoped data, login throttling, rate-limited forms, hashed passwords, email OTP verification, CSV injection protection |

**Why this stack:** server-rendered React pages are fast and SEO-friendly for the public site; a single PHP codebase keeps the platform inexpensive to host and maintain; the API keeps the platform ready for mobile & partner integrations.

---

## 9. Deployment & Operations Model

- **Cloud-ready** deployment (production server or your own infra), with a documented operations guide: install, migrate, seed, scheduled automation, backup, and SMTP setup (all in `docs/06-operations.md`).
- **Scheduled automation** runs daily (follow-up checker).
- **Managed migration** of your existing leads/properties from spreadsheets or a legacy CRM via the CSV import pipeline.
- Optional **on-premise** deployment for enterprises with strict data-residency needs.

---

## 10. Implementation Roadmap

| Phase | Activities | Indicative duration |
| --- | --- | --- |
| **1. Setup & configuration** | Provision hosting, configure application & SMTP, brand site (logo, colors, contact info) | 1 week |
| **2. Data migration & inventory** | Import property catalog, leads, customers from CSV; clean duplicates | 1–2 weeks |
| **3. Team enablement** | Configure roles/permissions to the org chart; train super-admins & agents; import template walkthrough | 1 week |
| **4. Launch** | Go-live on public site + CRM; verify enquiries → leads end-to-end | — |
| **5. Optimization** | Monthly reporting reviews, workflow tuning, additional fields/modules as needed | Ongoing |

Total typical ramp: **3–4 weeks** from contract to full operation.

---

## 11. Commercial Proposal (Indicative)

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

**PaaS layer ("Platform as a Service," stackable add-ons):** the subscription above is the software license (Layer A). Optionally, agencies add a managed platform layer (Layer B) — from hosted operations through fully managed/on-prem platform delivery:

| PaaS tier | Indicative ₹/mo | Included | Best for |
| --- | --- | --- | --- |
| **B1 · Core Ops** | 2,500 | Managed hosting, backups, monitoring, security patches, scheduled automation, storage | Small offices that want it to "just run" |
| **B2 · Pro / Managed** | 9,999 | B1 + API access, custom integrations, data-migration retainers, SMTP/deliverability management, priority support, dedicated engineer | Channel-partner firms & scaling teams |
| **B3 · Private / On-prem** | Custom (est. ₹25,000–60,000) | Dedicated/on-prem deployment, white-label, custom dev days, DPDP/data-residency compliance, custom SLA | Developers, multi-branch corporates |

**Licensing terms (indicative):**

- Annual (2 months free) or quarterly billing; per-user upgrade increments.
- Base hosting, backups, and scheduled automation included in subscription (B1+ upgrades available).
- No long-term lock-in: your data is exportable (CSV) at any time.

> **Full commercial detail — including the complete SaaS + PaaS pricing tables, revenue projections, and a year-1 Mumbai launch budget — is in [`10-budget-pricing-mumbai.md`](./10-budget-pricing-mumbai.md).**

---

## 12. ROI & Business Benefits

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

## 13. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| **Adoption stalls** (the industry's #1 failure) | Minimal-field lead intake (name + phone + source) mirrors what high-adoption tools do; automation removes manual step that causes drop-off; training is included |
| **Data migration quality** | CSV import with header aliasing, duplicate detection, and per-row error reports; cleanup phase in roadmap |
| **Feature gaps vs. US tools (MLS/IDX)** | Virtual Scout/scout-free model fits India (no MLS); QREX links leads to the in-app property catalog; API available for portal integrations |
| **Team roster changes** | Handovers & reassignment flows, activity audit trail, role/field permissions adjustable per user |
| **Vendor lock-in** | Full CSV export; on-premise option for enterprise tier |

---

## 14. Next Steps

1. **Discovery call** — 45 minutes to map your agency's team size, branches, property portfolio, and current tools.
2. **Live demo & pilot** — we configure a pilot with your branding and sample data so your team can evaluate it hands-on.
3. **Proposal lock** — finalize tier, seat count, onboarding scope, and SLA.

We are ready to begin.

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

> Figures marked (est.) vary by research house; we use rounded ranges and name the source for each. Full source titles and links are available on request.

*End of proposal — QREX, by Qodeigence Inc. Let's build your agency's next 10 years.*