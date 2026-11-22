<?php

namespace App\Support;

use Throwable;

class SentryReporter
{
    public static function capture(Throwable $e): void
    {
        $dsn = config('sentry.dsn');
        if (!$dsn) return;
        if (app()->bound('sentry')) {
            app('sentry')->captureException($e);
        }
    }
}
