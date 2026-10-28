# 8. Reference

Everything in one place: every status value, every field, every ID format and every permission slug.

---

## 1. Record ID Formats

Every record carries a short, human-readable ID. Use these in emails, chats and reports — they are unambiguous and never change.

| Record | Prefix | Example | Where you see it |
| --- | --- | --- | --- |
| Lead | `L` | `L-006` | Leads list, lead detail, the timeline |
| Deal | `DL` | `DL-012` | Pipeline cards, reports |
| Task | `TSK` | `TSK-005` | Tasks list |
| Site visit | `SV` | `SV-003` | Site Visits list |
| Booking | `B` | `B-001` | Bookings list, booking detail |
| Payment | `PAY` | `PAY-001` | Payments list |
| Campaign | `CAM` | `CAM-001` | Marketing module |
| Customer | `C` | `C-001` | Customers list |
| Property | `PROP` | `PROP-001` | Properties list, property detail |
| User | `U` | `U-001` | Users list |

The number is zero-padded to three digits. A property also has an **encrypted public link** used in the public URL, which looks nothing like the ID — use the **Share** button rather than constructing it.

---

## 2. Status Vocabularies

> **Always choose from the dropdown.** These are the values the system offers. The lead status list is validated on the server; the other lists are not, so a hand-crafted request could store something else. Nothing in the UI benefits from that, and it would break the reports.

### 2.1 Lead status (8 values)

| Value | Meaning |
| --- | --- |
| `New` | Just arrived, untouched. **Default** |
| `Contacted` | First contact made |
| `Qualified` | Real budget and requirement confirmed |
| `Site Visit Scheduled` | A visit is on the calendar. **Auto-creates a site visit** |
| `Site Visit Completed` | The customer has seen the property |
| `Negotiation` | Terms under discussion |
| `Converted` | Became a deal. **Terminal** — conversion is blocked |
| `Lost` | Not going ahead. **Terminal** — conversion is blocked |

### 2.2 Lead source (9 values)

`Website` · `Facebook` · `Instagram` · `Google` · `Referral` · `Walk-in` · `Phone` · `WhatsApp` · `Campaign` · `Other`

| Note | Detail |
| --- | --- |
| Website enquiries | Always create a lead with source `Website` |
| CSV import fallback | An unrecognised source becomes **`Campaign`** |
| Marketing's website panel | Counts only `source = Website` |
| Report breakdown | The lead-source chart groups by this field |

### 2.3 Deal / pipeline stage (12 values)

| # | Stage | Active? | Default for |
| --- | --- | --- | --- |
| 1 | `New Lead` | Yes | A deal created directly on the board |
| 2 | `Contacted` | Yes | |
| 3 | `Qualified` | Yes | **A converted lead** |
| 4 | `Property Shortlisted` | Yes | |
| 5 | `Site Visit Scheduled` | Yes | |
| 6 | `Site Visit Completed` | Yes | |
| 7 | `Negotiation` | Yes | |
| 8 | `Booking` | Yes | |
| 9 | `Agreement` | Yes | |
| 10 | `Payment` | Yes | |
| 11 | `Closed Won` | No | |
| 12 | `Closed Lost` | No | |

**Active** = not `Closed Won` and not `Closed Lost`. The pipeline value, active count and expected revenue are all computed over active deals only.

### 2.4 Booking status (5 values)

`Booking Pending` · `Booking Confirmed` · `Under Agreement` · `Agreement Signed` · `Cancelled`

Default: **`Booking Pending`**

### 2.5 Booking agreement status (3 values)

`Pending` · `Under Review` · `Signed`

Default: `Pending`

### 2.6 Booking possession status (3 values)

`Pending` · `In Process` · `Handed Over`

Default: `Pending`

### 2.7 Payment status (5 values)

| Value | Meaning | In the "pending" bucket? |
| --- | --- | --- |
| `Pending` | Expected, not received | Yes |
| `Partially Paid` | Some received | Yes |
| `Paid` | Fully received | No — counted as received |
| `Overdue` | Due date passed, not received | Yes |
| `Cancelled` | Will not be collected | No — excluded from every total |

Default: `Pending`

### 2.8 Payment mode (7 values)

`RTGS` · `NEFT` · `IMPS` · `UPI` · `Cheque` · `Bank Transfer` · `Cash`

