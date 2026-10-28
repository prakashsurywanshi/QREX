# 9. Troubleshooting & FAQ

Everything that commonly goes wrong, what it means, and what to do about it.

---

## 9.1 Access & Login

### "You do not have permission to perform this action."

**What it means.** A red toast after an action was refused. Your role does not hold the permission the action needs.

**What to do.**

1. Check the **Roles & Permissions** screen (or ask an Admin) for the exact slug. The pattern is `module.action` — for creating a lead it is `leads.create`, for moving a deal it is `sales.edit`.
2. Ask for that specific permission to be added to your role. Naming the slug makes the request quick.
3. If the **module is missing from the sidebar** rather than the action being refused, your role lacks the `view` permission for the module. That is the same class of problem — ask for `module.view`.

### "You do not have the required role to access this page."

**What it means.** You have the permission but not the **role**. This applies to the Super-Admin-only actions: SMTP configuration, test mail, logo upload and logo removal.

**What to do.** Only a **Super Admin** can perform these. Ask them to do it, or ask for the role itself.

### "You do not have access to this lead."

**What it means.** HTTP 403. You are a Sales Executive or Senior Agent and this lead is neither **assigned to you** nor **owned by you**.

**What to do.**

1. Go back to the **Leads** list — if it is not in your filtered list, it is not yours.
2. Ask whoever has it to **hand it over** (reassign). The handover moves both the assigned agent and the owner, and the lead then appears in your list immediately.
3. If you believe it *should* be yours, an Admin can change the assigned agent and owner for you.

### My colleague says they sent me a lead, but I cannot see it

Most often one of these:

- The lead was assigned to them but the **owner** was not changed, and you are only the owner.
- The handover was not done — the lead is still assigned to them.
- You are signed in on a different account than you think. Check **My Profile** for your email and role.

### The sign-in screen says my account is not valid

**What it means.** The account exists but is **Inactive**, or the password is wrong, or you have exceeded the rate limit.

**What to do.** Check the order of likelihood:

1. **Rate limit** — more than 5 attempts in a minute. Wait 60 seconds and try once.
2. **Inactive account** — an Admin set your status to `Inactive`. Sign-in is refused even with the right password. Ask them to set it back to `Active`.
3. **Wrong password** — use **Forgot password** to reset it by email.

### The "Forgot password" email never arrives

**What it means.** Outgoing mail is not working. Password resets, new-user invitations and email-change OTPs all depend on it.

**What to do.**

1. Ask a **Super Admin** to open **Settings → SMTP / Email Configuration** and press **Test mail**.
2. If the test fails, the mail server details, credentials or the "Enable SMTP" switch need fixing.
3. Until SMTP works, a Super Admin can set a temporary password for you directly on **Users → Edit user**, and you can change it from **My Profile → Change Password** afterwards.

### The demo account on the login screen does not work

**What it means.** The login screen's demo chips use `@example.com` addresses, while the database seeder creates `@example.in` addresses. They do not line up.

