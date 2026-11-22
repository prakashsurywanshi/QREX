<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantHeaderTrustTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_super_admin_cannot_switch_tenant_via_header(): void
    {
        config(['qrex.multi_tenant' => true]);
        Tenant::create(['name' => 'T1', 'slug' => 't1', 'status' => 'active']);
        $t2 = Tenant::create(['name' => 'T2', 'slug' => 't2', 'status' => 'active']);
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withHeader('X-Tenant-ID', (string) $t2->id)
            ->get('/api/health');

        $this->assertNotSame($t2->id, app()->bound('current_tenant_id') ? app('current_tenant_id') : null);
    }
}
