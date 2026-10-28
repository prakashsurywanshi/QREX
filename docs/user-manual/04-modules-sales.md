# 4. Sales Modules

Covers **Dashboard**, **Properties**, **Amenities**, **Leads**, **Customers** and **Site Visits**.

| Module | Who can see it |
| --- | --- |
| Dashboard | Everyone with a login |
| Properties | Super Admin, Admin, Sales Executive, Senior Agent |
| Amenities | Super Admin, Admin |
| Leads | Super Admin, Admin, Sales Executive, Senior Agent, Marketing User (view + create) |
| Customers | Super Admin, Admin, Sales Executive, Senior Agent, Accountant (view) |
| Site Visits | Super Admin, Admin, Sales Executive, Senior Agent |

---

## 4.1 Dashboard

**URL:** `/admin/dashboard` · **Permission:** `dashboard.view`

### Layout

**Six KPI cards** (see [`01-overview-and-getting-started.md`](./01-overview-and-getting-started.md#143-the-dashboard) for what each measures).

**Range switcher** — Today · 7 Days · 30 Days · 90 Days · YTD · All. Every figure and chart on the page follows the selected range. It applies to the whole page, not just the charts.

**Five chart groups**

| Chart | What it answers |
| --- | --- |
| Revenue by month | Are we trending up? |
| Lead sources | Where is demand coming from? |
| Pipeline funnel | Where are deals getting stuck? |
| Agent performance | How is each agent doing? |
| Monthly bookings | How many bookings are we closing per month? |

**Six lists**

| Panel | Use it for |
| --- | --- |
| Recent leads | Picking up where you left off |
| Upcoming visits | Today's and tomorrow's site visits |
| Recent bookings | Newly booked business |
| Recent payments | Money that just landed |
| Follow-ups due | Your overdue and due-today follow-ups |
| Recent activity | A live feed of what the team has been doing |

Plus **Featured properties**, so you can see at a glance what is being pushed on the public site.

### Scoping

Sales Executives and Senior Agents see figures for their own book of business only. Admins and Super Admins see the whole agency.

---

## 4.2 Properties

**URL:** `/admin/properties` · **Permissions:** `properties.view` / `.create` / `.edit` / `.delete`

Properties are the inventory. They feed the public website, the pipeline (a deal points at a property), and the reports.

### 4.2.1 The list

**Filters** (stick in the URL, so a filtered view can be bookmarked or shared):

| Filter | Values |
| --- | --- |
| **Search** | Matches title, city and type |
| **Status** | All · Available · Reserved · Under Negotiation · Sold · Draft · Rented · Inactive |
| **Type** | All · Apartment · Villa · Plot · Commercial · Office · Shop · Warehouse · Farm/Land · Other |
| **Featured** | All · Featured · Not featured |

The grid shows each property's **cover image** (the image flagged as cover, otherwise the first image, otherwise a placeholder), its title, city and price label. **Delete** is available where you hold `properties.delete` and asks for confirmation.

### 4.2.2 Creating a property — a five-step wizard

**Properties** → **Add Property** (or the *Add Property* item in the **Quick Add** menu).

The wizard has five steps. You can jump back and forth freely using the stepper at the top, but you must complete all five before the property is saved.

#### Step 1 — Basic Info

| Field | Notes |
| --- | --- |
| **Title** | The headline. Appears on the public site and in every dropdown. Be specific: *"Skyline Heights — 3BHK"* beats *"Skyline Heights"* |
| **Type** | Apartment · Villa · Plot · Commercial · Office · Shop · Warehouse · Farm/Land · Other. **This choice drives step 2 and step 4** |
| **Transaction type** | Buy · Rent · Lease |
| **Description** | The long copy on the public page. Include the sell points, the locality, the reason to buy |
| **Status** | Available · Reserved · Under Negotiation · Sold · Draft · Rented · Inactive. Leave it **Available** until the property is really on the market; use **Draft** for a listing you are not publishing yet |

#### Step 2 — Pricing & Specs

Which fields appear depends on the **type** chosen in step 1. The catalogue decides what is shown, what is required, and even what the area input is called:

| Type | Fields shown | Area label | Not shown |
| --- | --- | --- | --- |
| **Apartment** | price, area, bedrooms, bathrooms, floors, parking, furnishing, possession date | Built-up Area (sq.ft) | — |
| **Villa** | price, area, bedrooms, bathrooms, floors, parking, furnishing, possession date | Built-up Area (sq.ft) | — |
| **Plot** | price, area, parking, possession date | **Plot Area (sq.ft)** | bedrooms, bathrooms, floors, furnishing |
| **Commercial** | price, area, bathrooms, floors, parking, possession date | **Carpet Area (sq.ft)** | bedrooms, furnishing |
| **Office** | price, area, bathrooms, floors, parking, furnishing, possession date | **Carpet Area (sq.ft)** | bedrooms |
| **Shop** | price, area, bathrooms, parking, possession date | **Carpet Area (sq.ft)** | bedrooms, floors, furnishing |
| **Warehouse** | price, area, parking, possession date | **Carpet Area (sq.ft)** | bedrooms, bathrooms, floors, furnishing |
| **Farm/Land** | price, area, possession date | **Land Area (acres)** | bedrooms, bathrooms, floors, parking, furnishing |
| **Other** | all of them | **Area (sq.ft)** | — |

**Price and area are always required.** The rest depends on the type.

> The area unit is a *label*, not a conversion. If your type is Farm/Land the box says "Land Area (acres)" but the value is stored as entered — so for a 5-acre plot, enter `5`, not `217,800`.

**Furnishing** values: Unfurnished · Semi-Furnished · Fully Furnished.

**Price** is entered in whole rupees (`18500000` for ₹1.85 Cr) and displayed short automatically.

#### Step 3 — Location

Address · City · State · Country · Pincode. **City** matters most — the public site's filter and the home-page city list are driven by it. The cities the public search offers by default are Mumbai, Bangalore, Pune and Gurugram; other cities still work, they just are not offered in the quick filter.

#### Step 4 — Amenities

A checklist of the amenities that are valid for the chosen property type, plus a free-text box for anything custom.

- **Amenities not valid for the type are pruned automatically.** If you switch from Apartment to Plot after ticking "Swimming Pool", the form tells you it was removed and unsaves it.
- **Custom amenities you typed yourself are never pruned** — they stay.
- The list of valid amenities per type is maintained in the **Amenities** module (see §4.3).

#### Step 5 — Gallery & Website

| Field | Notes |
| --- | --- |
| **Photos** | Upload several at once. The first one is the cover by default; you can set another as cover |
| **Remove photos** | Tick the ones to drop when you save. Existing photos can also be removed individually |
| **Featured** | Featured properties appear in the featured block on the public home page |
| **Show on website** | The master switch. **A property with this off is invisible to the public**, even on a direct link |
| **SEO title** | Overrides the page title in search results. Leave blank to use the property title |
| **Meta description** | The blurb under the title in search results |
| **Assigned agent** | The agent shown on the public property page, with their name, phone and email |

Save and you land back on the list with a green *"Property created successfully."*

### 4.2.3 The property detail page

Gallery · specifications (grouped into cards, following the type's rules) · amenities · the **leads** interested in this property · the **share link** for the public page · and the **Edit** / **Delete** actions.

### 4.2.4 Property status — what each one means

| Status | Meaning | Effect on the public site |
| --- | --- | --- |
| **Available** | On the market | Listed |
| **Reserved** | Someone has an option on it | Still listed, but not really available |
| **Under Negotiation** | Deals in progress | Still listed |
| **Sold** | Done | Usually still listed as a sold listing |
| **Rented** | Let, not sold | Listed |
| **Draft** | Not ready | Not published |
| **Inactive** | Withdrawn | Not published |

**Visibility is controlled separately** by the *Show on website* toggle in step 5. A property can be `Available` but not visible, and a property can be `Sold` and still visible as a sold listing.

---

## 4.3 Amenities

**URL:** `/admin/amenities` · **Permissions:** `amenities.view` / `.create` / `.edit` / `.delete`

Amenities are the **catalogue** of features that can be attached to a property. The catalogue is **per property type** — "Swimming Pool" is valid for an Apartment and a Villa, but not for a Plot or a Warehouse.

### Using it

1. **Pick a property type** at the top of the page. The list below switches to that type's amenities.
2. **Add one** — name, optional icon, active by default.
3. **Bulk add** — paste a list of names separated by **newlines or commas**, and they are created in one go. This is the fast way to set up a new property type.
4. **Edit** any amenity — rename it, change its icon, set its **sort order** (controls the order it appears in the property form's checklist), or toggle it **active/inactive**.
5. **Delete** one if it is no longer offered.

> **Active vs inactive.** An inactive amenity is not offered in the property form, but it stays on properties that already have it — so existing listings are not broken. Deactivate rather than delete if you might need it again.

> **Governance.** Only Super Admins and Admins can change the amenity catalogue. If a Sales Executive tells you an amenity is missing from the checklist, it is an Admin task.

---

## 4.4 Leads

**URL:** `/admin/leads` · **Permissions:** `leads.view` / `.create` / `.edit` / `.delete`

A lead is a person who has shown interest. This is the busiest module in the system.

### 4.4.1 The list

**Filters:** Search (name, phone, email) · Status · Source · Campaign. 10 records per page, newest first.

**Columns** typically show the lead's ID, name, phone, source, status, budget, assigned agent and next follow-up.

### 4.4.2 Creating a lead by hand

**Leads** → **New lead** (or *Add Lead* in the **Quick Add** menu):

| Field | Notes |
| --- | --- |
| **Name** | Required |
| **Phone** | Required. **Treated as the unique key** — a phone already in the system is flagged as a duplicate on import |
| **Email** | Optional |
| **Source** | Where they came from. **Set this correctly at creation** — it drives the lead-source and campaign reports |
| **Status** | Normally **New** |
| **Budget** | Free text, e.g. "1.5 Cr" or "50-60 L" |
| **Preferred location** | Free text |
| **Score** | 0–100. A manual priority indicator — there is **no automatic scoring engine** |
| **Assigned agent** | Who owns it |
| **Interested property** | Which listing they asked about |
| **Next follow-up** | Creates the follow-up task automatically |

**Sources:** Website · Facebook · Instagram · Google · Referral · Walk-in · Phone · WhatsApp · Campaign · Other

**Statuses:** New · Contacted · Qualified · Site Visit Scheduled · Site Visit Completed · Negotiation · Converted · Lost

### 4.4.3 The lead detail page

Four things live here:

1. **The activity timeline** — every call, message, meeting, status change, handover and conversion, oldest first. It is the mechanism described in [`03-sales-lifecycle.md`](./03-sales-lifecycle.md#331-the-activity-timeline).
2. **Log an activity** — the form described in [`03-sales-lifecycle.md`](./03-sales-lifecycle.md#33-step-3-make-contact-and-log-it).
3. **Edit the lead** — name, phone, email, source, status, budget, preferred location, assigned agent, owner, campaign, next follow-up, score.
4. **Actions** — change status, hand over, convert to deal.

### 4.4.4 Changing the status

Use the status control on the lead. The rules:

- Valid values are enforced — an invalid status is rejected with a validation error.
- Every change is logged as a *Status Change* activity.
- Setting **Site Visit Scheduled** auto-creates a Site Visit and notifies the agent (once per lead).
- Setting **Converted** or **Lost** is a terminal state — the lead can still be edited, but it can no longer be converted to a deal.

### 4.4.5 Handing a lead over

**Reassign** on the lead detail page:

| Field | Notes |
| --- | --- |
| **New agent** | Who is taking it over |
| **Reason** | Workload distribution · Specialist required · Out of office · Regional availability · Other |
| **Notes** | Free text for context |

What happens:

1. **Both** the *assigned agent* and the *owner* are moved to the new agent, so the lead appears in their list immediately.
2. A **handover record** is created capturing who had it, who has it now, why and any notes.
3. A *Reassignment* activity is logged on the timeline.

> The handover record is only written **if the agent actually changed**. Re-saving the same agent does not create noise.

### 4.4.6 Bulk import leads from CSV

For a campaign that generated hundreds of enquiries, importing is far faster than typing.

**Leads** → **Import** → download the template first (**Import template** button) so your columns line up.

#### The template

Header row and one example row:

```
name,phone,email,source,status,budget,preferred_location,requirements,score,next_followup
John Doe,+919876543210,john@example.com,Website,New,1.5 Cr,Andheri West,2/3 BHK ready to move,50,
```

#### Rules

| Rule | Detail |
| --- | --- |
| File type | `.csv` or `.txt` |
| Maximum size | **2 MB** |
| Header row | Optional. If the first row is not a header, the columns are read **positionally** in the order above |
| Column names | Case, spaces and underscores are ignored. Aliases are accepted (see below) |
| Required per row | **Name** and **Phone** |
| Score | Clamped to **0–100** |
| Unknown source | Falls back to **Campaign** |
| Unknown status | Falls back to **New** |
| Property / agent reference | Matched by **ID** or by **fuzzy name** (a partial property title or agent name) |
| Everything happens in one transaction | If the file fails structurally, the whole import is rolled back and nothing is imported |

#### Accepted column aliases

| Column | Also accepted as |
| --- | --- |
| name | full_name, lead_name |
| phone | mobile, contact_number, phone_number |
| email | email_address, mail |
| source | lead_source |
| status | lead_status |
| budget | budget_range |
| preferred_location | location, city |
| interested_property | property |
| assigned_agent | agent, agent_name |
| score | lead_score |
| requirements | notes, requirement |
| next_followup | followup, next_follow_up |

#### Rows that get skipped

| Reason | Message |
| --- | --- |
| No name or no phone | *"Row N: name and phone are required."* |
| Same phone twice in the file | *"Row N: duplicate lead within file (Name / Phone)."* |
| Phone already exists in the system | *"Row N: duplicate lead (Name / Phone)."* |

Skipped rows do not stop the rest of the file. The result message reads *"N lead(s) imported, M row(s) skipped"*, with the per-row reasons listed.

> **Watch the flash colour.** A clean import shows a green toast. An import with skipped rows uses the *warning* channel, which the UI renders less prominently. **Always read the per-row errors** — a partially failed import still imports the good rows, so a count alone will not tell you that three leads were dropped.

Each imported lead gets a *Lead Imported* activity, and a follow-up task if the row supplied a next-follow-up date.

### 4.4.7 Converting to a deal

Covered in full in [`03-sales-lifecycle.md`](./03-sales-lifecycle.md#36-step-6-convert-the-lead-into-a-deal). The **Convert to Deal** button appears only if you hold `sales.create` and the lead is neither `Converted` nor `Lost`.

---

## 4.5 Customers

**URL:** `/admin/customers` · **Permissions:** `customers.view` / `.create` / `.edit`

A **customer** is a buyer or seller in their own right — as opposed to a lead, who is a lead *in a conversation*. A customer record is long-lived; a lead may become one.

### Creating a customer

**Customers** → **New customer**:

| Field | Notes |
| --- | --- |
| **Name** | Required |
| **Phone / Email** | |
| **Type** | Residential Buyer · Commercial Buyer · Investor · Renter · Seller |
| **Status** | Prospect · Active · Buyer · Investor · Past Customer |
| **City** | |

The list can be filtered by **search** and by **status**.

### The customer detail page

Edit name, phone, email, type, status, city, **requirements** (free text — what they are looking for) and the **linked agent**.

> **Buyers and Investors appear in both dropdowns.** `Buyer` and `Investor` are valid *types* and also valid *statuses*. Pick deliberately: type describes **what they are**, status describes **where they are** in the relationship.

### Lead vs customer — which do I use?

| Use a **Lead** when | Use a **Customer** when |
| --- | --- |
| Someone is enquiring and you are working them | Someone has signed, or is a repeat buyer |
| You need the pipeline status and follow-up machinery | You need to keep a long-lived relationship record |
| It will become a deal | It may not ever involve a specific property |

A customer record is a **readable profile of the person**; a lead is **a process you are running**. It is entirely normal to have both for the same human.

---

## 4.6 Site Visits

**URL:** `/admin/site-visits` · **Permissions:** `site_visits.view` / `.create` / `.edit`

### Where visits come from

| Origin | How |
| --- | --- |
| **Automatic** | A lead's status is set to *Site Visit Scheduled*. One visit per lead — no duplicates |
| **Manual** | **Site Visits** → **New visit** |

### Creating a visit by hand

| Field | Notes |
| --- | --- |
| **Customer name** | |
| **Property name** | |
| **Agent name** | |
| **Visit date** | |
| **Visit time** | |
| **Location** | |
| **Notes** | |

A visit gets ID `SV-###` and starts as **Scheduled**.

### Statuses

**Scheduled** → **Confirmed** → **Completed**, with **Rescheduled** and **Cancelled** as the alternatives.

| Status | Meaning |
| --- | --- |
| **Scheduled** | Created, not yet confirmed with the customer |
| **Confirmed** | The customer has agreed to the slot |
| **Completed** | The visit happened |
| **Rescheduled** | Moved to another date or time |
| **Cancelled** | It will not happen |

Change the status from the list. Add **feedback** and **notes** on the visit — the feedback is what you negotiate with, and what the site-visit report counts.

> The **site-visit report** groups *Scheduled* and *Confirmed* together as "scheduled", and counts completed, cancelled and rescheduled separately.

---

**Next:** [`05-modules-operations.md`](./05-modules-operations.md) — Sales Pipeline, Tasks, Bookings, Payments, Notifications.