Default in the Payments form: `RTGS`. Default when recording from a booking: `Bank Transfer`.

### 2.9 Task status (4 values)

| Value | Meaning |
| --- | --- |
| `Pending` | Not started. **Default** |
| `In Progress` | Being worked on |
| `Overdue` | The due date has passed. Set automatically by the daily sweep and on creation if the date is already past |
| `Completed` | Done |

### 2.10 Task priority (4 values)

`Low` · `Medium` · `High` · `Urgent`

Default: `Medium`. **Auto-created follow-up tasks always use `High`.**

### 2.11 Task type (8 values)

`Follow-up` · `Call` · `Meeting` · `Site Visit` · `Email` · `Document` · `Task` · `Other`

Default: `Follow-up`. Only tasks of type `Follow-up` are considered by the daily overdue sweep.

### 2.12 Site visit status (5 values)

`Scheduled` · `Confirmed` · `Completed` · `Rescheduled` · `Cancelled`

Default: `Scheduled`. The site-visit report groups `Scheduled` and `Confirmed` together.

### 2.13 Customer type (5 values)

`Residential Buyer` · `Commercial Buyer` · `Investor` · `Renter` · `Seller`

### 2.14 Customer status (5 values)

`Prospect` · `Active` · `Buyer` · `Investor` · `Past Customer`

Default: `Prospect`

> `Buyer` and `Investor` appear in **both** the type list and the status list. Type describes what they are; status describes where they are.

### 2.15 Property status (7 values)

`Available` · `Reserved` · `Under Negotiation` · `Sold` · `Draft` · `Rented` · `Inactive`

| Value | Meaning |
| --- | --- |
| `Available` | On the market |
| `Reserved` | An option is held on it |
| `Under Negotiation` | Deals in progress |
| `Sold` | Done |
| `Draft` | Not ready to publish |
| `Rented` | Let, not sold |
| `Inactive` | Withdrawn |

> Two further values, **`Ready to Move`** and **`Under Construction`**, are read by the Marketing module's "property promotions" carousel but are **not** offered in the property status dropdown. If a listing should appear in that carousel, its status must be set to one of them — which means it will not match the standard status list.

### 2.16 Property type (9 values) and the spec rules

Each type controls which specification fields the property form shows.

| Type | Fields shown | Area label |
| --- | --- | --- |
| `Apartment` | price, area, bedrooms, bathrooms, floors, parking, furnishing, possession date | Built-up Area (sq.ft) |
| `Villa` | price, area, bedrooms, bathrooms, floors, parking, furnishing, possession date | Built-up Area (sq.ft) |
| `Plot` | price, area, parking, possession date | Plot Area (sq.ft) |
| `Commercial` | price, area, bathrooms, floors, parking, possession date | Carpet Area (sq.ft) |
| `Office` | price, area, bathrooms, floors, parking, furnishing, possession date | Carpet Area (sq.ft) |
| `Shop` | price, area, bathrooms, parking, possession date | Carpet Area (sq.ft) |
| `Warehouse` | price, area, parking, possession date | Carpet Area (sq.ft) |
| `Farm/Land` | price, area, possession date | Land Area (acres) |
| `Other` | all fields | Area (sq.ft) |

**Price and area are always required.** The area unit is a label only — the number is stored exactly as entered.

### 2.17 Other property vocabularies

| Field | Values |
| --- | --- |
| **Transaction type** | `Buy` · `Rent` · `Lease` |
| **Furnishing** | `Unfurnished` · `Semi-Furnished` · `Fully Furnished` |

### 2.18 Campaign status (4 values)

`Scheduled` · `Active` · `Paused` · `Completed`

A campaign is created as **`Scheduled`**.

### 2.19 User status (2 values)

`Active` · `Inactive`

An **Inactive** account cannot sign in, even with the correct password.

### 2.20 Lead activity type (7 user-selectable + 4 system)

**User-selectable:** `Call` · `WhatsApp` · `SMS` · `Email` · `Site Visit` · `Meeting` · `Note`

**Generated by the system:** `Lead Imported` · `Status Change` · `Reassignment` · `Conversion`

### 2.21 Lead activity outcome (depends on the type)

