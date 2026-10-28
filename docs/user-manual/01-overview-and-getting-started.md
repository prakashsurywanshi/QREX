# 1. Overview & Getting Started

## 1.1 What QREX Is

QREX is a **property management and sales CRM** for a real-estate agency. It is one application that serves three audiences from one source of truth:

| Surface | Where | Who uses it | What it does |
| --- | --- | --- | --- |
| **Public website** | `/` | Prospective buyers and sellers | Browse the listing portfolio, view photos and specs, submit enquiries |
| **Admin CRM** | `/admin` | Your team | Everything the business does: leads, deals, properties, visits, bookings, payments, marketing, reports, administration |
| **JSON API** | `/api` | Integrations and mobile clients | The same admin data, programmatically (token-authenticated) |

The crucial thing to understand is that **the public website and the admin CRM are connected**. When a visitor fills in the contact form or the enquiry form on a property page, a **Lead** is created inside the CRM automatically, with the visitor's message stored against it. The marketing team does not re-key anything.

---

## 1.2 How a Sale Actually Works (one paragraph)

A visitor submits an enquiry → the system creates a **Lead** → an agent picks it up, logs calls and meetings on its timeline, and moves its status along → a **Site Visit** is auto-scheduled when the lead reaches "Site Visit Scheduled" → once the buyer is serious, the lead is **converted into a Deal** which appears on the **Sales Pipeline** board → when the deal is won, a **Booking** is raised that tracks the agreement and the possession separately → money is recorded as **Payments** against that booking → management watches it all roll up on the **Dashboard** and in **Reports**.

The full journey is documented step by step in [`03-sales-lifecycle.md`](./03-sales-lifecycle.md).

---

## 1.3 Signing In

1. Open the site and go to **`/login`**.
2. Enter your **email address** and **password**.
3. Tick **Remember me** on a personal device you trust to keep you signed in.
4. Click **Sign in**.

On success you land on the **Dashboard** at `/admin/dashboard`.

### Rules the system enforces on sign-in

| Rule | What you experience |
| --- | --- |
| **Rate limiting** | Only **5 sign-in attempts per minute** from your IP. A 6th attempt is rejected. Wait a minute and try again. |
| **Account must be Active** | If an Admin has set your account to **Inactive**, sign-in is refused even with the right password. See [`09-troubleshooting-and-faq.md`](./09-troubleshooting-and-faq.md). |
| **Session expiry** | You are signed out after a period of inactivity. Unsaved form data is lost. Save long edits first. |
| **Last login recorded** | Your `last login` timestamp updates on every successful sign-in; Admins can see it on your user record. |

### Forgot your password?

1. Click **Forgot password?** on the login page.
2. Enter your email address and submit.
3. A reset link is emailed to you. (Rate limited to **5 requests per minute**.)
4. Open the link — it lands on a **Reset Password** form at `/reset-password/{token}`.
5. Choose a new password of at least **8 characters**, confirm it, and submit.
6. You are signed in with the new password. Use it immediately, and never share it.

> If the reset email never arrives, the agency's outgoing mail is not configured. Only a **Super Admin** can configure SMTP — see [`06-modules-marketing-and-admin.md`](./06-modules-marketing-and-admin.md#67-settings).

### Signing out

Click the **profile menu** in the top-right corner (your initials) → **Logout**. Always sign out on a shared or public machine.

---

## 1.4 Your First Tour of the Admin Area

When you sign in, you land on the **Dashboard**. Five things to know:

### 1.4.1 The sidebar (left)

Your sidebar is **built for your role**. QREX checks the permissions attached to your role and only shows the modules you can actually open. Groups with nothing you can access are dropped entirely.

```
OVERVIEW        Dashboard
SALES           Properties · Leads · Customers · Sales Pipeline · Site Visits
                Tasks & Follow-ups · Bookings · Payments
OPERATIONS      Media Center · Marketing · Reports & Analytics · CMS / Website
ADMINISTRATION  Users · Roles & Permissions · Amenities · Settings
```

A **Senior Agent** sees no "Users", "Roles", "Amenities" or "Settings". A **Marketing User** sees no "Bookings" or "Payments".

