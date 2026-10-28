# 5. Operations Modules

Covers **Sales Pipeline**, **Tasks & Follow-ups**, **Bookings**, **Payments** and **Notifications**.

| Module | Who can see it |
| --- | --- |
| Sales Pipeline | Super Admin, Admin, Senior Agent, Accountant (read-only) |
| Tasks & Follow-ups | Super Admin, Admin, Sales Executive, Senior Agent |
| Bookings | Super Admin, Admin, Accountant |
| Payments | Super Admin, Admin, Accountant |
| Notifications | **Everyone** with a login |

---

## 5.1 Sales Pipeline

**URL:** `/admin/pipeline` · **Permissions:** `sales.view` / `.create` / `.edit`

The pipeline is the board where live deals are worked. It is a Kanban view: each column is a **stage**, each card is a **deal**.

### 5.1.1 The twelve stages

In board order, left to right:

| # | Stage | What it means |
| --- | --- | --- |
| 1 | **New Lead** | Fresh on the board. The default stage for a deal created directly |
| 2 | **Contacted** | First contact made |
| 3 | **Qualified** | Real requirement and real budget confirmed. **The default stage for a converted lead** |
| 4 | **Property Shortlisted** | Specific properties chosen |
| 5 | **Site Visit Scheduled** | A visit is booked |
| 6 | **Site Visit Completed** | The customer has seen the property |
| 7 | **Negotiation** | Terms under discussion |
| 8 | **Booking** | An offer accepted, booking being raised |
| 9 | **Agreement** | Paperwork stage |
| 10 | **Payment** | Money stage |
| 11 | **Closed Won** | **Terminal — the deal succeeded** |
| 12 | **Closed Lost** | **Terminal — the deal failed** |

Stages 1–10 are **active**. Stages 11 and 12 are **closed**.

> **Choosing a stage for a converted lead.** A converted lead lands in *Qualified* with a probability of **30%**. A deal created directly on the board lands in *New Lead* with a probability of **10%**. You can move it immediately, but pick a stage that reflects reality — the funnel chart and the expected-revenue figure are both computed from it.

### 5.1.2 Working the board

| Action | How |
| --- | --- |
| **Move a deal** | Drag the card to another column, or use its stage control. A toast confirms: *"Deal moved to Booking"* |
| **Search** | The free-text box filters the cards as you type |
| **Filter by agent** | The agent dropdown narrows the board to one agent's deals |

Every move resets the **days in stage** counter, so the age of a stage is always current.

### 5.1.3 The summary bar

| Figure | How it is calculated |
| --- | --- |
| **Total** | Every deal, closed and open |
| **Pipeline Value** | Sum of `deal_value` for **active** deals only |
| **Active Count** | Number of active deals |
| **Expected Revenue** | Sum of (value × probability ÷ 100) over active deals — a probability-weighted forecast |
| **Won Value / Won Count** | Total value and number of **Closed Won** deals |
| **Lost Value** | Total value of **Closed Lost** deals |
| **Conversion Rate** | Won count ÷ total count, to one decimal place. Zero when there are no deals at all |

### 5.1.4 Creating a deal directly

**Sales Pipeline** → **New deal**:

| Field | Notes |
| --- | --- |
| **Customer name** | Required |
| **Property** | Optional link to a listing |
| **Lead** | Optional link to a lead |
| **Deal value** | Required |
| **Stage** | Defaults to **New Lead** |
| **Probability** | 0–100, defaults to **10** |
| **Assigned agent** | Optional. If set, that agent receives a *New deal assigned* notification |

Use this for business that never came through a lead — a walk-in referral, a broker introduction, a corporate mandate.

### 5.1.5 Permissions in practice

| Role | What they can do on the board |
| --- | --- |
| **Senior Agent** | Create deals, move deals between stages |
| **Accountant** | **View only.** They can see the board and its figures to reconcile bookings, but the create and move controls are not offered to them |
| **Sales Executive** | The board is not in their sidebar at all |
| **Admin / Super Admin** | Everything |

---

## 5.2 Tasks & Follow-ups

**URL:** `/admin/tasks` · **Permissions:** `tasks.view` / `.create` / `.edit` / `.delete`

Tasks are to-dos with a due date. **Follow-up** tasks are the important subtype: they are what reminds you to call a lead back.

### 5.2.1 Filter chips

The top of the page has chips: **All · Pending · In Progress · Overdue · Completed**. Counts are shown against each, so you can see at a glance how much is late.

