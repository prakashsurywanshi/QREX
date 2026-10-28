# 3. The Data Model

*Thirty tables, one set of relationships. This chapter shows where each piece of the business actually lives.*

---

## 3.1 The shape of the system

The data model has three clusters that only meet at the edges.

```mermaid caption="Three clusters that only meet at the edges."
flowchart TB
  subgraph SALES["Sales cluster"]
    S1["properties"]
    S2["leads"]
    S3["deals"]
    S4["customers"]
    S5["bookings"]
    S6["payments"]
  end

  subgraph ACTIVITY["Activity cluster"]
    A1["lead_activities"]
    A2["lead_handovers"]
    A3["site_visits"]
    A4["tasks"]
    A5["campaigns"]
    A6["notifications"]
  end

  subgraph ACCESS["Access cluster"]
    X1["users"]
    X2["roles"]
    X3["permissions"]
    X4["model_has_roles"]
    X5["role_has_permissions"]
  end

  SALES --- ACTIVITY
  ACCESS -.->|"owns"| SALES
  ACCESS -.->|"owns"| ACTIVITY

  style SALES fill:#e8f1ee,stroke:#0f5c4e
  style ACTIVITY fill:#eef1f5,stroke:#c9d2dd
  style ACCESS fill:#fff8e8,stroke:#b5893b
```

- The **sales cluster** holds the commercial truth: what exists, who wants it, what was agreed and what was paid.
- The **activity cluster** holds the evidence: what was said, when, and by whom.
- The **access cluster** holds the rules: who may see and change what.

The activity cluster is deliberately separate from the sales cluster. A lead can be deleted from the pipeline view and still have a complete activity history behind it.

---

## 3.2 The sales core

Property, Lead and Deal are the three records the whole business turns on. Everything else hangs off them.

```mermaid caption="The sales core — property, lead and deal."
erDiagram
  PROPERTY ||--o{ PROPERTY_IMAGE : "gallery"
  PROPERTY ||--o{ LEAD : "interested in"
  LEAD ||--o| DEAL : "converts to"
  DEAL }o--|| PROPERTY : "subject of"

  PROPERTY {
    string property_id "readable id"
    string title
    string type
    string status
    decimal price
    decimal area
    boolean is_website_visible
    datetime deleted_at
  }

  PROPERTY_IMAGE {
    string id PK
    string property_id FK
    string path
    boolean is_cover
  }

  LEAD {
    string lead_id "readable id"
    string source
    string status
    int score
    decimal budget
    string assigned_agent_id FK
    string interested_property_id FK
    datetime deleted_at
  }

  DEAL {
    string deal_id "readable id"
    string lead_id FK
    string property_id FK
    string stage
    int probability
    decimal deal_value
    datetime stage_changed_at
    datetime deleted_at
  }
```

Note the two different kinds of relationship on the diagram. `PROPERTY ||--o{ LEAD` is a **one-to-many** — a property can interest many leads. `LEAD ||--o| DEAL` is **one-to-zero-or-one** — a lead produces at most one deal, and a deal may exist without a lead (a direct board deal). The second guard on conversion exists precisely to protect that "at most one".

---

## 3.3 The commitment and the money

```mermaid caption="The commitment and the money."
erDiagram
  CUSTOMER ||--o{ BOOKING : "books"
  PROPERTY ||--o{ BOOKING : "booked"
  BOOKING ||--o{ PAYMENT : "settled by"

  CUSTOMER {
    string id PK
    string name
    string phone
    string email
    decimal budget
  }

  BOOKING {
    string booking_id "readable id"
    string customer_name
    string property_name
    string status
    string agreement_status
    string possession_status
    decimal booking_amount
    datetime deleted_at
  }

  PAYMENT {
    string payment_id "readable id"
    string booking_id FK
    decimal amount
    string mode
    string status
    date due_date
    date paid_date
    datetime deleted_at
  }
```

---

## 3.4 The evidence trail

```mermaid caption="The evidence trail — activities and handovers."
erDiagram
  LEAD ||--o{ LEAD_ACTIVITY : "timeline"
  LEAD ||--o{ LEAD_HANDOVER : "handover"
  USER ||--o{ LEAD_ACTIVITY : "authors"
  USER ||--o{ LEAD_HANDOVER : "hands over"

  LEAD_ACTIVITY {
    string id PK
    string lead_id FK
    string type
    string title
    string outcome
    int duration
    datetime next_followup
  }

  LEAD_HANDOVER {
    string id PK
    string lead_id FK
    string from_user_id FK
    string to_user_id FK
    string reason
  }
```

