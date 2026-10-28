# 5. Database Schema

All entities are created via Eloquent migrations in `database/migrations/`. Unless noted, tables use `StringField`s (Laravel 13 native string columns) and standard `timestamps()`.

## 5.1 Entity List

| Entity | Table | Notes |
| --- | --- | --- |
| User | `users` | + profile fields (phone, role, branch, status, avatar, last_login_at) |
| Role | `roles` | name, slug, description, is_system |
| Permission | `permissions` | name, slug, module, action, field, description |
| Role↔Permission | `role_has_permissions` | pivot |
| User↔Role | `model_has_roles` | polymorphic morph pivot (`model_type`, `model_id`) |
| Property | `properties` | soft deletes; `property_id` unique readable ID |
| Property Image | `property_images` | per-property gallery; `is_cover` flag |
| Lead | `leads` | soft deletes; `lead_id` unique; source/status strings; extended columns (created_by, campaign_id, owner_id) |
| Lead Activity | `lead_activities` | timeline; `type`, `title`, `description`, communication fields (duration, outcome, contact_number, email_subject, next_followup, location) |
| Lead Handover | `lead_handovers` | from_user_id, to_user_id, reason, notes |
| Deal | `deals` | soft deletes; `deal_id` unique; stage/probability/days_in_stage + stage_changed_at |
| Customer | `customers` | soft deletes |
| Site Visit | `site_visits` | soft deletes; `visit_id` unique; lead_id (via later migration) |
| Booking | `bookings` | soft deletes; `booking_id` unique; status/agreement_status/possession_status |
| Payment | `payments` | soft deletes; `payment_id` unique; status/due/paid dates |
| Campaign | `campaigns` | marketing campaigns |
| Media File | `media_files` | soft deletes |
| Notification | `notifications` | custom user-scoped notifications (not the framework's default) |
| Task | `tasks` | follow-ups & to-dos; `task_id` unique; lead_id, assigned_to_id |
| Setting | `settings` | `key`/`value`/`group` key-value store |
| Email OTP | `email_otps` | user_id, email, purpose, new_email, hashed code, expires_at, used_at |
| Sequence | `sequences` | prefix, context — backing the readable-ID generator |
| Personal access token | `personal_access_tokens` | Laravel Sanctum tokens |
| Cache, jobs, job batches, sessions | framework tables | default Laravel |

## 5.2 Key Relationships

```
User ──< Lead (assigned_agent_id / owner_id / created_by / agent as User)
User ──< Property (agent_id)
Property ──< PropertyImage
Property ──< Lead (interested_property_id)
Lead ──< LeadActivity ──< User
Lead ──< LeadHandover ──< User (from_user_id / to_user_id)
Lead ──0..1 Deal (lead_id)
Deal ──< Property (property_id)
Deal ──< User (assigned_agent_id)
Lead ──< Campaign (campaign_id)
SiteVisit ──< Lead (lead_id)
Task ──< Lead (lead_id) ──< User (assigned_to_id / created_by)
User >--< Role >--< Permission           (role_has_permissions, model_has_roles)
User ──< Notification
User ──< EmailOtp
```

## 5.3 Status Enums / Value Sets

### Lead status
`New, Contacted, Qualified, Site Visit Scheduled, Site Visit Completed, Negotiation, Converted, Lost`

### Lead source
`Website, Facebook, Instagram, Google, Referral, Walk-in, Phone, WhatsApp, Campaign`

### Deal stages (canonical pipeline order)
```
New Lead → Contacted → Qualified → Property Shortlisted → Site Visit Scheduled
→ Site Visit Completed → Negotiation → Booking → Agreement → Payment
→ Closed Won / Closed Lost
```
New deals default to `stage = 'Qualified'` with `probability = 30`. `stage_changed_at` records when a stage was last changed; `days_in_stage` is derived as the difference between now and `stage_changed_at`.

### Booking statuses
- `status`: `Booking Pending`, `Confirmed`, etc. (default `Booking Pending`)
- `agreement_status`: default `Pending`
- `possession_status`: default `Pending`

### Payment status
`Pending, Paid, Overdue, Partially Paid` (report treats Pending/Overdue/Partially Paid as outstanding)

### Site visit status
`Scheduled, Confirmed, Completed, Cancelled, Rescheduled`

### Task type / status
- `type`: e.g., `Follow-up`, general to-dos
- `status`: `Pending, Overdue, Completed`
- priority: e.g., `High`, `Medium`, `Low`

### Property flags
- `type`: Apartment, Villa, Plot, Commercial, Office, Shop, Warehouse, Farm/Land
- `featured` (bool), `is_website_visible` (bool), `transaction_type`, `status`
- `amenities` stored as a JSON array cast; `price`/`area` as decimal(15,2)/decimal casts

## 5.4 Soft Deletes & Data Retention

Primary business entities are **soft-deleted** so records remain queryable and reportable after deletion:

`leads, properties, customers, deals, bookings, payments, site_visits, media_files` (plus `roles`/`permissions` force-deleted only during seeding).

## 5.5 Indexes (enterprise hardening migration)

Hot query paths are indexed:

- `leads(branch: phone, status, source, assigned_agent_id, created_at)`
- `deals(stage, assigned_agent_id, lead_id)`
- `payments(status, due_date)`
- `bookings(status, booking_date)`
- `site_visits(status, lead_id, visit_date)`
- `tasks(lead_id, status, assigned_to_id)`
- `notifications(user_id, is_read, created_at)`
- `lead_activities(lead_id)`
- `property_images(property_id)`

## 5.6 `sequences` Table (readable ID generation)

`IdGenerator::next('L')` inserts `{prefix: 'L', context: ''}` and returns `L-<zero-padded id>`:

```
L-006    →  Lead
DL-012   →  Deal
TSK-007  →  Task
SV-003   →  Site visit
```

Other record-prefixing modules may reuse the same generator with their own prefixes (e.g., bookings/payments), using the same collision-free mechanism.

Concurrency is safe because uniqueness derives from the auto-increment primary key, never from a read-then-write race.

## 5.7 Settings Key Store

`Setting` is a generic `key`/`value`/`group` store. Key groups include `general`, `branding`, and `smtp_*` (e.g., `smtp_enabled`, `smtp_host`, `smtp_port`, `smtp_username`, `smtp_password`, `smtp_encryption`, `smtp_from_address`, `smtp_from_name`, `smtp_test_email`). `Setting::allAsArray()` returns saved values; controllers merge over their defaults.