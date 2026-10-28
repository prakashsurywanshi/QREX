# 6. Marketing & Administration Modules

Covers **Marketing**, **Media Center**, **Reports & Analytics**, **CMS / Website**, **Users**, **Roles & Permissions**, the **Permission catalog** and **Settings**.

| Module | Who can see it |
| --- | --- |
| Marketing | Super Admin, Admin, Marketing User |
| Media Center | Super Admin, Admin, Sales Executive, Senior Agent, Marketing User, Accountant (view) |
| Reports & Analytics | Super Admin, Admin, Sales Executive, Senior Agent, Marketing User, Accountant |
| CMS / Website | Super Admin, Admin, Marketing User |
| Users | Super Admin, Admin |
| Roles & Permissions | Super Admin, Admin |
| Permission catalog | Super Admin, Admin |
| Settings | Super Admin, Admin |

---

## 6.1 Marketing — Campaigns

**URL:** `/admin/marketing` · **Permissions:** `marketing.view` / `.create` / `.edit`

### Creating a campaign

**Marketing** → **New campaign**:

| Field | Default | Notes |
| --- | --- | --- |
| **Name** | | The campaign's internal name |
| **Channel** | **Facebook + Instagram** | The medium. Other common values: Facebook, Instagram, Google, WhatsApp, Referral, Newspaper, Hoardings, Website |
| **Budget** | | Total budget, in rupees. Shown in words as you type |
| **Start date** | | |
| **End date** | | |

A campaign is created with status **Scheduled**. The **Status** field is then set to **Active** when it goes live, and **Paused** or **Completed** when it ends.

| Status | Meaning |
| --- | --- |
| **Scheduled** | Created, not live yet |
| **Active** | Running now |
| **Paused** | Temporarily stopped |
| **Completed** | Finished |

### What the page shows

**Campaign KPIs** — total budget · total spend · leads generated · revenue attributed.

**Charts** — a lead-source breakdown (where all enquiries came from) and a conversion comparison (leads vs conversions vs revenue per source).

**Landing-page leads** — the list of leads that came in through the website, so you can see what the campaign actually produced.

**Property promotions** — a carousel of listings being pushed. Note: this panel picks up properties whose status is *Ready to Move* or *Under Construction*, which are **not** among the standard property statuses. If a listing is not in the standard list, it will not appear here.

### Attributing a lead to a campaign

A lead carries a `campaign_id`. Set it when you create the lead, or select it in the lead's edit form, or pass it during a **CSV import** (the import screen has a campaign selector). This is what makes the campaign report meaningful — a campaign with no attributed leads reports zero regardless of what you spent.

---

## 6.2 Media Center

**URL:** `/admin/media` · **Permissions:** `media.view` / `.create` / `.delete`

A shared library of images and documents, so assets are not scattered across individual laptops.

### Using it

1. **Upload** — choose a file, give it a name, drop it into a **folder**, optionally associate it with a property, and save. The name and size are pre-filled from the file.
2. **Browse** — the left sidebar filters by folder. **All** shows everything.
3. **Storage** — the page shows how much space the library is using.
4. **Preview** — images can be previewed in place. Other file types (PDF, video, documents) show a type icon instead.
5. **Delete** — removes the file from the library. Deleting is a separate permission from uploading, and it is not reversible.

**Default folder:** Properties. Create new folder names as you need them — a new name simply appears in the sidebar.

> **Deleting a media file does not remove the photo from a property.** Property photos live on the property record, not in the media library. Use the property's own gallery to remove those.

---

## 6.3 Reports & Analytics

**URL:** `/admin/reports` · **Permissions:** `reports.view` (to open) and `reports.export` (to download)

### 6.3.1 Controls

**Range** — Today · 7 Days · 30 Days · 90 Days · YTD · All. Applies to the whole report.

**Filters** — **Agent** and **Property**. Both narrow every tab.

> **Scoping.** Sales Executives and Senior Agents see figures for their own leads only. Admins, Super Admins, Marketing Users and Accountants see the whole agency.

### 6.3.2 The ten tabs

| Tab | What it shows | CSV export type |
| --- | --- | --- |
| **Overview** | Revenue by month and lead counts | `revenue` |
| **Sales** | Revenue and sales trend | `revenue` |
| **Leads** | Leads by source, by status, over time | `leads` |
| **Conversion** | Lead → deal → won conversion rates | `revenue` |
| **Agent Performance** | Closed-won deals and revenue per agent | `agents` |
| **Property Performance** | Top properties by leads, deals and engagement | `properties` |
| **Payments** | Collected vs pending, by month | `payments` |
| **Campaigns** | Budget, spend, leads, conversions and ROI per campaign | `campaigns` |
| **Site Visits** | Scheduled, completed, cancelled, rescheduled totals | `sitevisits` |
| **Lost Leads** | Lost vs converted, and lost leads broken down by source | `leads` |

