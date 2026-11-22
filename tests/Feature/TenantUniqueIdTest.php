<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantUniqueIdTest extends TestCase
{
    use RefreshDatabase;

    public function test_same_lead_id_allowed_across_tenants_with_tenant_unique_index(): void
    {
        config(['qrex.multi_tenant' => true]);
        $t1 = Tenant::create(['name'=>'T1','slug'=>'t1u','status'=>'active']);
        $t2 = Tenant::create(['name'=>'T2','slug'=>'t2u','status'=>'active']);

        Lead::withoutGlobalScopes()->create(['tenant_id'=>$t1->id,'lead_id'=>'L-SAME','name'=>'A','phone'=>'1','email'=>'a@a.test','source'=>'Website','status'=>'New','budget'=>'1','preferred_location'=>'X']);
        $l2 = Lead::withoutGlobalScopes()->create(['tenant_id'=>$t2->id,'lead_id'=>'L-SAME','name'=>'B','phone'=>'2','email'=>'b@b.test','source'=>'Website','status'=>'New','budget'=>'1','preferred_location'=>'X']);

        $this->assertDatabaseHas('leads', ['id' => $l2->id, 'lead_id' => 'L-SAME', 'tenant_id' => $t2->id]);
    }
}