At the very bottom of the sidebar there is a **View Public Website** link — handy for checking how a listing looks to a buyer without opening a new browser profile.

### 1.4.2 The top bar

| Element | What it does |
| --- | --- |
| **☰ / sidebar toggle** | Collapses the sidebar (desktop) or opens it as a drawer (mobile) |
| **Search box** | A shortcut area for the public site |
| **Public-site launcher** | Opens the public website in a new tab |
| **Quick Add ▾** | The fastest way to create a record — *Add Property*, *Add Lead*, *New Task*, *New Booking*. Items shown depend on your permissions |
| **🔔 Notification bell** | Shows your unread count. Click to open the notification list; each item links to the record it refers to. **Mark all as read** clears the badge |
| **Profile menu** | *My Profile*, *Settings*, *Logout* |

### 1.4.3 The Dashboard

Six KPI cards across the top:

| Card | Sub-text | Meaning |
| --- | --- | --- |
| **Total Properties** | *n available* | Every listing in the system and how many are still on the market |
| **Active Leads** | *n new* | Open leads and how many have never been contacted |
| **Active Deals** | *in pipeline* | Deals sitting on the pipeline board, not yet won or lost |
| **Site Visits** | *current* | Visits on the books |
| **Revenue Won** | *closed deals* | Total value of **Closed Won** deals |
| **Pending Payments** | *to collect* | Money that is due but not yet received |

Below the cards: charts for revenue by month, lead sources, the pipeline funnel, agent performance and monthly bookings, plus lists of recent leads, upcoming visits, recent bookings, recent payments, follow-ups due, recent activity and featured properties.

A **range switcher** at the top of the page (Today / 7 Days / 30 Days / 90 Days / YTD / All) reloads every figure on the page for that period.

> **Scoping note.** Sales Executives and Senior Agents see figures restricted to their own book of business. Admins and Super Admins see the whole agency's numbers.

### 1.4.4 The notification bell

QREX notifies you in-app about things that need your attention:

| Notification | Triggered when |
| --- | --- |
| **Lead converted to deal** | One of your leads is converted |
| **Site visit scheduled** | A lead you own is moved to *Site Visit Scheduled* |
| **New deal assigned** | A deal is created with you as the agent |
| **Booking created** | A booking is created (you are notified as the creator) |
| **₹ amount received** | A payment is recorded against a booking |
| **Follow-up due today / Follow-up overdue** | The daily 09:00 sweep finds a follow-up task that is due or late |

Clicking a notification marks it read and jumps to the related record.

### 1.4.5 Flash messages

Every action gives immediate feedback:

- **Green toast** — success ("Lead created successfully.", "Status updated.", "Deal moved to Booking").
- **Red toast** — refusal ("You do not have permission to perform this action.", "This lead cannot be converted in its current status.").

Toasts auto-hide after about 3.5 seconds. If you need to read one again, check the record itself — failed actions do not change anything.

---

## 1.5 Managing Your Own Profile

Go to the profile menu → **My Profile** (or the URL `/profile`).

### Personal information

Update your **name** and **phone number** and save. These are the details buyers and colleagues see.

### Changing your password

1. Open the **Change Password** section.
2. Enter your **current password**.
3. Enter a **new password** and confirm it.
4. Save.

> The password *reset* flow (by email) and the *change* flow (here) are different. Changing it here requires you to know the old one.

### Changing your email address — a four-step, OTP-protected process

Email is the identity you sign in with, so the system does not let you simply overwrite it. The change is proved in two directions: you must prove you own the **old** inbox and the **new** one.

| Step | What you do | What the system does |
| --- | --- | --- |
| 1 | Click **Send code to current email** | Sends a 6-digit OTP to your **current** address |
| 2 | Type the 6-digit code and verify | Marks the current email as proven. The step always appears to succeed, even if the address is wrong — this prevents anyone discovering which addresses exist |
| 3 | Enter the **new email address** and click **Send code to new email** | Sends a 6-digit OTP to the **new** address |
| 4 | Type the 6-digit code and verify | Saves the new address as your login email |

**Rules for the codes:**