**Lost Leads is the report to read every week.** It tells you whether the loss is happening at the top of the funnel (a bad channel), the middle (nobody is following up), or the end (the price is wrong).

### 6.3.3 Exporting

Two buttons, two formats:

| Format | Requirement | Output |
| --- | --- | --- |
| **CSV** | `reports.export` | `report-<type>-<timestamp>.csv` |
| **PDF** | `reports.view` | `report-<type>-<timestamp>.pdf` |

The export respects the range, agent and property filters you have set, and it exports the tab you are currently on.

> **Note the asymmetry:** the PDF is available to anyone who can view reports, but the **CSV** needs `reports.export`. If the CSV button is missing but the PDF button is present, that is the permission system — ask an Admin for `reports.export` if you need the spreadsheet.

> **CSV safety.** Values beginning with `=`, `+`, `-` or `@` are escaped with a leading apostrophe, so a crafted export cannot execute as a formula when opened in Excel. You may notice an apostrophe at the start of some cells. That is intentional — do not remove it in bulk, and do not open untrusted CSVs with macros enabled.

### 6.3.4 Money units in reports

Some tables are labelled **"in L"** (lakhs) and some **"in Cr"** (crores). Read the column heading before comparing two figures. The **Overview** and **Sales** tabs mix both, deliberately.

---

## 6.4 CMS / Website

**URL:** `/admin/cms` · **Permissions:** `cms.view` / `.edit`

This screen controls what the public website shows.

### 6.4.1 Homepage sections

Each section of the home page has a **visibility toggle**:

| Section | Default |
| --- | --- |
| 🏠 Hero Section | Visible |
| 🔍 Property Search Bar | Visible |
| ⭐ Featured Properties Slider | Visible |
| 📊 Statistics & Numbers | Visible |
| 🏘️ Property Categories | Visible |
| 🏢 About Agency | Visible |
| 👥 Our Agents | Visible |
| 💬 Testimonials | **Hidden** |
| 📞 Call to Action | Visible |
| ✉️ Contact Form | Visible |

Toggling a section off hides it from the public home page. It does not delete any content, and you can switch it back on at any time.

> **Testimonials ships hidden.** Turn it on only if you have real, approved testimonials — the public site shows three of them.

### 6.4.2 Featured properties

**Featured properties** controls which listings appear in the home page slider, in a specific order. Click through, select the properties you want, and save. The selection is stored explicitly, so the order you choose is the order visitors see.

This is separate from the per-property **Featured** flag in the property form. A property can be flagged `featured` without appearing in the slider if the CMS selection overrides it — **check the CMS screen** when a listing you flagged is not showing.

### 6.4.3 Also on this screen

- **All properties** — every listing, for reference.
- **Agent directory** — the agents displayed on the public site.

---

## 6.5 Users

**URL:** `/admin/users` · **Permissions:** `users.view` / `.create` / `.edit` / `.delete`

### 6.5.1 The list

Every user with their ID (`U-001` format), name, email, phone, **role**, **branch**, status and last login.

**Filter by role** using the tabs across the top — All, plus one tab per role.

> **Super Admin accounts are hidden** from anyone who is not a Super Admin, and a direct link to one returns **404**. This is deliberate — it avoids confirming that a privileged account exists.

### 6.5.2 Adding a team member

**Users** → **Add user**:

| Field | Notes |
| --- | --- |
| **Name** | Required |
| **Email** | Required. Must be unique across the system |
| **Phone** | Optional |
| **Role** | Required. Defaults to *Sales Executive* |
| **Branch** | Optional. Defaults to **HQ Mumbai** |

The account is created **Active**, with a random temporary password, and an email is sent to the new user with a **set-your-password** link. They click it, choose their own password, and are in.

You never see or set their password — that is the point.

> **Granting Super Admin is restricted.** Only a Super Admin can assign the `super-admin` role. Anyone else attempting it is refused with *"Only a Super Admin can grant the Super Admin role."* If you need a colleague to have it, ask a Super Admin.

### 6.5.3 Editing a user

From the user list or the user's detail page, you can change:

| Field | Notes |
| --- | --- |
| **Name, Email, Phone, Branch** | Straightforward edits |
| **Role** | Changing the role changes their permissions immediately |
| **Status** | **Active** or **Inactive**. An Inactive account **cannot sign in**, even with the right password |
| **Password** | Optional. If you set one here, the user can sign in with it directly |

> **Prefer Inactive over Delete.** Deactivating keeps every lead, task, booking and activity the person created attached to their name. Deleting breaks that history. **Deactivate leavers; delete only duplicates and test accounts.**

### 6.5.4 Deleting a user

Two guards:

| Situation | Result |
| --- | --- |
| The target is a Super Admin | Refused: *"The Super Admin account cannot be deleted."* |
| The target is you | Refused: *"You cannot delete your own account."* |

---

## 6.6 Roles & Permissions

**URL:** `/admin/roles` · **Permissions:** `roles.view` / `.create` / `.edit` / `.delete`

### 6.6.1 The role cards

