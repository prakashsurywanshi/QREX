<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_scope_filters_when_multi_tenant_enabled(): void
    {
        config(['qrex.multi_tenant' => true]);
        $t1 = Tenant::create(['name' => 'T1', 'slug' => 't1', 'status' => 'active']);
        $t2 = Tenant::create(['name' => 'T2', 'slug' => 't2', 'status' => 'active']);

        Lead::withoutGlobalScopes()->create(['tenant_id' => $t1->id, 'lead_id' => 'L-900', 'name' => 'A', 'phone' => '1', 'email' => 'a@a.test', 'source' => 'Web', 'status' => 'New', 'budget' => '1', 'preferred_location' => 'X']);
        Lead::withoutGlobalScopes()->create(['tenant_id' => $t2->id, 'lead_id' => 'L-901', 'name' => 'B', 'phone' => '2', 'email' => 'b@b.test', 'source' => 'Web', 'status' => 'New', 'budget' => '1', 'preferred_location' => 'X']);

        app()->instance('current_tenant_id', $t1->id);
        $this->assertSame(1, Lead::count());
        $this->assertSame('A', Lead::first()->name);

        app()->instance('current_tenant_id', null);
    }
}