| Rule | Value |
| --- | --- |
| Code length | 6 digits |
| Code lifetime | **10 minutes** |
| Resend cooldown | **60 seconds** between requests |
| Verification attempts | **5** per hour, then you must request a new code |
| A code is single-use | It is consumed the moment it verifies successfully |

If a code stops working, wait out the 10 minutes and request a new one rather than retrying the same digits — repeated wrong entries exhaust your 5 attempts.

---

## 1.6 Demo Accounts (evaluation and training only)

> **These accounts exist only in a freshly seeded demo database.** They are listed here so reviewers and trainers can log in as each persona. In a live agency instance they do not exist, and you should never leave a demo account enabled.

### Accounts created by the database seeder

The seeder creates these eight users. **All of them use the password `password`.**

| Name | Email | Role | Branch | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Vikram Malhotra | `vikram@example.in` | Super Admin | HQ Mumbai | Active | Full access |
| Neha Sharma | `neha@example.in` | Admin | Mumbai | Active | All but two system permissions |
| Amit Verma | `amit.v@example.in` | Sales Executive | Mumbai | Active | Scoped to own leads |
| Sneha Kapoor | `sneha.k@example.in` | Sales Executive | Bangalore | Active | Scoped to own leads |
| Rajesh Gupta | `rajesh.g@example.in` | Senior Agent | Mumbai | Active | Sales Executive + pipeline |
| Pooja Iyer | `pooja.i@example.in` | Sales Executive | Gurugram | Active | Scoped to own leads |
| Rahul Mehta | `rahul.m@example.in` | Marketing User | HQ Mumbai | Active | Campaigns, CMS, media |
| Priti Shah | `priti.s@example.in` | Accountant | HQ Mumbai | **Inactive** | Deliberately inactive — cannot sign in. This is a useful thing to demonstrate |

### Accounts hard-coded on the login screen

The login page also shows clickable "demo account" chips for Super Admin, Admin, Sales Executive, Marketing User and Accountant. **These use a different set of credentials than the seeder:**

| Role chip | Email on the login screen | Password |
| --- | --- | --- |
| Super Admin | `tejas@qodeigence.com` | `12345678` |
| Admin | `neha@example.com` | `password` |
| Sales Executive | `amit.v@example.com` | `password` |
| Marketing User | `rahul.m@example.com` | `password` |
| Accountant | `priti.s@example.in` | `password` |

> **Known discrepancy — please read before a demo.** The login-screen chips use the `@example.com` domain while the seeder creates `@example.in` addresses. The two sets do not line up:
>
> - The **seeder** addresses are guaranteed to exist after `php artisan db:seed`.
> - The **login-screen** addresses may or may not exist depending on how the database was populated. If a chip does not work, use the seeder table above instead.
>
> Also note the Accountant chip points at `priti.s@example.in`, which the seeder deliberately creates as **Inactive** — that chip will be refused at sign-in. This is expected behaviour, not a bug.

**Best practice for a live deployment:** delete or deactivate the demo accounts, and set a real password for every remaining account.

---

## 1.7 Conventions You Will Meet Every Day

**Money.** Amounts are stored as whole rupees and shown in Indian notation:

| Stored | Displayed | Read as |
| --- | --- | --- |
| `18,500,000` | **₹1.85 Cr** | one crore eighty-five lakh |
| `750,000` | **₹7.50 L** | seven and a half lakh |
| `45,000` | **₹45,000** | forty-five thousand |

Check the unit before you quote a number. Reports often switch between "in L" and "in Cr" — the column heading tells you which.

**Dates.** Displayed as `21 Oct 2026` (day, month, year). Follow-up dates carry a time as well, e.g. `21 Oct 2026, 10:00 AM`.

**Record IDs.** Every record has a short ID (`L-006`, `DL-012`, `TSK-005`, `SV-003`, `B-001`, `PAY-001`, `CAM-001`, `C-001`, `PROP-001`). Use these in emails, chats and reports — they are unambiguous.

**Status dropdowns.** Use the values offered in the dropdown. The complete vocabulary for every module is in [`08-reference.md`](./08-reference.md).

---

**Next:** [`02-roles-and-access.md`](./02-roles-and-access.md) — what your role can and cannot do, and how row-level scoping works.
