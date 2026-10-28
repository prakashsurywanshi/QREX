# 2. Roles & Access

## 2.1 How Access Works in QREX

QREX uses a **role-based access control (RBAC)** system. Three ideas explain everything you will see:

### Idea 1 — A permission is a small, named ability

Permissions are written as `module.action`:

| Slug | Meaning |
| --- | --- |
| `leads.view` | Open and read the Leads module |
| `leads.create` | Add a new lead |
| `leads.edit` | Change an existing lead |
| `leads.delete` | Remove a lead |
| `leads.export` | Export leads to a file |

Some modules add a fifth action — `bookings.approve` — and `reports` has only two (`view`, `export`).

### Idea 2 — Some permissions are *field-level*

For modules where you edit a record, QREX defines permission **per field** using `module.action.field`:

```
leads.edit.name        leads.edit.phone       leads.edit.email
leads.edit.source      leads.edit.status      leads.edit.budget
leads.edit.assigned_agent                    leads.edit.score
```

> **Important — only `settings.edit.*` is enforced today.** Field-level permissions are catalogued for eleven modules, but the application currently *checks* them in exactly one place: the **Settings** screen. There, a field you lack is refused by the server (this is how `settings.edit.project_name` is withheld from the Admin role).
>
> For every other module — `leads`, `properties`, `customers`, `tasks`, `site_visits`, `bookings`, `payments`, `marketing`, `cms`, `users` — the field permissions exist in the catalogue for planning purposes but are **not yet read by any admin screen or controller**. Holding `leads.edit` without `leads.edit.source` therefore does **not** currently stop you editing the source field, and the form does **not** hide it. Do not rely on field-level permissions to protect a field outside Settings.

Field-level permissions exist in the catalogue for: `properties`, `leads`, `customers`, `tasks`, `site_visits`, `bookings`, `payments`, `marketing`, `cms`, `users`, `settings` — of which only `settings` is enforced.

### Idea 3 — Your role is a bundle of permissions

You never hold permissions directly. You hold a **role**, and the role carries the permissions. Six roles ship with the system:

| Role | Slug | Type | Purpose |
| --- | --- | --- | --- |
| Super Admin | `super-admin` | System | Full access to everything |
| Admin | `admin` | System | Everything except two system-level permissions |
| Sales Executive | `sales-executive` | Editable | Front-line sales work |
| Senior Agent | `senior-agent` | Editable | Front-line sales work plus the deal pipeline |
| Marketing User | `marketing-user` | Editable | Campaigns, website content, media |
| Accountant | `accountant` | Editable | Bookings, payments, reporting |

Admins can also create **custom roles** to fit how the agency is actually organised (for example "Team Lead – North Mumbai"). Custom roles are fully editable and deletable; the two system roles are not.

---

## 2.2 The Seven Personas

### Persona 1 — Public visitor

No account, no password. Can browse the public site, filter listings, view photos and submit enquiry forms. Every enquiry becomes a **Lead** in the CRM. See [`07-public-website.md`](./07-public-website.md).

### Persona 2 — Sales Executive

**The front-line relationship owner.** Sees the sales side of the business and works their own book of business.

| Can | Cannot |
| --- | --- |
| Open the Dashboard | See leads belonging to other agents |
| Browse, create and edit **Properties** | Delete properties |
| Create, view and edit **Leads** | Edit a lead's *source* field |
| Log activity, change status, hand over a lead | Delete leads |
| Create and edit **Customers** | Use the **Sales Pipeline** |
| Create and edit **Site Visits** | Create or edit **Bookings** or **Payments** |
| Create and edit **Tasks** | Delete tasks |
| Upload **Media** | Export reports |
| View **Reports** | Touch Marketing, CMS, Users, Roles, Settings |

**Row-level scoping applies.** A Sales Executive sees only leads where they are the assigned agent **or** the owner. Opening a lead you do not own returns a 403.

### Persona 3 — Senior Agent

Everything a Sales Executive can do, **plus**:

