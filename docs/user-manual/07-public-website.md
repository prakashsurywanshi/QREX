# 7. The Public Website

The public site is the shop window. It is the first thing a prospective buyer sees, and it is the source of most of your leads.

**Who should read this:** visitors (as a guide), and marketing staff who need to know what a visitor can do and where the resulting data lands.

---

## 7.1 The Pages

| Page | URL | What is on it |
| --- | --- | --- |
| **Home** | `/` | Hero search, category tiles, featured properties, latest listings, agent cards, statistics, testimonials |
| **Properties** | `/properties` | The full searchable listing |
| **Property detail** | `/properties/{link}` | Gallery, specifications, amenities, agent card, enquiry form, similar properties |
| **About** | `/about` | Agency story, milestones, values, statistics, agent list |
| **Contact** | `/contact` | Enquiry form, office details, working hours, branch list |

The header carries the agency name (with its logo) and a **Login** button that takes staff to the admin area. The footer links to the same pages.

> **The property URL is an encrypted link.** The address bar shows a long encoded string, not the internal `PROP-001` id. This is deliberate — it stops people from walking the id sequence to enumerate your listings. **Use the Share button** on the property page to get a working link; do not try to construct one by hand.

---

## 7.2 Home

### The hero search

A single search bar at the top of the page with three fields:

| Field | Options |
| --- | --- |
| **Search** | Free text — matched against title, city and type |
| **Type** | All · Apartment · Villa · Plot · Commercial |
| **City** | All · Mumbai · Bangalore · Pune · Gurugram |

Submitting it takes the visitor to `/properties` with the filters applied.

> The hero's **Type** dropdown offers four types; the full **Properties** page offers all nine from the catalogue. A visitor who filters by *Office* on the properties page sees results the hero cannot produce.

### The rest of the home page