| Type | Outcomes |
| --- | --- |
| `Call` | Connected · No Answer · Busy · Voicemail · Callback Requested · Not Interested |
| `WhatsApp` | Replied · Pending · Read |
| `SMS` | Sent · Delivered · Pending |
| `Email` | Sent · Opened · Replied · Bounced |
| `Site Visit` | Scheduled · Completed · Cancelled · Rescheduled |
| `Meeting` | Scheduled · Completed · Cancelled · Rescheduled |
| `Note` | *(none)* |

### 2.22 Lead handover reason (5 values)

`Workload distribution` · `Specialist required` · `Out of office` · `Regional availability` · `Other`

---

## 3. Module Field Reference

### 3.1 Lead

| Field | Notes |
| --- | --- |
| Lead ID | `L-###`, auto-generated |
| Name | Required |
| Phone | Required. The duplicate-detection key |
| Email | Optional |
| Source | See §2.2 |
| Status | See §2.1 |
| Budget | Free text |
| Preferred location | Free text |
| Requirements | Free text — where website enquiry messages are stored |
| Score | 0–100, manual. **No automatic scoring engine** |
| Assigned agent | The working agent |
| Owner | Retains ownership. Moves with the assigned agent on handover |
| Campaign | Attribution |
| Interested property | The listing they asked about |
| Next follow-up | Date and time. Drives the follow-up task |
| Last contact | Stamped every time an activity is logged |
| Created by | The user who created the lead |

### 3.2 Deal

| Field | Notes |
| --- | --- |
| Deal ID | `DL-###` |
| Customer name | Copied from the lead on conversion |
| Property | Optional link to a listing |
| Lead | The source lead, if any |
| Deal value | Required |
| Value label | Auto-formatted ₹Cr / ₹L |
| Stage | See §2.3 |
| Probability | 0–100. Default 10 direct, **30 on conversion** |
| Days in stage | Recomputed from the last stage change |
| Stage changed at | Reset on every move |
| Assigned agent | Carried over from the lead |

### 3.3 Property

| Field | Notes |
| --- | --- |
| Property ID | `PROP-###` |
| Title | Required |
| Type | See §2.16 |
| Transaction type | Buy · Rent · Lease |
| Description | The public long copy |
| Status | See §2.15 |
| Price | Whole rupees, required. Displayed short |
| Area | Required. The label depends on the type |
| Bedrooms, Bathrooms, Floors, Parking | Type-dependent |
| Furnishing | Type-dependent |
| Possession date | Type-dependent |
| Address, City, State, Country, Pincode | Location |
| Latitude, Longitude | Optional |
| Amenities | A list. Curated per type, plus custom entries |
| Images | Multiple. One is the cover |
| Featured | Appears in the featured block |
| Show on website | The master public-visibility switch |
| SEO title, Meta description | Search-result overrides |
| Slug | Generated |
| Agent | Who is shown on the public page |

### 3.4 Customer

Name · Phone · Email · Type · Status · City · Requirements · Agent

### 3.5 Site visit

Visit ID (`SV-###`) · Customer name · Property name · Agent name · Visit date · Visit time · Status · Location · Notes · Feedback · Lead (link)

### 3.6 Booking

Booking ID (`B-###`) · Customer name · Property name · Agent name · Booking date · Deal value · Booking amount · Status · Agreement status · Possession status

### 3.7 Payment

Payment ID (`PAY-###`) · Customer name · Property name · Amount · Mode · Transaction id · Due date · Paid date · Status

### 3.8 Task

Task ID (`TSK-###`) · Title · Description · Type · Priority · Status · Due date · Due time · Assigned to · Created by · Related to (Lead) · Lead

### 3.9 Campaign

Campaign ID (`CAM-###`) · Name · Channel · Budget · Spent · Leads · Conversions · Revenue · ROI · Status · Start date · End date

### 3.10 Media file

Name · Folder · Property · Size · File · Type

### 3.11 User

User ID (`U-###`) · Name · Email · Phone · Role · Branch · Status · Avatar · Last login

### 3.12 Lead activity

Type · Title · Description · Duration · Outcome · Contact number · Email subject · Next follow-up · Location · User · Created at

---

## 4. Notification Types

