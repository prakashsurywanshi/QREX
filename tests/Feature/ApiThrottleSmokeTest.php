<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiThrottleSmokeTest extends TestCase
{
    public function test_login_route_is_available(): void
    {
        $response = $this->postJson('/api/auth/login', []);
        $this->assertNotEquals(404, $response->status());
    }
}