- **Category tiles** — Apartments · Villas · Plots & Land · Commercial, each with the number of visible listings of that type. Clicking one opens the filtered listing.
- **Featured properties** — the listings chosen in **CMS / Website → Featured properties**, provided they are also flagged `featured` on the property record and are visible on the website.
- **Latest properties** — the six most recently added visible listings.
- **Agent cards** — up to four team members whose role is *Sales Executive* or *Senior Agent*.
- **Statistics** — properties, deals, customers, clients, years in business and total revenue.
- **Testimonials** — three entries, and the section is **hidden by default** (see [`06-modules-marketing-and-admin.md`](./06-modules-marketing-and-admin.md#641-homepage-sections)).

> **About the "years in business" figure.** The home page derives it from the age of the oldest record in the system, so on a fresh demo database it reads 1. The About page shows fixed marketing figures (12 years, 1200 clients, ₹100 Cr+). These are placeholders for the agency's real numbers.

---

## 7.3 Properties — the searchable listing

**URL:** `/properties` · 6 listings per page.

### The filters

| Filter | Behaviour |
| --- | --- |
| **Search** | Matches the title, the city or the type (partial match) |
| **Type** | All, plus all nine types from the catalogue |
| **Status** | All · Available · Reserved · Under Negotiation · Sold |
| **Bedrooms** | An **exact** match — picking "3" shows 3-bedroom listings only, not 3-or-more |
| **Min price / Max price** | An inclusive price range, in rupees |
| **Sort** | Newest (default) · Price low to high · Price high to low · Featured first |

The filters live in the URL, so a filtered view can be bookmarked or shared. Changing any filter reloads the list in place.

### The cards

Each card shows the cover photo, the title, the type and transaction type, the city, the specification summary, the price label and the bedroom count.

> **Only listings with "Show on website" switched on appear here.** A property that is `Available` but not published is invisible — and so is a direct link to it (it 404s). Check the **Gallery & Website** step of the property form.

---

## 7.4 Property Detail

### What is on the page

| Block | Contents |
| --- | --- |
| **Gallery** | The cover photo first, then the rest. Click to enlarge |
| **Headline** | Title, type, transaction type, city and price |
| **Specifications** | Only the fields that apply to this property's type, in the same layout as the admin form |
| **Amenities** | The property's amenities, with the ones outside the standard catalogue marked |
| **Agent card** | The assigned agent's name, role, phone and email |
| **Enquiry form** | The conversion point — see below |
| **Similar properties** | Up to three other listings of the same type; if there are none, any three other visible listings |

### Sharing

The **Share** button uses the device's native share sheet where available and falls back to copying the link to the clipboard. The page also carries social-sharing metadata, so pasting the link into WhatsApp or LinkedIn produces a preview card with the photo, price and headline.

---

## 7.5 The Enquiry Forms — where leads come from

There are two, and both create a lead automatically.

### The contact form

**`/contact`** → name · phone · email · subject · message.

| Field | Required |
| --- | --- |
| **Name** | Yes |
| **Phone** | Yes |
| **Email** | No (must be a valid address if given) |
| **Subject** | No — shown in the form, not stored separately |
| **Message** | No |

On submit:

1. A **Lead** is created with `source` = **Website**, `status` = **New**, `score` = 0, and the message stored in the lead's **requirements**.
2. A **Note** activity is logged on the lead: *"Website enquiry submitted"*, carrying the message.
3. The visitor sees: *"Thank you! Your enquiry has been received. We will contact you shortly."*

### The property enquiry form

**On every property page** → name · phone · email · message.

On submit:

1. A **Lead** is created with `source` = **Website**, `status` = **New**, and — importantly — **`interested_property_id` pointing at that property**, so the lead is linked to the listing they asked about.
2. The visitor sees: *"Thank you! Your enquiry has been recorded. Our agent will reach out to schedule a site visit."*

> Note the difference: the property enquiry links the lead to the listing but does not log a Note activity. The contact enquiry logs the activity but is not tied to a listing. The message is stored on the lead either way.

### Rate limiting

Both forms allow **5 submissions per 10 minutes** from one address. This is an anti-spam guard, not a quota. A visitor who hits it should wait and try again.

---

## 7.6 What Happens to a Website Lead on the Inside

This is the handoff that matters most:

| Step | Owner | Action |
| --- | --- | --- |
| 1 | — | The lead appears at the top of **Leads** with status `New` and source `Website` |
| 2 | — | It appears on the Dashboard's *Recent Leads* panel |
| 3 | — | It appears in the **Leads** report, grouped under the *Website* source |
| 4 | **Sales** | An agent picks it up, sets the assigned agent and the owner, and sets a next follow-up date |
| 5 | **Sales** | The first contact is logged as an activity, with the outcome |

**Nobody is notified automatically.** There is no lead auto-assignment in the flow described here, and no email alert for a new website lead. If the agency wants leads distributed automatically, the **Lead Auto-Assignment** switch in **Settings → Notifications** records that policy — confirm with your administrator whether it is active.

> **The Website Enquiries panel in Marketing.** The **Marketing** module shows a list of leads that came from the website, so you can see what the site is producing. It only counts leads with `source` = **Website**, so a lead created by an agent with a different source — even if the agent noted the website as the origin — will not appear there.

---

## 7.7 For Marketing Staff — Checklist Before Launching the Site

- [ ] Every published property has **Show on website** switched on
- [ ] Every published property has a **cover photo** set
- [ ] Every published property has a **description** and a **price**
- [ ] The **Featured properties** selection in CMS contains only listings you want in the slider
- [ ] The homepage sections you want are visible in **CMS / Website**
- [ ] The agency **name, contact email, phone and address** in **Settings** are correct — they appear in the header, the footer and the contact page
- [ ] The **logo** is uploaded (Super Admin)
- [ ] The **Testimonials** section is left hidden unless you have approved testimonials
- [ ] A test enquiry has been submitted from each form, and the resulting lead has appeared in **Leads**

---

**Next:** [`08-reference.md`](./08-reference.md) — every status value, field list, ID format and permission slug in one place.
