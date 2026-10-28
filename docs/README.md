# QREX — Project Description

Comprehensive documentation for **QREX**, a property management and sales CRM platform built for *Qodeigence Infocircle Private Limited*.

These documents describe the project's **scope**, **operations**, and **working details** as implemented in the codebase.

## Rendered output (HTML & Word)

Every document below is also published as a standalone HTML page and as a Word document:

- **HTML pages** — [`html/index.html`](./html/index.html), open directly in a browser (no server needed). One page per document, cross-linked.
- **Word documents** — [`word/`](./word/): `QREX-User-Manual.docx`/`.doc`, `QREX-Technical-Documentation.docx`/`.doc` and `QREX-How-It-Works.docx`/`.doc`.

These are generated from the Markdown sources — do not edit them by hand. Rebuild with:

```sh
npm run docs:html   # HTML only
npm run docs:doc    # HTML + Word (requires LibreOffice)
```

## How QREX Works

A **visual explainer** for people who want to understand the system rather than operate it. Every chapter is built from drawings, data tables and annotated screen layouts — Mermaid diagrams rendered to SVG at build time, and hand-drawn wireframes of the nine screens that matter most.

| # | Document | Contents |
| --- | --- | --- |
| 00 | [`explainer/README.md`](./explainer/README.md) | What the set is, who should read it, the vocabulary, how to read the drawings |
| 01 | [`explainer/01-system-at-a-glance.md`](./explainer/01-system-at-a-glance.md) | The three surfaces, the eighteen modules, the stack, the repository layout, the request lifecycle |
| 02 | [`explainer/02-sales-lifecycle.md`](./explainer/02-sales-lifecycle.md) | The nine steps of a sale, the lead and site-visit status machines, conversion, the pipeline, bookings and payments |
| 03 | [`explainer/03-data-model.md`](./explainer/03-data-model.md) | Thirty tables in three clusters, entity diagrams, soft deletes, readable IDs, indexes, settings |
| 04 | [`explainer/04-roles-and-permissions.md`](./explainer/04-roles-and-permissions.md) | Module access vs field access, the seventeen modules, the six roles, the full permission matrix |
| 05 | [`explainer/05-screen-designs.md`](./explainer/05-screen-designs.md) | Annotated wireframes of the dashboard, leads, lead detail, pipeline, property form, bookings, reports, roles and the public site |
| 06 | [`explainer/06-operations-and-automation.md`](./explainer/06-operations-and-automation.md) | Every automatic behaviour, the 09:00 follow-up sweep, notifications, settings, deletion rules, and what QREX deliberately does not do |

Rendered artwork is cached in [`diagrams/`](./diagrams/) as `<hash>.svg` / `<hash>.png`. Rebuilding the docs re-renders only what changed.

## User Manual

Looking for how to **use** QREX rather than how it is built? See the **[User Manual](./user-manual/README.md)** — a business-facing guide for sales agents, marketing staff, accountants and administrators covering the roles and their permissions, the end-to-end sales lifecycle, a how-to for every module, the public website, reference tables and troubleshooting.

| # | Document | Contents |
| --- | --- | --- |
| 00 | [`user-manual/README.md`](./user-manual/README.md) | Manual index, role quick-reference, module map, lifecycle at a glance |
| 01 | [`user-manual/01-overview-and-getting-started.md`](./user-manual/01-overview-and-getting-started.md) | What QREX is, the three surfaces, first-login tour, profile & password, email change, demo accounts |
| 02 | [`user-manual/02-roles-and-access.md`](./user-manual/02-roles-and-access.md) | The seven personas, capability matrix, row-level scoping, denied-access behaviour |
| 03 | [`user-manual/03-sales-lifecycle.md`](./user-manual/03-sales-lifecycle.md) | Enquiry → Lead → Site Visit → Deal → Booking → Payment → Closed Won |
| 04 | [`user-manual/04-modules-sales.md`](./user-manual/04-modules-sales.md) | Dashboard, Properties, Amenities, Leads, Customers, Site Visits |
| 05 | [`user-manual/05-modules-operations.md`](./user-manual/05-modules-operations.md) | Sales Pipeline, Tasks, Bookings, Payments, Notifications |
| 06 | [`user-manual/06-modules-marketing-and-admin.md`](./user-manual/06-modules-marketing-and-admin.md) | Campaigns, Media Center, Reports, CMS, Users, Roles, Settings |
| 07 | [`user-manual/07-public-website.md`](./user-manual/07-public-website.md) | Browsing, filtering, property detail, enquiry forms, how enquiries become leads |
| 08 | [`user-manual/08-reference.md`](./user-manual/08-reference.md) | Status vocabularies, field reference, ID prefixes, notification types, permission catalog |
| 09 | [`user-manual/09-troubleshooting-and-faq.md`](./user-manual/09-troubleshooting-and-faq.md) | Errors you may hit, what they mean, how to fix them |

## Technical Documentation Index

| # | Document | Contents |
| --- | --- | --- |
| 1 | [`01-project-scope.md`](./01-project-scope.md) | Product overview, in-scope / out-of-scope, system boundaries, users & use cases |
| 2 | [`02-architecture.md`](./02-architecture.md) | Tech stack, backend & frontend layout, request flow, services, ID generation, automation |
| 3 | [`03-operations-modules.md`](./03-operations-modules.md) | Module-by-module working details for every feature |
| 4 | [`04-roles-permissions.md`](./04-roles-permissions.md) | Custom RBAC, modules × actions, field-level permissions, seeded roles, data scoping |
| 5 | [`05-database-schema.md`](./05-database-schema.md) | Entities, relationships, status enums, soft deletes, indexes, `sequences` |
| 6 | [`06-operations.md`](./06-operations.md) | Install, run, seed, scheduled automation, testing, code style, SMTP ops |
| 7 | [`07-security-hardening.md`](./07-security-hardening.md) | Authentication, throttling, OTP, CSV safety, secrets, permissions |
| 8 | [`08-glossary.md`](./08-glossary.md) | Domain terms used across the product and documentation |
| 9 | [`09-project-proposal.md`](./09-project-proposal.md) | Market-research-backed project proposal for real estate agencies (Qodeigence Inc., QREX), incl. positioning, pricing tiers, ROI |
| 10 | [`10-budget-pricing-mumbai.md`](./10-budget-pricing-mumbai.md) | Year-1 Mumbai launch budget and SaaS + PaaS pricing plan: market research, two-layer pricing, revenue projections, opex, break-even, GST/billing |

## Business Proposal

A client-facing, market-research-backed proposal for pitching QREX to real estate agencies is available in [`09-project-proposal.md`](./09-project-proposal.md).

## Executive Summary

QREX pairs a **public-facing real-estate website** with an **internal admin CRM suite**. It covers the full sales lifecycle for a real-estate agency:

- **Public visitors** browse and filter property listings, view property galleries, and submit contact / property enquiries.
- **Enquiries automatically become leads** in the CRM.
- **Agents** manage leads through a status lifecycle, log activity, reassign/hand over leads, and schedule site visits.
- **Deals** are tracked on a Kanban-style pipeline from *New Lead* through to *Closed Won / Closed Lost*.
- **Operations** staff manage properties (with image galleries), customers, site visits, bookings, and payments.
- **Marketing** users run campaigns and manage media assets.
- **Management** monitors dashboards and reports with CSV/PDF export.
- **Super-admins** control users, roles, permissions, CMS content, and SMTP mail configuration.

The application follows the Latte stack: **Laravel 13** + **Inertia 3** + **React 19** + **TypeScript** + **Tailwind CSS 4** + **Vite 8**.