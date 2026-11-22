<?php

namespace Tests\Feature;

use Tests\TestCase;

class ReadinessCheckCommandTest extends TestCase
{
    public function test_readiness_check_command_runs(): void
    {
        $this->artisan('qrex:readiness-check')->assertExitCode(0);
    }
}