| Type | Title you will see | Trigger | Recipient |
| --- | --- | --- | --- |
| `lead.converted` | Lead converted to deal | A lead is converted | The lead's assigned agent |
| `site_visit.scheduled` | Site visit scheduled | A lead reaches *Site Visit Scheduled* | The lead's assigned agent |
| `deal.created` | New deal assigned | A deal is created with an agent | That agent |
| `booking.created` | *(booking created)* | A booking is created | The creator |
| `payment.received` | *₹ amount received* | A payment is recorded against a booking | The customer/agent on the booking |
| `followup` | Follow-up due today / Follow-up overdue | The daily 09:00 sweep | The task's assignee |

---

## 5. Automation Reference

| What | When | What it does |
| --- | --- | --- |
| **Follow-up sweep** | Daily at **09:00** | Flags past-due follow-up tasks as `Overdue` and notifies the assignee. Skips tasks with no assignee. No repeat unread notice for the same lead within **12 hours** |
| **Follow-up task sync** | Whenever a lead's next-follow-up date is set, changed or cleared | Creates, updates or completes the lead's follow-up task |
| **Site visit auto-create** | When a lead's status becomes `Site Visit Scheduled` | Creates the site visit (once per lead) and notifies the agent |
| **Deal conversion** | On converting a lead | Creates the deal, sets the lead to `Converted`, logs the activity, notifies the agent |
| **Payment on booking** | When recording a payment from a booking | Creates a `Paid` payment and notifies the customer |
| **Lead auto-creation** | On a public enquiry | Creates the lead with source `Website`, status `New` |

**Accepted follow-up date formats:** `2026-10-21` · `2026/10/21` · `21-10-2026` · `21/10/2026`
**Accepted time formats:** `10:00 AM` · `17:30`
**If no date parses, the system falls back to tomorrow.**

---

## 6. Permission Catalog

**132 permissions across 17 modules: 67 action permissions and 65 field-level permissions.**

### 6.1 Action permissions (67)

| Module | Slugs |
| --- | --- |
| dashboard | `dashboard.view` |
| properties | `properties.view` · `properties.create` · `properties.edit` · `properties.delete` · `properties.export` |
| leads | `leads.view` · `leads.create` · `leads.edit` · `leads.delete` · `leads.export` |
| customers | `customers.view` · `customers.create` · `customers.edit` · `customers.delete` · `customers.export` |
| sales | `sales.view` · `sales.create` · `sales.edit` · `sales.delete` · `sales.export` |
| tasks | `tasks.view` · `tasks.create` · `tasks.edit` · `tasks.delete` |
| site_visits | `site_visits.view` · `site_visits.create` · `site_visits.edit` · `site_visits.delete` |
| bookings | `bookings.view` · `bookings.create` · `bookings.edit` · `bookings.delete` · `bookings.approve` |
| payments | `payments.view` · `payments.create` · `payments.edit` · `payments.delete` · `payments.export` |
| media | `media.view` · `media.create` · `media.delete` |
| marketing | `marketing.view` · `marketing.create` · `marketing.edit` · `marketing.delete` · `marketing.export` |
| reports | `reports.view` · `reports.export` |
| cms | `cms.view` · `cms.create` · `cms.edit` · `cms.delete` |
| users | `users.view` · `users.create` · `users.edit` · `users.delete` |
| settings | `settings.view` · `settings.edit` |
| roles | `roles.view` · `roles.create` · `roles.edit` · `roles.delete` |
| amenities | `amenities.view` · `amenities.create` · `amenities.edit` · `amenities.delete` |

> `bookings.approve` and several `export` slugs exist in the catalogue but are not yet checked by any admin screen. Holding them currently has no visible effect. `reports.export` **is** checked — it gates the CSV export button.

### 6.2 Field-level permissions (65)

All follow the pattern `{module}.edit.{field}`.

> **Only the `settings.edit.*` fields are enforced by the application.** Every other field permission below is seeded into the catalogue but is not read by any admin screen or controller — holding it, or lacking it, makes no difference today. Treat the table as the grant that the seeder records, not as a live restriction.

