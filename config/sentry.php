<?php

return [
    'dsn' => env('SENTRY_LARAVEL_DSN', env('SENTRY_DSN')),
    'release' => env('SENTRY_RELEASE'),
    'environment' => env('SENTRY_ENVIRONMENT', env('APP_ENV', 'production')),
    'sample_rate' => (float) env('SENTRY_SAMPLE_RATE', 1.0),
    'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 0.0),
    'send_default_pii' => (bool) env('SENTRY_SEND_DEFAULT_PII', false),
];