```mermaid caption="Field operations — visits, tasks and campaigns."
erDiagram
  LEAD ||--o{ SITE_VISIT : "scheduled for"
  LEAD ||--o{ TASK : "generates"
  LEAD }o--o| CAMPAIGN : "attributed to"
  USER ||--o{ TASK : "is assigned"

  SITE_VISIT {
    string visit_id "readable id"
    string lead_id FK
    date visit_date
    string status
    text feedback
    datetime deleted_at
  }

  TASK {
    string task_id "readable id"
    string lead_id FK
    string assigned_to_id FK
    string type
    string status
    string priority
    date due_date
  }

  CAMPAIGN {
    string id PK
    string name
    string channel
    decimal budget
    decimal spent
    int conversions
    decimal roi
  }
```

---

## 3.5 The access cluster

```mermaid caption="Who is who — users, roles and pivots."
erDiagram
  USER }o--|| ROLE : "assigned"
  USER ||--o{ MODEL_HAS_ROLES : "morph"
  ROLE ||--o{ MODEL_HAS_ROLES : "morph"

  USER {
    string id PK
    string name
    string email
    string phone
    string role
    string branch
    string status
  }

  ROLE {
    string id PK
    string name
    string slug
    boolean is_system
  }

  MODEL_HAS_ROLES {
    string model_type
    string model_id
    string role_id
  }
```

```mermaid caption="What a role grants."
erDiagram
  ROLE ||--o{ ROLE_HAS_PERMISSIONS : "grants"
  PERMISSION ||--o{ ROLE_HAS_PERMISSIONS : "granted by"

  PERMISSION {
    string id PK
    string slug
    string module
    string action
    string field
  }

  ROLE_HAS_PERMISSIONS {
    string role_id
    string permission_id
  }
```

`model_has_roles` is a **polymorphic** pivot, so any model can hold a role without a dedicated join table. `role_has_permissions` is a plain many-to-many pivot.

---

## 3.5 Every table, in one list

| Table | Purpose | Key columns |
| --- | --- | --- |
| `users` | Staff accounts | `name`, `email`, `phone`, `role`, `branch`, `status`, `avatar`, `last_login_at` |
| `roles` | The six roles | `name`, `slug`, `description`, `is_system` |
| `permissions` | Every rule | `name`, `slug`, `module`, `action`, `field` |
| `role_has_permissions` | Role → permission | `role_id`, `permission_id` |
| `model_has_roles` | Model → role (polymorphic) | `model_type`, `model_id`, `role_id` |
| `properties` | The inventory | `property_id`, `title`, `type`, `status`, `price`, `area`, `featured`, `is_website_visible` |
| `property_images` | Per-property gallery | `property_id`, `path`, `is_cover` |
| `leads` | People who expressed interest | `lead_id`, `source`, `status`, `score`, `budget`, `assigned_agent_id`, `owner_id`, `created_by` |
| `lead_activities` | The timeline | `type`, `title`, `description`, `outcome`, `duration`, `contact_number`, `email_subject`, `next_followup`, `location` |
| `lead_handovers` | Reassignment history | `from_user_id`, `to_user_id`, `reason`, `notes` |
| `deals` | Deals and their stage | `deal_id`, `lead_id`, `property_id`, `stage`, `probability`, `deal_value`, `stage_changed_at` |
| `customers` | Buyers in their own right | `name`, `phone`, `email`, `type`, `budget`, `notes` |
| `site_visits` | Scheduled viewings | `visit_id`, `lead_id`, `visit_date`, `visit_time`, `status`, `feedback`, `notes` |
| `bookings` | The commercial commitment | `booking_id`, `status`, `agreement_status`, `possession_status`, `deal_value`, `booking_amount` |
| `payments` | Money received or expected | `payment_id`, `booking_id`, `amount`, `mode`, `status`, `due_date`, `paid_date` |
| `campaigns` | Marketing efforts | `name`, `channel`, `budget`, `spent`, `leads_count`, `conversions`, `revenue`, `roi`, `status` |
| `media_files` | Uploads | `path`, `disk`, `mime`, `size` |
| `notifications` | In-app messages | `user_id`, `title`, `message`, `type`, `related_id`, `is_read`, `is_seen` |
| `tasks` | Follow-ups and to-dos | `task_id`, `lead_id`, `assigned_to_id`, `created_by`, `type`, `status`, `priority`, `due_date` |
| `settings` | Key/value configuration | `key`, `value`, `group` |
| `email_otps` | One-time passcodes | `user_id`, `email`, `purpose`, `new_email`, hashed `code`, `expires_at`, `used_at` |
| `sequences` | Readable-ID generator | `prefix`, `context` |
| `amenities` | Property feature catalogue | `name`, `type`, `icon` |
| `personal_access_tokens` | Sanctum API tokens | standard Laravel columns |
| `sessions`, `cache`, `jobs`, `job_batches` | Framework tables | standard Laravel columns |