| Module | Field slugs |
| --- | --- |
| properties | `properties.edit.price` · `.title` · `.status` · `.description` · `.area` · `.bedrooms` · `.bathrooms` · `.amenities` · `.featured` · `.agent` |
| leads | `leads.edit.name` · `.phone` · `.email` · `.source` · `.status` · `.budget` · `.assigned_agent` · `.score` |
| customers | `customers.edit.name` · `.phone` · `.email` · `.type` · `.budget` · `.notes` |
| tasks | `tasks.edit.title` · `.status` · `.priority` · `.due_date` · `.assigned_to` |
| site_visits | `site_visits.edit.date` · `.time` · `.status` · `.feedback` · `.notes` |
| bookings | `bookings.edit.amount` · `.status` · `.payment_mode` · `.notes` |
| payments | `payments.edit.amount` · `.status` · `.mode` · `.date` · `.notes` |
| marketing | `marketing.edit.name` · `.budget` · `.status` · `.channels` · `.content` |
| cms | `cms.edit.content` · `.featured` · `.seo` |
| users | `users.edit.name` · `.email` · `.phone` · `.role` · `.branch` · `.status` · `.password` |
| settings | `settings.edit.project_name` · `.agency_name` · `.contact_email` · `.contact_phone` · `.address` · `.tagline` · `.logo` — **enforced** |

### 6.3 Who holds what — a quick matrix

| Role | Action permissions | Field-level permissions |
| --- | --- | --- |
| **Super Admin** | All 67 | All 65 |
| **Admin** | All 67 **except** `roles.delete` | All 65 **except** `settings.edit.project_name` |
| **Sales Executive** | 19 | 7 (`leads.edit.*` except `source`) |
| **Senior Agent** | 22 | 8 (all `leads.edit.*` including `source`) |
| **Marketing User** | 13 | none |
| **Accountant** | 12 | none |

**Sales Executive (19):** `dashboard.view` · `properties.view` `properties.create` `properties.edit` · `leads.view` `leads.create` `leads.edit` · `customers.view` `customers.create` `customers.edit` · `tasks.view` `tasks.create` `tasks.edit` · `site_visits.view` `site_visits.create` `site_visits.edit` · `media.view` `media.create` · `reports.view`

**Senior Agent (22):** everything a Sales Executive has, **plus** `leads.edit.source` · `sales.view` `sales.create` `sales.edit`

**Marketing User (13):** `dashboard.view` · `leads.view` `leads.create` · `marketing.view` `marketing.create` `marketing.edit` · `media.view` `media.create` · `cms.view` `cms.create` `cms.edit` · `reports.view` `reports.export`

**Accountant (12):** `dashboard.view` · `customers.view` · `sales.view` · `bookings.view` `bookings.create` `bookings.edit` · `payments.view` `payments.create` `payments.edit` · `reports.view` `reports.export` · `media.view`

### 6.4 Permissions with no UI check

These exist in the catalogue but no admin **screen** currently reads them. Holding them has no visible effect in the web UI — do not rely on them to protect anything.

| Permission | Why it is inert |
| --- | --- |
| `bookings.approve` | No screen checks it. Bookings use `bookings.edit` for the status controls |
| `properties.export` | There is no property export. `reports.export` is the only export the UI offers |
| `leads.export` | No lead export |
| `leads.delete` | There is no delete button on a lead. Use status `Lost` instead |
| `customers.export` | No customer export |
| `customers.delete` | There is no delete button on a customer |
| `sales.export` | No pipeline export |
| `sales.delete` | There is no delete button on a deal. Use `Closed Lost` instead |
| `site_visits.delete` | There is no delete button on a site visit. Use status `Cancelled` instead |
| `bookings.delete` | There is no delete button on a booking. Use status `Cancelled` instead |
| `payments.delete` | There is no delete button on a payment. Use status `Cancelled` instead |
| `payments.export` | No payment export |
| `marketing.delete` | There is no delete button on a campaign |
| `marketing.export` | No campaign export |
| `cms.create` | The CMS screen only edits existing sections and the featured selection |
| `cms.delete` | There is no delete button in the CMS |

**The web UI does offer delete for:** `properties.delete` · `amenities.delete` · `tasks.delete` · `media.delete` · `users.delete` · `roles.delete` — and all six are checked.

**Field-level permissions outside Settings.** All 58 field permissions for `properties`, `leads`, `customers`, `tasks`, `site_visits`, `bookings`, `payments`, `marketing`, `cms` and `users` are in the same category: catalogued but not enforced. No admin form hides a field on the basis of a field permission, and no controller rejects a field on that basis. The only enforced field permissions are the seven `settings.edit.*` slugs, checked by `SettingController`.