### 5.2.2 Creating a task

**Tasks** → **New task** (or *New Task* in the **Quick Add** menu):

| Field | Default | Notes |
| --- | --- | --- |
| **Title** | | What needs doing |
| **Type** | **Follow-up** | Follow-up · Call · Meeting · Site Visit · Email · Document · Task · Other |
| **Priority** | **Medium** | Low · Medium · High · Urgent |
| **Due date** | | The day it falls due |
| **Due time** | | Optional, e.g. `10:00` |
| **Assign to** | | Which team member owns it |
| **Link to lead** | | Links the task to a lead |
| **Description** | | Extra detail |

Tasks get IDs like `TSK-005`.

### 5.2.3 Statuses

**Pending** → **In Progress** → **Completed**, with **Overdue** as the automatic fourth state.

| Status | Meaning |
| --- | --- |
| **Pending** | Not started |
| **In Progress** | Being worked on |
| **Overdue** | The due date has passed. Set automatically by the daily sweep, and on creation if the due date is already past |
| **Completed** | Done |

### 5.2.4 How follow-up tasks are created

You rarely type these. They are **synced automatically** from the lead's next-follow-up date:

| You do this | The system does this |
| --- | --- |
| Create a lead with a next-follow-up date | Creates a follow-up task, priority **High**, status Pending (or Overdue if the date has passed) |
| Edit a lead's next-follow-up date | Updates the open follow-up task's date, time and assignee |
| Log an activity with a next-follow-up date | Same — updates the open follow-up task |
| **Clear** the next-follow-up date | Marks the open follow-up task **Completed** (not deleted) |

The task title is always *"Follow-up: {lead name}"*, and it is assigned to the lead's agent. Only the **latest open** follow-up task for a lead is kept in sync — older ones are left as they are.

### 5.2.5 The daily sweep

At **09:00 every day**, the system:

1. Finds every follow-up task that is **not completed** and whose due date is **today or earlier**.
2. Flips any past-due one to **Overdue**.
3. Sends the assignee a notification: *"Follow-up due today"* or *"Follow-up overdue"*.
4. **Does not** send a second unread notification for the same lead within **12 hours** — so a task that stays overdue for a week still produces one notification per half-day, not one per day.
5. **Skips tasks with no assignee** — they are flagged Overdue but nobody is told.

### 5.2.6 Deleting a task

Deleting is a separate action from completing, and it needs `tasks.delete`. Prefer changing the status to **Completed** — the history of what was done and when is worth keeping.

---

## 5.3 Bookings

**URL:** `/admin/bookings` · **Permissions:** `bookings.view` / `.create` / `.edit` (plus `bookings.approve` in the permission catalogue)

A booking is the commercial commitment behind a deal. It is what the accounts team works against.

### 5.3.1 Creating a booking

**Bookings** → **New booking** (or *New Booking* in the **Quick Add** menu):

| Field | Notes |
| --- | --- |
| **Customer name** | Required |
| **Property name** | Required |
| **Agent name** | Required |
| **Booking date** | Required |
| **Deal value** | The full property value |
| **Booking amount** | The amount actually booked — often the token or advance |

Both money fields show the **amount in words** underneath as you type, which is exactly what a booking agreement needs.

A booking gets ID `B-###` and starts as **Booking Pending** with agreement **Pending** and possession **Pending**. The creator receives a *Booking created* notification.

### 5.3.2 The three status tracks

This is the key idea. A booking tracks three things **independently**:

| Track | Values |
| --- | --- |
| **Booking status** | Booking Pending → Booking Confirmed → Under Agreement → Agreement Signed · Cancelled |
| **Agreement status** | Pending → Under Review → Signed |
| **Possession status** | Pending → In Process → Handed Over |

A typical booking looks like this over a few weeks:

```
Week 1   Booking: Booking Confirmed   Agreement: Pending        Possession: Pending
Week 3   Booking: Under Agreement     Agreement: Under Review   Possession: Pending
Week 5   Booking: Agreement Signed    Agreement: Signed         Possession: In Process
Week 12  Booking: Agreement Signed    Agreement: Signed         Possession: Handed Over
```

**Do not wait for one to finish before starting the next.** The agreement is usually signed well before possession.

### 5.3.3 The booking detail page

