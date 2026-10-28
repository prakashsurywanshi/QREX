# 4. Roles, Permissions & Data Access

QREX implements a **custom role-based access control (RBAC)** system. It is not Spatie; roles and permissions are plain Eloquent models with pivot tables seeded by `RolesAndPermissionsSeeder`.

## 4.1 Model

| Table | Purpose |
| --- | --- |
| `roles` | Role definitions: `name`, `slug`, `description`, `is_system` |
| `permissions` | Permission definitions: `name`, `slug`, `module`, `action`, `field`, `description` |
| `role_has_permissions` | Many-to-many role ↔ permission |
| `model_has_roles` | Morph-many user ↔ role (polymorphic, model-aware) |

`User` helper methods (see `app/Models/User.php`):

- `isSuperAdmin()`, `hasRole(slug)`, `hasAnyRole([...])`
- `hasPermissionTo(slug)`, `hasAnyPermission([...])`, `getAllPermissions()`, `getPermissionSlugs()`
- `canAccessModule(module)` — true if the user has a `<module>.view` permission
- Per-user permission cache keyed by user id (reset per request in the app cache)

## 4.2 Permission Structure

Permissions are generated from **15 modules** and their actions:

| Module | Actions |
| --- | --- |
| `dashboard` | view |
| `properties` | view, create, edit, delete, export |
| `leads` | view, create, edit, delete, export |
| `customers` | view, create, edit, delete, export |
| `sales` | view, create, edit, delete, export |
| `tasks` | view, create, edit, delete |
| `site_visits` | view, create, edit, delete |
| `bookings` | view, create, edit, delete, approve |
| `payments` | view, create, edit, delete, export |
| `media` | view, create, delete |
| `marketing` | view, create, edit, delete, export |
| `reports` | view, export |
| `cms` | view, create, edit, delete |
| `users` | view, create, edit, delete |
| `settings` | view, edit |
| `roles` | view, create, edit, delete |

The slug convention is `{module}.{action}` (e.g., `leads.view`, `properties.create`).

## 4.3 Field-Level Permissions

For actions that touch record fields, additional permissions are seeded as `{module}.{action}.{field}`:

- `properties.edit.{price,title,status,description,area,bedrooms,bathrooms,amenities,featured,agent}`
- `leads.edit.{name,phone,email,source,status,budget,assigned_agent,score}`
- `customers.edit.{name,phone,email,type,budget,notes}`
- `tasks.edit.{title,status,priority,due_date,assigned_to}`
- `site_visits.edit.{date,time,status,feedback,notes}`
- `bookings.edit.{amount,status,payment_mode,notes}`
- `payments.edit.{amount,status,mode,date,notes}`
- `marketing.edit.{name,budget,status,channels,content}`
- `settings.edit.{project_name,agency_name,contact_email,contact_phone,address,tagline,logo}`
- `users.edit.{name,email,phone,role,branch,status,password}`
- `cms.edit.{content,featured,seo}`

Notable enforcement points:

- **Settings** (`SettingController::update`) filters each requested key by `settings.edit.<key>` so a partially-permitted user can only modify allowed settings.
- Other modules expose the permission set to the frontend (via `PermissionPayloadService`) so the UI can hide/disable controls the user cannot use; server-side route middleware is the authoritative gate.

## 4.4 Seeded Roles

| Role | slug | Permissions summary |
| --- | --- | --- |
| **Super Admin** | `super-admin` | All permissions (every module × action × field) |
| **Admin** | `admin` | All permissions except `settings.edit.project_name` and `roles.delete` |
| **Sales Executive** | `sales-executive` | dashboard, properties (view/create/edit), leads (view/create/edit + edit fields), customers (view/create/edit), tasks (view/create/edit), site visits (view/create/edit), media (view/create), reports (view) |
| **Senior Agent** | `senior-agent` | Sales Executive + `sales.view/create/edit` (pipeline) |
| **Marketing User** | `marketing-user` | dashboard, leads (view/create), marketing (view/create/edit), media (view/create), cms (view/create/edit), reports (view/export) |
| **Accountant** | `accountant` | dashboard, customers (view), sales (view), bookings (view/create/edit), payments (view/create/edit), reports (view/export), media (view) |

`roles.delete` is a true system-safety valve: even `admin` cannot delete roles, only super-admin can.

SMTP settings, logo management, and test-mail endpoints are further gated by the `super-admin` **role** (`role:super-admin` middleware) in addition to permissions.

## 4.5 Route-Level Enforcement

Web routes apply middleware per route group, e.g.:

```php
Route::middleware('permission:leads.edit')->group(function () {
    Route::put('/leads/{lead}', ...);            // leads.update
    Route::post('/leads/{lead}/reassign', ...);  // leads.reassign
    Route::post('/leads/{lead}/status', ...);    // leads.status
});
```

Each controller method also performs its own access checks where data-level restrictions apply (see below). The API uses the exact same `permission:` middleware on its routes.

## 4.6 Data-Level Scoping

Beyond action permissions, **row-level scoping** limits what agents see (but not what admins see).

`Lead::scopeVisibleTo($user)` / `LeadController::applyAgentScope`:

- Super Admin or role `admin` → no restriction.
- `sales-executive` or `senior-agent` → only leads where `assigned_agent_id = user.id` **or** `owner_id = user.id`.

`LeadController::authorizeLeadAccess` (used on show/update/reassign/status/activity/convert) aborts `403` if a scoped user accesses a lead they don't own or are not assigned.

Reports reuse `visibleTo` so agents' reports are limited to their own leads, while admins see the full picture.

## 4.7 Frontend Integration

`PermissionPayloadService` builds the user's permission slugs into Inertia props. The React admin layout uses them to:

- Show/hide navigation items per module.
- Disable or hide create/edit/delete actions the user cannot perform.
- Respect field-level permissions when rendering forms (e.g., Settings page hides fields the user may not edit).