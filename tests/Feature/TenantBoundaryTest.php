<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantBoundaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_scoping_blocks_cross_tenant_reads_when_enabled(): void
    {
        config(['qrex.multi_tenant' => true]);
        $t1 = Tenant::create(['name' => 'T1', 'slug' => 't1', 'status' => 'active']);
        $t2 = Tenant::create(['name' => 'T2', 'slug' => 't2', 'status' => 'active']);
        Lead::withoutGlobalScopes()->create(['tenant_id'=>$t1->id,'lead_id'=>'L-910','name'=>'A','phone'=>'1','email'=>'a@a.test','source'=>'Web','status'=>'New','budget'=>'1','preferred_location'=>'X']);
        Lead::withoutGlobalScopes()->create(['tenant_id'=>$t2->id,'lead_id'=>'L-911','name'=>'B','phone'=>'2','email'=>'b@b.test','source'=>'Web','status'=>'New','budget'=>'1','preferred_location'=>'X']);

        app()->instance('current_tenant_id', $t1->id);
        $this->assertNull(Lead::where('lead_id', 'L-911')->first());
        $this->assertNotNull(Lead::where('lead_id', 'L-910')->first());
        app()->instance('current_tenant_id', null);
    }
}