**What to do.** Use the seeder table in [`01-overview-and-getting-started.md`](./01-overview-and-getting-started.md#16-demo-accounts-evaluation-and-training-only) instead. The **Accountant** chip points at a deliberately **Inactive** account and will always be refused — that is expected.

### I signed in but the sidebar is missing half the modules

**What it means.** That is the permission system. The sidebar only shows modules you have `view` access to.

**What to do.** Nothing, unless you think you should have more. Check your role with an Admin. See [`02-roles-and-access.md`](./02-roles-and-access.md).

---

## 9.2 Leads

### My CSV import imported some rows and skipped others

**What it means.** The import is per-row tolerant — good rows go in, bad rows are reported and skipped.

**What to do.** Read the per-row errors. Each one tells you which row and why:

| Error | Fix |
| --- | --- |
| *"Row N: name and phone are required."* | Both columns must be filled |
| *"Row N: duplicate lead within file (Name / Phone)."* | The same phone appears twice in your file |
| *"Row N: duplicate lead (Name / Phone)."* | That phone already exists in the system — this is a genuine duplicate, not a file problem |

> **Watch the toast colour.** A clean import shows green. An import with skipped rows uses the *warning* channel, which is less prominent. **Always read the per-row errors** — the count alone will not tell you that rows were dropped.

### The whole import failed with "Import failed. Please check the file format and try again."

**What it means.** The file failed structurally and the import was rolled back in full. Nothing was imported.

**What to do.**

1. Check the file is **under 2 MB** and is `.csv` or `.txt`.
2. Download a fresh **import template** and copy your data into it, rather than editing your own file. The template's columns are in the expected order.
3. If your file has a header row, make sure the names are recognisable — the system matches many aliases, but an exotic header like `Mobile No. of Prospect` will not match anything. Either rename the column or remove the header row so the columns are read positionally.
4. If a cell contains a comma, quote it: `"Andheri West, Mumbai"`.

### The import ignored my column order

**What it means.** The system auto-detects the header. If it finds at least three recognisable column names, it maps by name; otherwise it falls back to **positional** mapping in the order `name, phone, email, source, status, budget, preferred_location, requirements, score, next_followup`.

**What to do.** Download the template and match its column order exactly, or use clearly recognisable header names.

### "This lead cannot be converted in its current status."

**What it means.** The lead is `Converted` or `Lost`. Both are terminal.

**What to do.** If the deal genuinely was lost, leave it as `Lost` — that is what makes the lost-leads report accurate. If it was converted by mistake, an Admin can correct the status, or convert a different lead.

### Two people converted the same lead

This is **prevented by design** — the lead row is locked during conversion, so only one deal can ever be created from a lead. If it looks like it happened twice, check whether one of the two is a direct deal created on the pipeline board (which has no lead attached).

### A site visit was not created when I changed the status

**What it means.** The visit is created **once per lead**. If a visit already exists for that lead, no second one is made.

**What to do.** Open **Site Visits** and look for the existing one — update its date and status instead of expecting a new one.

### My next-follow-up date did not create a task

**What it means.** Usually one of three things:

1. The date did not parse, so the system fell back to **tomorrow**.
2. The task was **completed** because the previous follow-up date was cleared.
3. An open follow-up task already existed and was **updated** rather than duplicated.

**What to do.** Check **Tasks & Follow-ups** and filter by **Pending** or **Overdue**. The task is titled *"Follow-up: {lead name}"* and is assigned to the lead's agent.

### A follow-up task is Overdue but I was not notified

**What it means.** The daily sweep at 09:00 notifies the task's **assignee**. If the task has no assignee, it is flagged but nobody is told.

**What to do.** Open the task and set **Assign to** to the right person. The next sweep will notify them. Also note the **12-hour rule** — a second unread notice for the same lead will not be sent within 12 hours.

### The notification badge is not clearing

**What it means.** A notification is still marked unread.

**What to do.** Open the notification list from the bell and press **Mark all as read**. Note that the follow-up sweep will not re-send a notice for the same lead within 12 hours, so the badge will not immediately come back.

---

## 9.3 Properties & the Public Site

### My property is not showing on the public site

**What it means.** One of three things:

1. **"Show on website" is off.** This is the master switch and it hides the listing from listings *and* direct links. It is in the **Gallery & Website** step of the property form.
2. **The status is `Draft` or `Inactive`.**
3. It is a *featured* listing that the **CMS featured selection** has excluded.

**What to do.** Open the property → **Edit** → **Gallery & Website** and check the visibility switch. Then check **CMS / Website → Featured properties**.

### A direct link to my property returns 404

**What it means.** Either the property is not website-visible, or the link has been tampered with. Public links use an **encrypted** identifier, so a raw or hand-edited link will not resolve.

**What to do.** Get the link from the **Share** button on the property detail page rather than constructing it.

### The area box says "Land Area (acres)" but it says sq.ft elsewhere

**What it means.** The area label is set by the property **type**. `Farm/Land` is labelled in acres, `Commercial`/`Office`/`Shop`/`Warehouse` in carpet area, and the rest in built-up area.

**What to do.** The label does **not** convert the number. For a 5-acre plot, enter `5` under Farm/Land. If you want the value in square feet, change the property type or enter the converted figure and accept the label — or have an Admin adjust the type's label in the property type catalogue.

### An amenity vanished when I changed the property type

**What it means.** Amenities that are not valid for the new type are pruned automatically, and the form tells you how many were removed.

**What to do.** Change the type back, or re-add the amenity as a **custom** entry — custom amenities are never pruned. Alternatively, ask an Admin to add it to the new type's amenity list in **Amenities**.

### A lead I am working is not linked to the property

**What it means.** Only a **property enquiry** from the public site links a lead to a listing automatically. A lead created by an agent or imported from a CSV is linked only if you set **Interested property** on it.

**What to do.** Edit the lead and set the interested property.

---

## 9.4 Pipeline, Bookings & Payments

### I cannot drag a card on the pipeline board

**What it means.** Moving a card needs `sales.edit`. You probably hold `sales.view` only — which is the **Accountant** role's situation: they can see the board to reconcile bookings, but cannot move anything.

**What to do.** Ask for `sales.edit` if you genuinely need to move deals.

### The booking shows "Under Agreement" but the agreement is not signed

**What it means.** That is expected. The **booking status** and the **agreement status** are **two independent tracks**.

**What to do.** Change the **agreement status** dropdown separately. A booking can be *Under Agreement* while the agreement is still *Pending* or *Under Review*.

### A payment will not save

**What it means.** Usually a missing or invalid value.

**What to do.** Check the amount is a number, the mode is one of the seven offered values, and the due date is a real date. If you are recording from a booking, the **amount** is required.

### The payment total does not match the booking amount

**What it means.** A booking's **booking amount** and its **payments** are separate records. A booking can have a booking amount of ₹50 L and one payment of ₹5 L recorded against it.

**What to do.** Look at the **linked payments** list on the booking detail page to see what has actually been received. The booking amount is what was agreed; the payments are what arrived.

### The transaction id shows "—"

**What it means.** Payments created from a booking get a placeholder transaction id, because there is no payment gateway to generate a real one.

**What to do.** Edit the payment and replace it with the actual UTR or cheque number so the accounts team can trace it.

### The Reports export button is missing

**What it means.** The **CSV** export needs `reports.export`. The **PDF** export only needs `reports.view`, so you may have the PDF and not the CSV.

**What to do.** Ask for `reports.export` if you need the spreadsheet. Sales Executives and Senior Agents have `reports.view` only, so this is expected for them.

---

## 9.5 Administration

### "System roles cannot be modified."

**What it means.** Super Admin and Admin are **system** roles and are locked.

**What to do.** Create a **custom role** with the permissions you want and move the affected users onto it. That is the supported path, and it leaves the system roles intact.

### "Cannot delete role that is assigned to N user(s)."

**What it means.** A role still in use cannot be deleted.

**What to do.** Move those users to another role first, then delete it. If you just want the role to stop being used, create a replacement with the same name but different permissions and move the users across.

### "Only a Super Admin can grant the Super Admin role."

**What it means.** Even an Admin cannot assign the `super-admin` role.

**What to do.** Ask a Super Admin directly.

### "The Super Admin account cannot be deleted."

**What it means.** That guard is permanent and is there to prevent the agency locking itself out.

**What to do.** Set the account to **Inactive** instead if the person has left. Note that the account then remains in the system, still holding its permissions, and is still hidden from non-Super-Admins.

### "You cannot delete your own account."

**What it means.** Self-deletion is blocked.

**What to do.** Ask another administrator to deactivate you and delete the account.

### A user's email change did not go through

**What it means.** The email-change flow is OTP-protected in both directions. All four steps must complete:

1. Code sent to the **current** email → verified.
2. Code sent to the **new** email → verified.

**What to do.**

- The code is 6 digits and lives for **10 minutes**. Request a new one rather than retrying a stale code.
- You can only request a new code every **60 seconds**.
- After **5** wrong attempts you must request a fresh code.
- The "verify current email" step always appears to succeed, even if the address is wrong — that is deliberate, to avoid revealing which addresses exist.

### The SMTP password field looks empty / will not save

**What it means.** The stored SMTP password is masked on purpose.

**What to do.** Leave the field blank (or type `********`) and save — the existing password is preserved. Only type a new value to replace it. Then press **Test mail** to confirm the configuration still works.

### I deleted a media file but the property photo is still there

**What it means.** That is expected. Property photos belong to the **property record**, not to the media library.

**What to do.** Remove the photo from the property's own gallery (**Edit property → Gallery & Website**).

---

## 9.6 General FAQ

### How do I change a value that I am not allowed to change?

You cannot, if you are on the **Settings** screen. Settings is the one screen where field-level permissions are actually enforced: if you lack `settings.edit.{field}` the server refuses the save, and only a Super Admin holds `settings.edit.project_name`.

On **every other** screen there is no field-level enforcement today — if a box is present you can edit it, and if it is absent it is because the whole module or action is gated, not the individual field. Field permissions for other modules exist in the catalogue for planning but are not yet read by the application, so asking for `leads.edit.source` on its own will not currently hide or lock that field. See the note in [`02-roles-and-access.md`](./02-roles-and-access.md#idea-2-some-permissions-are-field-level).

### Why does the same action sometimes work and sometimes not?

The usual cause is **row-level scoping**, not permissions. You may hold `leads.edit` and still be refused whenever the lead is not yours — see [Access & Login](#91-access-login) above.

Two mechanisms are genuinely in play:

- **Route permissions** are checked on every request. If one fails, you get a red toast.
- **Field-level permissions** are checked on the **Settings** screen only, and there they refuse the save rather than hiding the field.

### A field is present but will not save. Why?

On **Settings**, it is a field-level permission (`settings.edit.{field}`) — an Admin lacks `settings.edit.project_name`, for example.

On any other screen a refusal to save is far more likely to be **row-level scoping** (the record is not yours) or a **validation** error. Check the message next to the field.

### Why is a menu item missing?

The sidebar only shows modules where you hold `module.view`. A role with only `leads.create` but not `leads.view` will not see the Leads module at all. (The sidebar is the *only* place that hides controls by permission — action buttons elsewhere render regardless and are refused on click.)

### Do I need to refresh after a change?

Sidebar and button visibility update on the next page load. If a change you just made to your own role or profile does not appear, reload the page.

### Can two people edit the same record at once?

Yes, and the last save wins. QREX does not lock a record against concurrent editing — except during **lead conversion**, which is deliberately protected so a lead can never produce two deals. If two people are working the same lead, coordinate by hand.

### Does anything email me about my leads?

No, by default. QREX sends only three kinds of email: **password resets**, **new-user invitations**, and **email-change OTP codes**. All other alerts — new lead, site visit, deal assigned, booking, payment, follow-up — are **in-app notifications** in the bell menu. Open the bell rather than waiting for an email.

### Is there a way to log my emails or WhatsApp messages automatically?

No. Activities are logged manually. That is deliberate: it keeps the timeline honest, because only you know what actually happened on a call.

### Can I delete a lead?

There is no delete button. Set the status to `Lost` instead — it preserves the history and makes the lost-leads report accurate.

### Why is my report showing fewer leads than the Leads list?

Two likely reasons:

1. **Scoping.** Sales Executives and Senior Agents see only their own leads in both places, but the report also applies the **date range** — check it is set to *All* if you expect a full picture.
2. **The report tab is filtered.** The agent and property dropdowns narrow every tab.

### The public website shows a listing I have already sold

Change the status to `Sold` — it stays listed, which is usually what you want for a sold-property page. To take it down entirely, switch off **Show on website** or set the status to `Inactive`.

### Something looks like a bug

Collect these before reporting it:

- The **exact URL** you were on
- The **exact action** you took
- The **exact message** (screenshot it — toasts disappear after 3.5 seconds)
- Your **role** (shown in your profile menu)
- The **time** it happened

That is usually enough to pinpoint the cause.

---

## 9.7 Quick reference — the messages you will see

| Message | Module | Meaning | Who can fix it |
| --- | --- | --- | --- |
| You do not have permission to perform this action. | Any | The role lacks the permission | An Admin, by editing the role |
| You do not have the required role to access this page. | Settings | Super-Admin-only action | A Super Admin |
| You do not have access to this lead. | Leads | Row-level scoping | The lead's owner, by handing it over |
| This lead cannot be converted in its current status. | Leads | The lead is `Converted` or `Lost` | An Admin, if it was a mistake |
| Import failed. Please check the file format and try again. | Leads | The import rolled back | Re-import using the template |
| System roles cannot be modified. | Roles | System roles are locked | Create a custom role instead |
| System roles cannot be deleted. | Roles | System roles are locked | — |
| Cannot delete role that is assigned to N user(s). | Roles | The role is still in use | Move the users first |
| Only a Super Admin can grant the Super Admin role. | Users | Privilege guard | A Super Admin |
| The Super Admin account cannot be deleted. | Users | Privilege guard | Deactivate instead |
| You cannot delete your own account. | Users | Privilege guard | Another administrator |
| User invited. They will receive an email to set their password. | Users | Success — the invite was emailed | The user, if the email does not arrive (SMTP) |
| Too many verification attempts. Please request a new code and try again later. | Profile | 5 wrong OTP attempts | Wait, then request a new code |

---

**Back to:** [`README.md`](./README.md) — the manual index.