| Section | What it shows |
| --- | --- |
| **Booking → Agreement → Possession timeline** | The three milestones across the top, each ticked off as it completes |
| **Summary card** | Customer, property, agent, booking date, deal value, booking amount |
| **Status controls** | All three status dropdowns, each saving independently |
| **Record payment** | Opens a modal to log money against this booking |
| **Linked payments** | Every payment already recorded for this booking |

### 5.3.4 Recording a payment from a booking

Use the **Record Payment** modal:

| Field | Default |
| --- | --- |
| **Payment amount** | — (required to record) |
| **Payment mode** | **Bank Transfer** |
| **Record payment** | On |

This creates a **Payment** record with:

- ID `PAY-###`
- `status` = **Paid**
- `mode` = your choice
- `due_date` and `paid_date` = today
- `txn_id` = `—` (there is no gateway to generate one)

and notifies the customer with *"₹ amount received"*.

The payment appears immediately in the **Payments** module and in the booking's linked-payments list.

---

## 5.4 Payments

**URL:** `/admin/payments` · **Permissions:** `payments.view` / `.create` / `.edit`

### 5.4.1 The four collection figures

The module opens with four widgets:

| Widget | Meaning |
| --- | --- |
| **Receivable** | Everything expected that is not `Paid` or `Cancelled` |
| **Received** | Everything with status `Paid` |
| **Pending** | `Pending` and `Partially Paid` |
| **Overdue** | Status `Overdue` — the due date has passed |

### 5.4.2 Recording a payment directly

**Payments** → **New payment**:

| Field | Default | Notes |
| --- | --- | --- |
| **Customer name** | | Required |
| **Property name** | | |
| **Amount** | | The instalment or sum |
| **Mode** | **RTGS** | RTGS · NEFT · IMPS · UPI · Cheque · Bank Transfer · Cash |
| **Due date** | | When it is expected |
| **Status** | **Pending** | Pending · Partially Paid · Paid · Overdue |

### 5.4.3 Payment statuses

| Status | Meaning |
| --- | --- |
| **Pending** | Expected, not yet received |
| **Partially Paid** | Some of it has arrived |
| **Paid** | Fully received |
| **Overdue** | The due date has passed and it has not arrived |
| **Cancelled** | It will not be collected — excluded from every total |

### 5.4.4 Editing a payment

From the list, edit any of: **status**, **mode**, **transaction id**, **paid date**, **due date**. You can also change the status directly from the list row with the inline dropdown — it saves immediately and keeps your place on the page.

> **The transaction id.** A payment created from a booking has the placeholder `—`. Replace it with the real UTR / cheque number so the accounts team can trace it. It is displayed under the customer's name in the list.

### 5.4.5 The reporting caveat

In the **Payments** report tab, the pending bucket treats `Pending`, `Partially Paid` and `Overdue` together as "not yet collected" against "collected". So a report that shows a large pending figure may include overdue money — check the Payments module itself for the split.

---

## 5.5 Notifications

**URL:** `/admin/notifications` · **Permission:** none — every signed-in user has access

### The bell

The bell in the top bar shows your **unread count** as a badge. Click it to open the list, where you can:

- Click **Mark all as read** to clear the badge.
- Mark a single notification as read.
- **Click a notification to go to the record** it refers to. Marking it read and navigating happen together.

### What generates a notification

| Type | Triggered by | Goes to |
| --- | --- | --- |
| `lead.converted` | A lead is converted to a deal | The lead's assigned agent |
| `site_visit.scheduled` | A lead's status becomes *Site Visit Scheduled* | The lead's assigned agent |
| `deal.created` | A deal is created with an agent assigned | That agent |
| `booking.created` | A booking is created | The person who created it |
| `payment.received` | A payment is recorded against a booking | The customer/agent on that booking |
| `followup` | The daily 09:00 sweep finds a due or overdue follow-up | The task's assignee |

### The 12-hour rule

The follow-up sweep will not send a second **unread** notification for the same lead within 12 hours. If you dismiss a notification without reading it, you will not be chased again for that lead until the window passes.

### Not in-app

QREX does **not** send email notifications for these events by default. The only emails it sends are password resets, new-user invitations, and the OTP codes for changing your email address. If your agency wants agents emailed as well, that is a configuration and development task, not a settings toggle.

---

**Next:** [`06-modules-marketing-and-admin.md`](./06-modules-marketing-and-admin.md) — Campaigns, Media Center, Reports, CMS, Users, Roles, Settings.