---

## 3.6 Soft deletes

The primary business entities are **soft-deleted**, so a removed record stays queryable and reportable.

| Soft-deleted | Hard-deleted |
| --- | --- |
| `leads`, `properties`, `customers`, `deals`, `bookings`, `payments`, `site_visits`, `media_files` | `roles` and `permissions` — force-deleted only when the seeder rebuilds them |

This is why a deleted lead still appears in a historical report: the row is still there with a `deleted_at` timestamp, and the report queries filter on it.

---

## 3.7 Readable record IDs

Every business record carries a human-readable identifier so it can be quoted on a phone call.

```mermaid caption="How a readable record ID is minted."
sequenceDiagram
  autonumber
  participant C as Controller
  participant G as IdGenerator
  participant S as sequences table
  participant D as Database

  C->>G: next("DL")
  G->>S: INSERT { prefix: "DL", context: "" }
  S->>D: auto-increment primary key = 12
  D-->>S: key 12
  S-->>G: 12
  G-->>C: "DL-012"
```

| Prefix | Record | Example |
| --- | --- | --- |
| `L` | Lead | `L-006` |
| `DL` | Deal | `DL-012` |
| `TSK` | Task | `TSK-007` |
| `SV` | Site visit | `SV-003` |
| `B` | Booking | `B-014` |
| `PAY` | Payment | `PAY-021` |

The number is the **auto-increment primary key** of the `sequences` row, zero-padded to three digits. Because uniqueness comes from the database rather than from a read-then-write check, two concurrent requests can never be handed the same ID.

---

## 3.8 Indexes on the hot paths

The enterprise hardening migration indexes the columns that reports and dashboards actually filter on.

| Table | Indexed columns |
| --- | --- |
| `leads` | `phone`, `status`, `source`, `assigned_agent_id`, `created_at` |
| `deals` | `stage`, `assigned_agent_id`, `lead_id` |
| `payments` | `status`, `due_date` |
| `bookings` | `status`, `booking_date` |
| `site_visits` | `status`, `lead_id`, `visit_date` |
| `tasks` | `lead_id`, `status`, `assigned_to_id` |
| `notifications` | `user_id`, `is_read`, `created_at` |
| `lead_activities` | `lead_id` |
| `property_images` | `property_id` |

---

## 3.9 Settings as a key/value store

`settings` is a generic `key` / `value` / `group` table. Keys are grouped, and the most important group is `general`, which holds the agency's identity.

| Group | Keys | Purpose |
| --- | --- | --- |
| `general` | `project_name`, `agency_name`, `tagline`, `contact_email`, `contact_phone`, `address`, `currency`, `timezone`, social links, office hours, SEO defaults | Identity, branding and regional defaults |
| `branding` | `logo_url` and related keys | Logo and colours used by the app shell and the public site |
| `smtp_*` | `smtp_enabled`, `smtp_host`, `smtp_port`, `smtp_username`, `smtp_password`, `smtp_encryption`, `smtp_from_address`, `smtp_from_name`, `smtp_test_email` | Outgoing email, managed from the Settings page rather than `.env` |
| Feature toggles | `enable_contact_form`, `maintenance_mode`, `lead_auto_assign`, `visit_reminders`, `payment_alerts` | Switches behaviour on and off without a code change |

Saved values are merged **over** the controller's defaults, so a missing key is never a null pointer — it falls back to the built-in value.

---

**Next:** [04 — Roles and Permissions](04-roles-and-permissions.md)
