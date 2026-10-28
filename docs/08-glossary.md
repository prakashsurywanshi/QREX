# 8. Glossary

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
| **Super Admin / Admin / Sales Executive / Senior Agent / Marketing User / Accountant** | The six seeded roles controlling module access. See [`04-roles-permissions.md`](./04-roles-permissions.md). |
| **Field-level permission** | A permission of the form `{module}.{action}.{field}` (e.g., `leads.edit.phone`) that restricts which fields a user may edit. |
| **Agent scope** | The row-level rule that limits `sales-executive`/`senior-agent` users to leads they are assigned to or own. |
| **CSV import** | Bulk creation of leads from a CSV, with header aliasing, validation, deduplication, reference resolution, and per-row error reporting. |
| **Waterfall / funnel** | Report visualization of deals across pipeline stages (count and value per stage). |
| **Recharts** | The charting library used on the dashboard and reports pages. |
| **DomPDF** | The PDF renderer used for report PDF export. |
| **SMTP test mail** | A super-admin action that sends a real test email to verify DB-stored mail configuration. |