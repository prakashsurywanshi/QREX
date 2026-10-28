# 3. The Sales Lifecycle

This is the story of one sale, from a stranger filling in a form to the money landing in the bank. It is the single most important thing to understand about QREX, because every module in the system exists to serve one of these steps.

**Who should read this:** Sales Executives, Senior Agents, Accountants, Managers.

---

## 3.1 The Nine Steps

| # | Step | Where it happens | Who | Module |
| --- | --- | --- | --- | --- |
| 1 | Enquiry arrives | Public website | Visitor | Public site |
| 2 | Lead created | Automatic | System | Leads |
| 3 | First contact & activity logging | Lead detail page | Agent | Leads |
| 4 | Status progression | Lead detail page | Agent | Leads |
| 5 | Site visit | Auto-created on status change | System + Agent | Site Visits |
| 6 | Convert to deal | Lead detail page | Senior Agent | Leads → Sales Pipeline |
| 7 | Deal moves across the board | Pipeline board | Senior Agent | Sales Pipeline |
| 8 | Booking raised | Bookings | Agent / Accountant | Bookings |
| 9 | Payment recorded | Booking detail or Payments | Accountant | Payments |

---

## 3.2 Step 1–2 — A visitor becomes a lead

A visitor submits the **Contact** form, or the enquiry form on a property page. The system, with no human involvement:

1. Creates a **Lead** with:
   - `source` = **Website**
   - `status` = **New**
   - `score` = 0
   - the visitor's name, phone and email
   - their message saved into the lead's requirements
2. Logs a **Note** activity on the lead: *"Website enquiry submitted"*.
3. If the enquiry came from a property page, links the lead to that property (`interested_property_id`).

The lead appears at the top of **Leads** with status `New`, and it appears on the Dashboard's *Recent Leads* panel.

> **What you must do:** the system does not assign an agent or start a follow-up on its own. Pick the lead up, assign it to an agent, and set the next follow-up.

**Limitation worth knowing:** each visitor can submit at most **5 enquiries per 10 minutes**. That is an anti-spam guard, not a quota.

---

## 3.3 Step 3 — Make contact, and log it

Open the lead. Two things happen here, and both matter.

### 3.3.1 The activity timeline

Every meaningful contact is logged as an **activity** on the lead, and the timeline is the permanent record of the relationship. It is what a colleague sees when they take over, and what management reads in the lead report.

| Activity type | When to use it | Outcome options |
| --- | --- | --- |
| **Call** | You phoned them | Connected · No Answer · Busy · Voicemail · Callback Requested · Not Interested |
| **WhatsApp** | You messaged them | Replied · Pending · Read |
| **SMS** | You texted them | Sent · Delivered · Pending |
| **Email** | You emailed them | Sent · Opened · Replied · Bounced |
| **Site Visit** | You arranged a visit | Scheduled · Completed · Cancelled · Rescheduled |
| **Meeting** | You met them | Scheduled · Completed · Cancelled · Rescheduled |
| **Note** | Anything else worth recording | — |

You can also record: **duration** (how long the call was), **contact number** used, **email subject**, **location**, and — critically — the **next follow-up date and time**.

The system also generates four activity types on its own:

| Auto-generated activity | Triggered by |
| --- | --- |
| *Lead Imported* | A CSV import |
| *Status Change* | Any status change you make |
| *Reassignment* | Handing the lead to another agent |
| *Conversion* | Converting the lead to a deal |

### 3.3.2 The next follow-up date is the engine of the whole system

Setting a **next follow-up date** (either on the edit form or inside an activity) does three things:

1. Saves the date on the lead.
2. Creates or updates a **Follow-up task** (`TSK-###`) assigned to the lead's agent — titled *"Follow-up: {lead name}"*, priority **High**, status **Pending** (or **Overdue** if the date is in the past).
3. Stamps the lead's **last contact** timestamp to now.

Clearing the next-follow-up date **completes** the open follow-up task rather than deleting it, so there is a clean audit trail.

**Accepted date formats:** `2026-10-21`, `2026/10/21`, `21-10-2026`, `21/10/2026`. Times: `10:00 AM`, `17:30`. If no date can be parsed, the system falls back to **tomorrow** — so a typo in the format silently pushes the follow-up a day out rather than failing.

> **Daily automation.** At **09:00 every day**, the scheduler runs a sweep that flips any past-due follow-up task to **Overdue** and notifies the assigned agent ("Follow-up due today" or "Follow-up overdue"). It will not send a second unread notice for the same lead within **12 hours**. If a task has no assignee, it is flagged but no notification is sent.

---

## 3.4 Step 4 — Move the status along

The lead's **status** is the headline. It drives the dashboard, the reports and the "next action" logic.

```
New ──▶ Contacted ──▶ Qualified ──▶ Site Visit Scheduled ──▶ Site Visit Completed ──▶ Negotiation ──▶ Converted
                                                                                              └──▶ Lost
```

