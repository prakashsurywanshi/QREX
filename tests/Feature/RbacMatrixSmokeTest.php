<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RbacMatrixSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_unprivileged_user_forbidden_on_sensitive_endpoints(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/settings')->assertStatus(403);
        $this->getJson('/api/audit-logs')->assertStatus(403);
        $this->getJson('/api/reports/summary')->assertStatus(403);
        $this->postJson('/api/bulk/leads/assign', [])->assertStatus(403);
    }

    public function test_cross_tenant_header_does_not_escalate_non_super_admin(): void
    {
        config(['qrex.multi_tenant' => true]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $res = $this->withHeader('X-Tenant-ID', '99999')->getJson('/api/dashboard');
        $this->assertTrue(in_array($res->status(), [200,403,401]));
        $this->assertNotSame(99999, app()->bound('current_tenant_id') ? app('current_tenant_id') : null);
    }
}
