<?php

namespace Tests\Feature;

use App\Models\Deal;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_reports_do_not_aggregate_cross_tenant_when_scoped(): void
    {
        config(['qrex.multi_tenant' => true]);
        $t1 = Tenant::create(['name'=>'T1','slug'=>'t1','status'=>'active']);
        $t2 = Tenant::create(['name'=>'T2','slug'=>'t2','status'=>'active']);
        $u = User::factory()->create();

        Deal::withoutGlobalScopes()->create(['tenant_id'=>$t1->id,'deal_id'=>'D-900','customer_name'=>'A','deal_value'=>100,'stage'=>'Closed Won','assigned_agent_id'=>$u->id]);
        Deal::withoutGlobalScopes()->create(['tenant_id'=>$t2->id,'deal_id'=>'D-901','customer_name'=>'B','deal_value'=>999,'stage'=>'Closed Won','assigned_agent_id'=>$u->id]);
        Payment::withoutGlobalScopes()->create(['tenant_id'=>$t1->id,'payment_id'=>'P-900','customer_name'=>'A','property_name'=>'P1','amount'=>10,'status'=>'Paid','paid_date'=>now()->toDateString()]);
        Payment::withoutGlobalScopes()->create(['tenant_id'=>$t2->id,'payment_id'=>'P-901','customer_name'=>'B','property_name'=>'P2','amount'=>777,'status'=>'Paid','paid_date'=>now()->toDateString()]);

        app()->instance('current_tenant_id', $t1->id);
        $this->assertSame(1, Deal::count());
        $this->assertSame(1, Payment::count());
        $this->assertSame(100.0, (float) Deal::sum('deal_value'));
        app()->instance('current_tenant_id', null);
    }
}