| Status | Means | Typical next action |
| --- | --- | --- |
| **New** | Just arrived, nobody has touched it | Assign an agent, make first contact |
| **Contacted** | You have spoken to them | Log the outcome, set a follow-up |
| **Qualified** | Real budget, real intent, real requirement | Shortlist properties, schedule a visit |
| **Site Visit Scheduled** | A visit is on the calendar | Confirm and run the visit |
| **Site Visit Completed** | They have seen the property | Record feedback, negotiate |
| **Negotiation** | Discussing terms | Agree the deal, convert it |
| **Converted** | Became a deal. **Terminal** | Work the deal on the pipeline board |
| **Lost** | Not going ahead. **Terminal** | Record the reason; consider re-approaching later |

**Every status change is logged** as a *Status Change* activity, so the timeline shows the full history of where the lead has been.

**Important:** the two terminal statuses are the only place where conversion is blocked. See step 6.

---

## 3.5 Step 5 — The site visit happens itself

The moment you set a lead's status to **Site Visit Scheduled**, the system:

1. **Creates a Site Visit** (`SV-###`) for that lead — *once only*. If a visit already exists for the lead, no duplicate is created.
2. Sets the visit date from the lead's next-follow-up date, defaulting to **tomorrow**, and the time to **10:00 AM** if none is set.
3. Names the property from the lead's interested property, or the preferred location if there is none.
4. **Notifies the assigned agent**: *"Site visit scheduled"*.

You can also create a visit by hand from **Site Visits** → **New visit** — useful when the customer walks in and there is no lead yet.

Visit statuses: **Scheduled → Confirmed → Completed**, with **Rescheduled** and **Cancelled** as the alternatives.

| Status | Meaning |
| --- | --- |
| **Scheduled** | Created, not yet confirmed with the customer |
| **Confirmed** | The customer has agreed to the slot |
| **Completed** | The visit happened |
| **Rescheduled** | Moved to another date/time |
| **Cancelled** | It will not happen |

Record the visit's **feedback** and **notes** on the visit — this is the material for negotiating with the customer.

---

## 3.6 Step 6 — Convert the lead into a deal

When the buyer is serious, convert the lead. Open the lead and use **Convert to Deal** (visible to Senior Agents and above, and to anyone holding `sales.create`).

| Field | What to enter | Default |
| --- | --- | --- |
| **Deal value** | The agreed or expected property value | — (required) |
| **Property** | The property being bought | Falls back to the lead's interested property |
| **Stage** | Where the deal starts | **Qualified**, probability 30 |

What happens:

1. A **Deal** is created with ID `DL-###`, customer name copied from the lead, and the assigned agent carried over.
2. The lead's status becomes **Converted**.
3. A *Conversion* activity is logged: *"Created deal DL-012 worth ₹1.85 Cr"*.
4. The assigned agent is notified: *"Lead converted to deal"*.

**Two guards:**

| Guard | Message |
| --- | --- |
| The lead is already `Converted` or `Lost` | *"This lead cannot be converted in its current status."* |
| Two people convert at the same moment | The second is blocked — the lead row is locked during conversion, so you can never create two deals from one lead |

**You can also create a deal directly** on the **Sales Pipeline** board without a lead — useful for referral business that never generated an enquiry. A direct deal starts at stage **New Lead** with probability **10**; a converted deal starts at **Qualified** with probability **30**.

---

## 3.7 Step 7 — Work the pipeline

Open **Sales Pipeline**. It is a Kanban board with **12 columns**, in this fixed order:

```
New Lead ▸ Contacted ▸ Qualified ▸ Property Shortlisted ▸ Site Visit Scheduled
▸ Site Visit Completed ▸ Negotiation ▸ Booking ▸ Agreement ▸ Payment
▸ Closed Won  |  Closed Lost
```

