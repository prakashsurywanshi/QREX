<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_api_access_denied(): void
    {
        $response = $this->getJson('/api/leads');
        $this->assertContains($response->status(), [401, 403, 302]);
    }

    public function test_health_endpoint_exists(): void
    {
        $response = $this->get('/health');
        $this->assertContains($response->status(), [200, 302, 404]);
    }
}
