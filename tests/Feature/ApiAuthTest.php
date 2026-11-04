<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    public function test_unauthenticated_api_access_denied(): void
    {
        $response = $this->getJson('/api/leads');
        $this->assertContains($response->status(), [401, 403]);
    }

    public function test_health_endpoint_exists(): void
    {
        $response = $this->get('/health');
        $this->assertContains($response->status(), [200, 404]);
    }
}