> The API exposes delete and export routes that the web UI does not, and those API routes **do** check the corresponding permission. If your integration calls the API, a delete may be refused even though the web UI offers no delete button.

---

## 7. Reference Tables

### 7.1 Money formatting

| Stored (rupees) | Displayed | Label |
| --- | --- | --- |
| `18,500,000` | ₹1.85 Cr | Crore |
| `850,000` | ₹8.50 L | Lakh |
| `45,000` | ₹45,000 | Rupees |

Amounts in words are available on the booking, payment and campaign forms: *Kharab · Arab · Crore · Lakh · Thousand*, suffixed with "Rupees Only".

### 7.2 Date and time

| Purpose | Format | Example |
| --- | --- | --- |
| Display | Day + abbreviated month + year | `21 Oct 2026` |
| Follow-up input | Any of four date formats | `2026-10-21`, `2026/10/21`, `21-10-2026`, `21/10/2026` |
| Time input | 12-hour or 24-hour | `10:00 AM`, `17:30` |
| Filename timestamps | `Ymd-His` | `report-revenue-20261021-093000.csv` |

### 7.3 Public URL routes

| Page | URL |
| --- | --- |
| Home | `/` |
| Properties | `/properties` |
| Property detail | `/properties/{encrypted-link}` |
| About | `/about` |
| Contact | `/contact` |
| Login | `/login` |
| Forgot password | `/forgot-password` |
| Reset password | `/reset-password/{token}/{email?}` |
| My profile | `/profile` |
| Admin area | `/admin/*` |
| Permission catalog | `/admin/permissions` |

### 7.4 Rate limits

| Action | Limit |
| --- | --- |
| Sign-in | 5 per minute |
| Forgot-password request | 5 per minute |
| Public contact enquiry | 5 per 10 minutes |
| Public property enquiry | 5 per 10 minutes |
| Email OTP resend | 1 per 60 seconds |
| Email OTP verification attempts | 5 per hour |
| Email OTP lifetime | 10 minutes |

### 7.5 File limits

| Item | Limit |
| --- | --- |
| Lead CSV import | 2 MB, `.csv` or `.txt` |
| Lead import columns | name, phone, email, source, status, budget, preferred_location, requirements, score, next_followup (+ optional interested_property, assigned_agent) |
| Logo | Uploaded to the `settings/` folder on the public disk |

### 7.6 PDF report export types

`revenue` · `leads` · `payments` · `agents` · `properties` · `sitevisits` · `campaigns` · `bookings`

An unrecognised type falls back to `revenue`.

---

## 8. Glossary

For the full domain glossary see [`../08-glossary.md`](../08-glossary.md). The terms you will meet most often:

| Term | Meaning |
| --- | --- |
| **Lead** | A prospect being worked. Has a status, an activity timeline and a follow-up task |
| **Customer** | A longer-lived buyer or seller record, independent of any one property |
| **Deal** | A lead that has become a live opportunity on the pipeline board |
| **Assigned agent** | Who is working the lead right now |
| **Owner** | Who retains the lead. Moves with the assigned agent on handover |
| **Handover** | A recorded transfer of a lead between agents, with a reason |
| **Follow-up task** | An auto-synced reminder derived from a lead's next-follow-up date |
| **Activity** | A logged interaction on a lead's timeline |
| **Outcome** | The result of an activity — Connected, Replied, Scheduled and so on |
| **Pipeline value** | The sum of all active deal values |
| **Expected revenue** | Deal value × probability, summed across active deals |
| **Conversion rate** | Won deals ÷ total deals |
| **Value label** | The short money form, ₹Cr or ₹L |
| **Website-visible** | The property switch that decides whether the public site shows a listing |
| **Featured** | A property, or a CMS selection, that appears in the home page highlights |
| **Agent scope** | The rule that limits a Sales Executive or Senior Agent to their own leads |
| **Field-level permission** | A `{module}.edit.{field}` permission restricting which boxes a user can change |
| **Readable ID** | The short code on a record, such as `L-006` |

---

**Next:** [`09-troubleshooting-and-faq.md`](./09-troubleshooting-and-faq.md)
