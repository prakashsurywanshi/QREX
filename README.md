# QREX - Qodeigence Infocircle Private Limited

A full-featured property management and sales CRM platform. It pairs a public-facing real estate website with an internal admin suite for managing properties, leads, sales pipelines, customers, bookings, payments, marketing, and team access.

Built with **Inertia**, and **React** on the Latte stack (Laravel + Tailwind + TypeScript + Everything else).

## Features

### Public Website
- Property listings with searchable/filterable views
- Property detail pages with image galleries
- About and contact pages with CM-backed content
- Contact and property enquiry forms (rate-limited to prevent abuse)

### Lead Management
- Lead tracking with statuses and change history
- Lead activity timeline logging
- Lead handovers and reassignment between agents
- Bulk lead import via CSV (with downloadable import template)
- One-click conversion of leads into pipeline deals

### Sales Pipeline
- Kanban-style deal board with configurable stages
- Drag-and-drop style stage movement
- Deal creation from leads or directly

### Sales Operations
- **Properties** — full CRUD with multiple images per property
- **Customers** — record, view, and manage customer details
- **Site Visits** — schedule and manage property visits
- **Bookings** — create and manage property bookings
- **Payments** — track payments against bookings

### Productivity & Automation
- **Tasks** — follow-ups and to-dos for agents with due dates
- **Notifications** — in-app notifications with read/unread management
- **Follow-up Automation** — `php artisan leads:check-followups` flags overdue follow-up tasks and notifies the assigned agent

### Marketing & Reporting
- **Marketing** — create and manage campaigns
- **Reports** — dashboard metrics and reporting with CSV/Excel and PDF export (via DomPDF)
- **Media Center** — centralized media file management

### CMS & Settings
- Manage public site content sections and featured properties
- Configure application and site settings
- Configure SMTP settings (super-admin) with a test-mail feature

### Team, Roles & Security
- User management
- Role-based authorization with granular permissions
- Email OTP verification for profile changes
- Password reset via email
- Login rate limiting

## Tech Stack

**Backend**
- [Laravel](https://laravel.com) 13 (PHP ^8.3) framework
- [Inertia](https://inertiajs.com) 3 (SSR-ready backend)
- [barryvdh/laravel-dompdf](https://github.com/barryvdh/laravel-dompdf) for PDF exports
- [Laravel Tinker](https://github.com/laravel/tinker)

**Frontend**
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) 4
- [Vite](https://vite.dev) 8
- [Recharts](https://recharts.org) for dashboard charts
- [lucide-react](https://lucide.dev) for icons

## Requirements

- PHP ^8.3
- [Composer](https://getcomposer.org)
- Node.js & npm

## Installation

1. Clone the repository and navigate into it.

2. Install dependencies and generate the application key:

   ```bash
   composer setup
   ```

   This runs `composer install`, copies `.env.example` to `.env`, generates an app key, runs migrations, and builds the frontend assets. Alternatively, run the steps manually:

   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   npm install
   npm run build
   ```

3. (Optional) Seed the database with demo data:

   ```bash
   php artisan db:seed
   ```

   Seeders populate roles & permissions, a default admin user, properties, leads, deals, customers, operational data, marketing/media assets, and tasks.

4. Start the development server:

   ```bash
   php artisan serve
   ```

5. In a second terminal, run Vite for frontend hot-reloading during development:

   ```bash
   npm run dev
   ```

## Usage

- **Public website**: visit `http://localhost:8000/` to browse properties, about, and contact pages.
- **Admin area**: log in at `/login` to access the CRM dashboard and admin modules under `/admin`.

## Console Commands

| Command | Description |
| --- | --- |
| `php artisan leads:check-followups` | Flags overdue follow-up tasks and notifies the assigned agents. Should be scheduled (e.g. daily). |

## Testing

```bash
composer test
```

Runs the test suite via PHPUnit.

## Code Style

The project uses [Laravel Pint](https://laravel.com/docs/11.x/pint) (a code style tool) for code style. Check your code with:

```bash
vendor/bin/pint --test
```

## License

QREX - Qodeigence Infocircle Private Limited is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