One card per role, showing its description, how many permissions it holds, how many users have it, and whether it is a **system** role.

| Role | Type | Notes |
| --- | --- | --- |
| Super Admin | System | All 132 permissions |
| Admin | System | All but two |
| Sales Executive | Editable | |
| Senior Agent | Editable | |
| Marketing User | Editable | |
| Accountant | Editable | |

### 6.6.2 Creating a custom role

**Create Role** → give it a **name** and a **description** → tick the permissions in the matrix → save.

The slug is generated from the name automatically (*"Team Lead - North Mumbai"* becomes `team-lead-north-mumbai`).

The matrix is organised **module × action**. Each cell has three states:

| Cell state | Meaning |
| --- | --- |
| **Full** | The role holds the action |
| **Partial** | The role holds *some* field-level permissions for that action but not the action itself |
| **None** | The role holds nothing here |

Clicking a cell cycles it. For modules with field-level permissions, expanding a cell reveals the individual fields.

### 6.6.3 Editing and deleting

| Action | Guard |
| --- | --- |
| Edit a **system** role | Refused: *"System roles cannot be modified."* |
| Delete a **system** role | Refused: *"System roles cannot be deleted."* |
| Delete a role that still has **users** | Refused: *"Cannot delete role that is assigned to N user(s)."* |
| Delete a custom, unassigned role | Allowed |

To change what a system role can do, create a custom role instead and move the affected users onto it.

### 6.6.4 The permission catalog

**URL:** `/admin/permissions` · **Permission:** `roles.view`

A read-only list of every permission in the system, grouped by module, with a text filter to narrow it down. Field-level permissions carry a small badge.

There are **132** permissions: **67** action permissions and **65** field-level permissions. The complete catalog is printed in [`08-reference.md`](./08-reference.md#6-permission-catalog).

> This screen is not in the sidebar. Reach it directly at `/admin/permissions`.

---

## 6.7 Settings

**URL:** `/admin/settings` · **Permissions:** `settings.view` / `settings.edit`

Four sections everyone with access can use, plus four Super-Admin-only actions.

### 6.7.1 General Information

Project name · agency name · tagline · contact email · contact phone · address · currency · timezone · date format.

These feed the public website's header, footer and contact page. The **agency name** is what the public site shows in the header (falling back to the project name, then "QREX").

> **Field-level permission applies here.** The save action checks **each key individually** against `settings.edit.<key>`. If you hold `settings.edit` but not `settings.edit.project_name`, your save will apply every other change you made **and silently skip the project name**. Check the result after saving.

### 6.7.2 Branding

Primary colour and accent colour, plus controls for what content is displayed. These change the public site's look.

### 6.7.3 Notifications

Four switches:

| Switch | Meaning |
| --- | --- |
| **Lead Auto-Assignment** | Automatically assign new leads to available agents |
| **Site Visit Reminders** | Notify agents before upcoming site visits |
| **Payment Alerts** | Alert on due and overdue instalments |
| **Low Inventory Alert** | Notify when property listings run low |

> These switches store the agency's policy. The follow-up notifications you actually receive in-app are generated by the daily scheduler and are not switched off by these toggles.

### 6.7.4 Security

| Switch | Meaning |
| --- | --- |
| **Two-Factor Authentication** | Require an OTP for all admin logins |
| **Maintenance Mode** | Temporarily hide the public website |

> **Verify before you rely on them.** These are stored preferences with defined meanings, but the OTP-on-login flow is not wired into the sign-in screen in this build, and the public website does not consult the maintenance flag. Treat them as configuration to confirm with your technical contact, not as a working control.

### 6.7.5 SMTP / Email Configuration — Super Admin only

Gated by the `super-admin` **role** on top of any permission, so an Admin cannot reach it.

| Field | Notes |
| --- | --- |
| **Enable SMTP** | Off means mail is written to the log file instead of being sent |
| **Host, Port, Username, Password, Encryption** | Your mail server's details |
| **From address, From name** | The sender on outgoing mail |
| **Test email** | Where the test message is sent |

**How the password field behaves.** Leave it blank (or enter `********`) and the stored password is preserved unchanged. Enter a new value and it replaces the old one. This is deliberate — a blank field never wipes a working password.

**Test mail.** *Test mail* sends a real message through the configured server and reports success or the error. Run it after any change to the SMTP settings, and before you invite a new user.

> **Why this matters.** Password resets, new-user invitations and email-change OTPs all depend on working SMTP. If it is not configured, those flows fail silently from the user's point of view — they click "forgot password" and nothing arrives.

### 6.7.6 Logo — Super Admin only

**Upload logo** replaces the site logo (stored under `settings/` on the public disk) and **Remove logo** deletes it. Deletion is restricted to files inside the `settings/` folder so a stray path cannot remove something else.

The logo appears in the public site's header, the admin sidebar and the email notifications.

---

**Next:** [`07-public-website.md`](./07-public-website.md) — the public site, and how enquiries become leads.
