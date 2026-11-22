<?php

namespace Tests\Feature;

use App\Support\SentryReporter;
use Tests\TestCase;

class SentryReporterTest extends TestCase
{
    public function test_reporter_noops_without_dsn(): void
    {
        config(['sentry.dsn' => null]);
        SentryReporter::capture(new \RuntimeException('test'));
        $this->assertTrue(true);
    }
}
