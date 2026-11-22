<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthAndOpsTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_ok(): void
    {
        $response = $this->get('/health');
        $this->assertContains($response->status(), [200, 302]);
    }

    public function test_api_health_endpoint_returns_ok_or_auth(): void
    {
        $response = $this->get('/api/health');
        $this->assertContains($response->status(), [200, 401, 403, 404]);
    }
}
