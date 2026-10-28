# 2. Architecture

## 2.1 Technology Stack

### Backend (Laravel 13, PHP ^8.3)

| Component | Purpose |
| --- | --- |
| [Laravel](https://laravel.com) 13 | Application framework, Eloquent ORM, routing, queues, validation, auth |
| [Inertia](https://inertiajs.com) 3 | Server-driven React rendering; controllers return page props instead of HTML strings |
| [Laravel Sanctum](https://laravel.com/docs/sanctum) 4 | API token authentication for `/api/*` routes |
| [barryvdh/laravel-dompdf](https://github.com/barryvdh/laravel-dompdf) 3 | PDF export for reports |
| [Laravel Tinker](https://github.com/laravel/tinker) | REPL for debugging / scripting |
| [Laravel Pint](https://laravel.com/docs/pint) | Code style tool (dev) |
| [PHPUnit](https://phpunit.de) 12 | Testing framework (dev) |
| [Laravel Pail](https://github.com/laravel/pail) 1 | Tail-style log viewer (dev) |

### Frontend

| Component | Purpose |
| --- | --- |
| [React](https://react.dev) 19 | UI rendering |
| [TypeScript](https://www.typescriptlang.org) | Typed frontend code |
| [Tailwind CSS](https://tailwindcss.com) 4 | Styling |
| [Vite](https://vite.dev) 8 | Build tool & dev server |
| [Recharts](https://recharts.org) | Dashboard/report charts |
| [lucide-react](https://lucide.dev) | Icons |

## 2.2 Repository Layout

```
├── app/
│   ├── Console/Commands/        # Artisan commands (e.g. CheckFollowups)
│   ├── Http/
│   │   ├── Controllers/         # Web controllers
│   │   └── Controllers/Api/     # Sanctum API controllers
│   ├── Mail/                    # Mailable classes (email OTP, password reset)
│   ├── Models/                  # Eloquent models (19 models)
│   ├── Notifications/           # Laravel notifications
│   ├── Providers/               # Service providers
│   └── Services/                # Business services (ID gen, OTP, mail config, permission payload)
├── bootstrap/
├── config/                      # Laravel config files
├── database/
│   ├── factories/               # Model factories
│   ├── migrations/              # 33 migrations incl. schema + data migrations
│   └── seeders/                 # 10 seeders for roles, users, and demo data
├── public/                      # Web root (index.php, built assets)
├── resources/
│   ├── js/                      # React + TypeScript frontend (Inertia pages)
│   ├── views/                   # Blade layouts (app shell, exports/report.blade.php)
│   └── css/
├── routes/                      # web.php, api.php, console.php
├── tests/                       # PHPUnit tests
└── package.json, composer.json, vite.config.js
```

## 2.3 Request Flow

1. A browser hits a route (`routes/web.php`) → the web middleware stack runs.
2. For admin routes, `auth` + `permission:` middleware gates access before the controller runs.
3. The controller queries models, computes page props, and returns `Inertia::render('admin/Leads', [...])`.
4. Inertia resolves the matching React component in `resources/js/pages/`, merges the props, and swaps the page client-side (no full reload).
5. Mutations POST/PUT/DELETE back to the same routes; controllers validate, mutate, and `back()` with a flash message rendered by the frontend.
6. The mobile/JSON API mirrors these operations through Sanctum-authenticated controllers in `routes/api.php`.

## 2.4 Services

| Service | Location | Responsibility |
| --- | --- | --- |
| `IdGenerator` | `app/Services/IdGenerator.php` | Generates collision-free human-readable IDs (`L-001`, `DL-012`) using the auto-increment `sequences` table |
| `OtpService` | `app/Services/OtpService.php` | Email OTP generate/send/verify with TTL (10 min), resend cooldown (60 s), max attempts (5), rate limiting |
| `MailConfigService` | `app/Services/MailConfigService.php` | Reads/saves SMTP settings from the `settings` table, applies them to the mailer config at runtime, sends a test email, preserves masked passwords |
| `PermissionPayloadService` | `app/Services/PermissionPayloadService.php` | Builds permission payloads for the frontend (nav visibility, ability checks) |

## 2.5 Console Commands

| Command | Purpose | Scheduling |
| --- | --- | --- |
| `php artisan leads:check-followups` | Finds due/overdue `Follow-up` tasks and creates in-app notifications for assigned agents (12-hour dedupe) | Should be scheduled (e.g., daily); command is idempotent |

## 2.6 Record ID Generation

Human-readable record IDs are generated from the `sequences` table:

```
L-006   Lead       (LeadController::nextId('L'))
DL-012  Deal       (LeadController::nextId('DL'))
TSK-007 Task       (LeadController::nextId('TSK'))
SV-003  Site visit (LeadController::nextId('SV'))
```

`IdGenerator::next($prefix)` inserts a row into `sequences` and returns `PREFIX-NNN`, where `NNN` is the auto-incrementing ID zero-padded to 3 digits. This guarantees uniqueness even under concurrency (no two requests can produce the same ID).

## 2.7 Notification Strategy

- There is a custom `notifications` table (user-scoped rows with `title`, `message`, `type`, `related_id`, `is_read`, `is_seen`).
- Notifications are created by the application (e.g., lead conversion, site-visit scheduling, follow-up reminders) as DB rows, not via the framework's default table.
- The frontend reads them via `/admin/notifications` and can mark single or all as read.
- Laravel `Notification` classes are used for email (password reset) and OTP delivery.