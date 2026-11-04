# QREX Deployment Guide

## Requirements
- PHP 8.3+
- Composer
- Node.js 18+
- MySQL 8.0+ / PostgreSQL
- Redis (recommended for cache/queue)

## Installation
1. Clone repo
2. `composer install --optimize-autoloader --no-dev`
3. `npm ci && npm run build`
4. `cp .env.example .env && php artisan key:generate`
5. `php artisan migrate --force`
6. `php artisan storage:link`
7. `php artisan config:cache && php artisan route:cache && php artisan view:cache`

## Queue Worker
Use Supervisor to run `php artisan queue:work --sleep=3 --tries=3`

## Scheduler
Add to crontab: `* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1`

## Environment
Set `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` correctly.