**Moving a card:** drag it to another column (or use the card's stage control). The system updates the stage, resets the *days in stage* counter, and confirms with a toast: *"Deal moved to Booking"*.

**The board's summary bar** tells you at a glance:

| Figure | Meaning |
| --- | --- |
| **Total** | All deals ever |
| **Pipeline Value** | Sum of the value of every **active** deal (not Closed Won / Closed Lost) |
| **Active Count** | How many deals are live |
| **Expected Revenue** | Value × probability, summed — a weighted forecast |
| **Won Value / Won Count** | Total and number of **Closed Won** deals |
| **Lost Value** | Total value of **Closed Lost** deals |
| **Conversion Rate** | Won count ÷ total count, to one decimal place |

**Practical guidance on stages.** `Booking`, `Agreement` and `Payment` in the pipeline are *milestones*, and the same three things are tracked properly in the **Bookings** and **Payments** modules. Use the pipeline to show progress; use Bookings and Payments to record what actually happened.

---

## 3.8 Step 8 — Raise the booking

A **booking** captures the commercial commitment: who, which property, which agent, when, for how much.

**Bookings** → **New booking**:

| Field | Meaning |
| --- | --- |
| **Customer name** | The buyer |
| **Property name** | What they are buying |
| **Agent name** | Who is handling it |
| **Booking date** | When the booking was made |
| **Deal value** | Full property value |
| **Booking amount** | The amount actually booked (often the token/advance) |

A booking is created with ID `B-###` and status **Booking Pending**. The creator receives a *Booking created* notification.

### The booking tracks three things at once

This is the part people get wrong, so read it carefully. A booking has **three independent status tracks** that progress separately:

| Track | Values | What it describes |
| --- | --- | --- |
| **Booking status** | Booking Pending → Booking Confirmed → Under Agreement → Agreement Signed → Cancelled | Where the booking itself stands |
| **Agreement status** | Pending → Under Review → Signed | The legal paperwork |
| **Possession status** | Pending → In Process → Handed Over | When the buyer gets the keys |

A realistic path: booking **Booking Confirmed** while the agreement is still **Under Review** and possession is still **Pending**. All three move on the booking's detail page, each independently.

The booking detail page shows a **Booking → Agreement → Possession** timeline so the whole state is visible on one screen.

---

## 3.9 Step 9 — Record the money

Two ways to record a payment.

### From the booking (fastest)

On the booking detail page, use **Record Payment**:

| Field | Default |
| --- | --- |
| **Payment amount** | — (required to record) |
| **Payment mode** | **Bank Transfer** |

This creates a **Payment** (`PAY-###`) with status **Paid**, today's date as both the due and paid date, and a transaction reference of `—`. The customer is notified: *"₹ amount received"*.

### From the Payments module (for instalments)

**Payments** → **New payment**, for when money is due over time or has been promised but not yet received.

| Field | Notes |
| --- | --- |
| **Customer name** | Required |
| **Property name** | |
| **Amount** | The instalment or sum due |
| **Mode** | RTGS · NEFT · IMPS · UPI · Cheque · Bank Transfer · Cash |
| **Due date** | When it is expected |
| **Status** | Pending · Partially Paid · Paid · Overdue |

Payment statuses: **Pending → Partially Paid → Paid**, with **Overdue** (due date passed, not received) and **Cancelled**.

The Payments module opens with four collection figures: **Receivable**, **Received**, **Pending**, **Overdue**.

> **There is no payment gateway.** QREX records money that has actually moved (or is expected to). It does not charge cards, and it does not collect anything. If money is not received, do not mark the payment `Paid`.

---

## 3.10 What the Manager Sees

Everything above rolls up automatically — nobody has to "report" anything.

| Dashboard / Report figure | Where it comes from |
| --- | --- |
| Active Leads, New Leads | Leads not closed |
| Active Deals | Deals not Closed Won or Closed Lost |
| Revenue Won | Sum of `deal_value` across **Closed Won** deals |
| Pipeline Value | Sum of active deal values |
| Expected Revenue | Deal value × probability |
| Pending Payments | Payments not `Paid` or `Cancelled` |
| Lead sources | Grouped by the lead's `source` field |
| Pipeline funnel | Deal count and value per stage |
| Agent performance | Closed-won deals and revenue per agent |
| Conversion rate | Won ÷ total |
| Lost leads | Leads that ended in `Lost`, broken down by source |
| Site-visit report | Scheduled, completed, cancelled, rescheduled totals |
| Campaign performance | Budget, spend, leads, conversions, ROI per campaign |

**The most important report for a sales manager** is the **Lost Leads** tab — it shows *where* leads are being lost, which tells you whether the problem is the channel, the response time, or the price.

---

## 3.11 Common Mistakes and How to Avoid Them

| Mistake | Consequence | What to do instead |
| --- | --- | --- |
| Never setting a next follow-up date | No task is created, so no reminder reaches you, and the lead goes cold | Set the next follow-up date on **every** activity you log |
| Logging a call but not the outcome | The timeline has no signal for the conversion report | Always pick an outcome |
| Converting a lead before the visit | A deal on the board with no site-visit history behind it | Convert at `Qualified`/`Negotiation`, once the buyer has seen the property |
| Marking a payment `Paid` before the money arrives | The receivable, the agent's performance and the booking all read too healthy | Use `Pending` until it lands; use `Partially Paid` for part-payments |
| Booking before the deal is Closed Won | Reports show a booking for a lost deal | Move the deal to `Closed Won` first, then book |
| Handing over a lead without recording a reason | The handover history has no explanation | Always choose a reason when you reassign |
| Not setting the lead's *source* | Campaign attribution and the lead-source report are wrong | Set the source when you create the lead, or correct it later if you have `leads.edit.source` |
| Deleting a lead instead of marking it `Lost` | The lost-lead report is incomplete and the history is destroyed | Set the status to `Lost` |

---

**Next:** the module-by-module how-to guides — [`04-modules-sales.md`](./04-modules-sales.md) (Dashboard, Properties, Amenities, Leads, Customers, Site Visits) and [`05-modules-operations.md`](./05-modules-operations.md) (Pipeline, Tasks, Bookings, Payments, Notifications).