| Extra | Slug |
| --- | --- |
| Open the **Sales Pipeline** board | `sales.view` |
| Create a **deal** directly on the board | `sales.create` |
| Move a deal between pipeline stages | `sales.edit` |
| Edit a lead's **source** field | `leads.edit.source` |

Still no bookings, no payments, no deletions, no administration.

### Persona 4 — Marketing User

Owns demand generation and the public-facing site.

| Can | Cannot |
| --- | --- |
| Open the Dashboard | Edit or delete leads (create and view only) |
| View and create **Leads** (so campaigns can be attributed) | Touch Properties, Customers, Site Visits, Tasks |
| Create, view and edit **Campaigns** | Use the pipeline, bookings or payments |
| View and edit **CMS** — homepage sections, featured properties, site copy | Administer users, roles, settings |
| Upload **Media** | Delete media |
| View and **export Reports** | — |

### Persona 5 — Accountant

Owns the money, and can see the pipeline in order to reconcile bookings.

| Can | Cannot |
| --- | --- |
| Open the Dashboard | Create or edit leads |
| View **Customers** | Touch properties, campaigns, CMS |
| View the **Sales Pipeline** (read-only — cannot create or move deals) | Create deals or move stages |
| Create and edit **Bookings** — status, agreement, possession, record payment | Delete anything |
| Create and edit **Payments** | Administer users, roles, settings |
| View and **export Reports** | — |
| View **Media** | — |

### Persona 6 — Admin

A near-complete operator. Holds **every one of the 132 permissions** except exactly two:

| Withheld | Why it matters |
| --- | --- |
| `settings.edit.project_name` | The Admin can change the agency name, contact details, tagline, colours and logo, but **not** the project's internal name — the Super Admin owns that. |
| `roles.delete` | The Admin can create and edit roles but cannot delete one. |

On top of permissions, the **SMTP configuration**, **test-mail** and **logo upload/delete** endpoints are additionally gated behind the `super-admin` *role* — so an Admin cannot touch outgoing mail even though they hold `settings.edit`.

### Persona 7 — Super Admin

Full access. Holds all 132 permissions and is the only role that passes the `role:super-admin` gate on SMTP, test mail and the logo.

The Super Admin also has a **universal bypass**: the access-check middleware short-circuits for a Super Admin and lets the request through without re-checking permissions. In practice a Super Admin holds every permission anyway, so the bypass only matters in edge cases.

**Super Admin is a real person, not a magic account.** Guardrails that still apply:

- The **Super Admin account itself cannot be deleted** — the system refuses with *"The Super Admin account cannot be deleted."*
- **System roles cannot be modified or deleted** — *"System roles cannot be modified."* / *"System roles cannot be deleted."*
- A **role that still has users assigned cannot be deleted** — *"Cannot delete role that is assigned to N user(s)."*
- **Only a Super Admin can grant the Super Admin role** to a user — anyone else attempting it is refused with *"Only a Super Admin can grant the Super Admin role."*

---

## 2.3 Capability Matrix

