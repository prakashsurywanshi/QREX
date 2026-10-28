# 6. Operations

## 6.1 Prerequisites

- PHP ^8.3 (with required extensions for Laravel 13)
- [Composer](https://getcomposer.org)
- Node.js & npm
- A database driver supported by Laravel (SQLite for local dev, MySQL/PostgreSQL for production)

## 6.2 Installation

### Quick setup:

```bash
composer setup
```

`composer setup` performs, in order:

1. `composer install`
2. Creates `.env` from `.env.example` (if absent)
3. Generates the application key
4. Runs `php artisan migrate --force`
5. `npm install --ignore-scripts`
6. `npm run build`

### Manual setup:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run build
```

## 6.3 Seeding (optional demo/initial data)

```bash
php artisan db:seed
```

`DatabaseSeeder` runs these seeders in order:

| Seeder | Purpose |
| --- | --- |
| `RolesAndPermissionsSeeder` | Wipes roles/permissions, recreates 16 module sets + 6 roles |
| `UsersTableSeeder` | Default users incl. a root admin (check seeder for credentials) and agent/role users |
| `PropertiesTableSeeder` | Demo property listings with images |
| `LeadsTableSeeder` | Demo leads with activities, handovers, follow-ups |
| `DealsTableSeeder` | Demo deals across pipeline stages |
| `CustomersTableSeeder` | Demo customer records |
| `OpsTableSeeder` | Site visits, bookings, payments |
| `MarketingMediaSeeder` | Campaigns + media files |
| `TasksTableSeeder` | Follow-up and general tasks |

## 6.4 Running

Development (two terminals):

```bash
php artisan serve        # terminal 1 — web server on http://localhost:8000
npm run dev              # terminal 2 — Vite HMR for the React frontend
```

Production-like:

```bash
npm run build
php artisan serve        # or configure a web server / PHP-FPM to serve public/
```

## 6.5 Public URLs

| URL | Purpose |
| --- | --- |
| `http://localhost:8000/` | Public website home |
| `http://localhost:8000/properties` | Property listings |
| `http://localhost:8000/login` | Admin login |
| `http://localhost:8000/admin/dashboard` | CRM dashboard |

## 6.6 Scheduled Automation

**Follow-up checker** — flags overdue/due-today follow-up tasks and notifies agents:

```bash
php artisan leads:check-followups
```

Behavior (see `app/Console/Commands/CheckFollowups.php`):

- Selects all tasks with `type = Follow-up`, `status != Completed`, `due_date <= today`.
- Marks tasks with `due_date < today` as `Overdue`.
- Notifies the assigned agent (12-hour de-duplication per lead) with *Follow-up due today* / *Follow-up overdue* messages.
- Recommend scheduling it daily; it is idempotent.

Schedule it via Laravel's scheduler (`routes/console.php` / `app/Console/Kernel`) or cron, e.g.:

```cron
0 9 * * * cd /path/to/app && php artisan leads:check-followups >> /dev/null 2>&1
```

## 6.7 Maintenance / Housekeeping

- `php artisan migrate` — apply schema changes.
- `php artisan storage:link` — link public storage for uploads (logo, media).
- `php artisan config:clear` — clear cached config after deployment.
- `npm run build` — rebuild production assets after frontend changes.

## 6.8 SMTP / Email Operations

Email configuration is stored in the database (`settings` table, `smtp_*` keys) and managed by super-admins from the Settings page — **not** `.env`. `MailConfigService`:

- Reads SMTP settings (enabled, host, port, username, password, encryption, from address/name, test email).
- When enabled and `applyForEmailSending()` is called, applies them to the mailer at runtime. When disabled, the mailer falls back to `log` (safe default — emails are written to `storage/logs/laravel.log`).
- Test mail: `POST /admin/settings/test-mail` (super-admin only) sends a raw test message to the configured `test_email` or a provided recipient.
- Saving never overwrites an existing password when the form submits the masked value.

## 6.9 Testing

```bash
composer test
```

Runs the PHPUnit suite via `php artisan test`. The suite covers the web routes/controllers and command behavior.

## 6.10 Code Style

```bash
vendor/bin/pint --test     # check style
vendor/bin/pint            # fix style
```

The project uses [Laravel Pint](https://laravel.com/docs/pint) (PSR-12-based preset) as configured in `pint.json`/defaults.

## 6.11 Common Troubleshooting

| Symptom | Likely fix |
| --- | --- |
| `key already exists` / JWT-ish errors on login | Not applicable (session auth) — check session table + `SESSION_DRIVER` |
| 419 page expired | Session lifetime too short / CSRF on long-running forms |
| Emails not arriving | Check Settings → SMTP (enabled + host/port); if disabled, mail is written to the app log instead |
| `Permission does not exist` 403s | Seeder not run (`php artisan db:seed`) or user missing role |
| OTP "too many attempts" | Wait for the attempt window to clear or run `OtpService::forgetAttempts` |
| Public property 404 | `is_website_visible` is false on that listing |