Read it as: **✓ = the seeded role holds the permission; — = it does not.** The 132-permission slug catalog is in [`08-reference.md`](./08-reference.md#6-permission-catalog).

### Module access

| Module | Super Admin | Admin | Sales Exec | Senior Agent | Marketing | Accountant |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Properties | ✓ | ✓ | ✓ | ✓ | — | — |
| Leads | ✓ | ✓ | ✓ | ✓ | ✓ (view, create) | — |
| Customers | ✓ | ✓ | ✓ | ✓ | — | ✓ (view) |
| Sales Pipeline | ✓ | ✓ | — | ✓ | — | ✓ (view) |
| Site Visits | ✓ | ✓ | ✓ | ✓ | — | — |
| Tasks | ✓ | ✓ | ✓ | ✓ | — | — |
| Bookings | ✓ | ✓ | — | — | — | ✓ |
| Payments | ✓ | ✓ | — | — | — | ✓ |
| Media | ✓ | ✓ | ✓ (view, create) | ✓ (view, create) | ✓ (view, create) | ✓ (view) |
| Marketing | ✓ | ✓ | — | — | ✓ | — |
| Reports | ✓ | ✓ | ✓ (view) | ✓ (view) | ✓ (view, export) | ✓ (view, export) |
| CMS | ✓ | ✓ | — | — | ✓ | — |
| Users | ✓ | ✓ | — | — | — | — |
| Roles | ✓ | ✓ (not delete) | — | — | — | — |
| Amenities | ✓ | ✓ | — | — | — | — |
| Settings | ✓ | ✓ (not `project_name`) | — | — | — | — |

### Action-level detail

| Module | Super Admin | Admin | Sales Exec | Senior Agent | Marketing | Accountant |
| --- | --- | --- | --- | --- | --- | --- |
| Properties | view create edit delete export | same | view create edit | view create edit | — | — |
| Leads | view create edit delete export | same | view create edit | view create edit | view create | — |
| Customers | view create edit delete export | same | view create edit | view create edit | — | view |
| Sales | view create edit delete export | same | — | view create edit | — | view |
| Tasks | view create edit delete | same | view create edit | view create edit | — | — |
| Site Visits | view create edit delete | same | view create edit | view create edit | — | — |
| Bookings | view create edit delete approve | same | — | — | — | view create edit |
| Payments | view create edit delete export | same | — | — | — | view create edit |
| Media | view create delete | same | view create | view create | view create | view |
| Marketing | view create edit delete export | same | — | — | view create edit | — |
| Reports | view export | view export | view | view | view export | view export |
| CMS | view create edit delete | same | — | — | view create edit | — |
| Users | view create edit delete | same | — | — | — | — |
| Roles | view create edit delete | view create edit | — | — | — | — |
| Amenities | view create edit delete | same | — | — | — | — |
| Settings | view edit | view edit | — | — | — | — |

### Field-level detail

Only the roles listed hold field-level permissions, and only for the fields named.

> **Remember:** outside **Settings**, these field permissions are catalogued but not enforced. The table records what the seeder grants, not what the application checks. See the warning under [Idea 2](#idea-2-some-permissions-are-field-level).

| Module | Fields you can be granted | Sales Exec | Senior Agent |
| --- | --- | --- | --- |
| `properties.edit` | price, title, status, description, area, bedrooms, bathrooms, amenities, featured, agent | all ten | all ten |
| `leads.edit` | name, phone, email, source, status, budget, assigned_agent, score | all **except `source`** | all eight |
| `customers.edit` | name, phone, email, type, budget, notes | all six | all six |
| `tasks.edit` | title, status, priority, due_date, assigned_to | all five | all five |
| `site_visits.edit` | date, time, status, feedback, notes | all five | all five |
| `bookings.edit` | amount, status, payment_mode, notes | — | — |
| `payments.edit` | amount, status, mode, date, notes | — | — |
| `marketing.edit` | name, budget, status, channels, content | — | — |
| `cms.edit` | content, featured, seo | — | — |
| `users.edit` | name, email, phone, role, branch, status, password | — | — |
| `settings.edit` | project_name, agency_name, contact_email, contact_phone, address, tagline, logo | — | — |

Super Admin and Admin hold every field-level permission.

---

## 2.4 Row-Level Scoping — Why You Cannot See Every Lead

Permissions answer *"can I open the Leads module?"*. Scoping answers *"which leads inside it?"*.

| Your role | Leads you can see |
| --- | --- |
| Super Admin | **All** leads |
| Admin | **All** leads |
| Senior Agent | Only leads where **you are the assigned agent** or **you are the owner** |
| Sales Executive | Only leads where **you are the assigned agent** or **you are the owner** |
| Marketing User | All leads (they need to see campaign attribution) |
| Accountant | All leads |

The rule is enforced in two places:

1. **The list.** Leads are filtered as the list is drawn, so other agents' leads simply are not in the page.
2. **The record.** Opening, editing, reassigning, changing the status of, logging activity against, or converting a lead you do not own is refused with **403** and the message *"You do not have access to this lead."*

**What this means practically:**

- If a colleague tells you "I sent you a lead", it may not be visible to you yet. Check that you are the **assigned agent** or the **owner** — the owner field is set automatically when the lead is created or handed over.
- Reports apply the same scoping, so a Sales Executive's report figures cover their own leads only.
- Handing a lead over to another agent (`assigned_agent_id` + `owner_id` are both moved together) is what makes it appear in that person's list.

---

## 2.5 What Happens When Access Is Refused

| Situation | What you see |
| --- | --- |
| You click something you cannot use, in the browser | A **red toast**: *"You do not have permission to perform this action."* You are returned to the page you came from and nothing is changed |
| You reach a Super-Admin-only screen (SMTP, logo) | A **red toast**: *"You do not have the required role to access this page."* |
| You open a lead that is not yours | **HTTP 403** — *"You do not have access to this lead."* |
| You open a Super-Admin user record as a non-Super-Admin | **HTTP 404** — the record is deliberately hidden, not merely forbidden |
| An API/integration call | **HTTP 403** with a JSON body naming the permission that was required |

**Why a 404 for Super Admin users?** To avoid confirming that a privileged account exists. A non-Super-Admin asking for `/admin/users/{id}` of a Super Admin gets the same answer as asking for a user that does not exist.

**What is hidden, and what is merely refused.** The **sidebar** is permission-aware: a module you cannot `view` does not appear in the navigation at all. Beyond the sidebar, however, action buttons are **not** hidden — a **Delete** button will render for a role that lacks `properties.delete`, and the server refuses the request with the red toast when it is pressed. So:

- A **missing menu item** means you lack `module.view`.
- A **visible control that refuses** means you lack the specific action permission. That is expected behaviour, not a bug.

---

## 2.6 Asking for More Access

Access is granted by changing a **role**, not an individual user. So the request is always: *"please add X to the Sales Executive role"* or *"please create a new role for me"*.

**What to tell your administrator:**

1. The **module** you need (Leads, Bookings, Reports…).
2. The **action** you need (view, create, edit, delete, export, approve).
3. If it is an edit action, the **specific fields** you need to change.
4. Whether the access should be **temporary** — a temporary role can be created and deleted afterwards.

**Typical requests and their permission names:**

| "I need to..." | Permission |
| --- | --- |
| See other agents' leads | Not a permission — a Super Admin or Admin must place the lead in your name, or give you a different role |
| Download a report | `reports.export` |
| Move a deal across the pipeline | `sales.edit` |
| Delete a listing | `properties.delete` |
| Change a lead's source | `leads.edit.source` |
| Manage the website homepage | `cms.edit` |
| Change the agency's name and logo | `settings.edit.project_name` and the `super-admin` role (SMTP/logo) |

---

## 2.7 Admin Procedures

These are covered in full in [`06-modules-marketing-and-admin.md`](./06-modules-marketing-and-admin.md), but the shape is here.

### Changing someone's role

**Users** → click the user → change **Role** → save. The permission set follows the role immediately — the user does not need to sign out, but their sidebar will update on their next page load.

### Creating a custom role

**Roles & Permissions** → **Create Role** → give it a name, a description, and tick the permissions in the matrix → save. The slug is generated from the name automatically (e.g. "Team Lead - Mumbai" becomes `team-lead-mumbai`).

### Guardrails when administering

| Action | Guard |
| --- | --- |
| Grant the `super-admin` role | Super Admin only |
| Delete a role that still has users | Blocked |
| Delete or edit a system role | Blocked |
| Delete the Super Admin account | Blocked |
| Delete your own account | Blocked |
| Set a user's status to **Inactive** | Allowed — and the recommended way to end access without deleting history |

---

**Next:** [`03-sales-lifecycle.md`](./03-sales-lifecycle.md) — how a lead becomes a closed, paid deal.
