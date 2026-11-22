<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_leads_are_scoped_to_current_tenant(): void
    {
        config(['qrex.multi_tenant' => true]);
        $t1 = Tenant::create(['name'=>'T1','slug'=>'t1','status'=>'active']);
        $t2 = Tenant::create(['name'=>'T2','slug'=>'t2','status'=>'active']);
        $user = User::factory()->create(['tenant_id' => $t1->id]);
        $role = Role::create(['name'=>'Super Admin','slug'=>'super-admin','is_system'=>true]);
        $user->roles()->attach($role->id);

        Lead::withoutGlobalScopes()->create(['tenant_id'=>$t1->id,'lead_id'=>'L-T1','name'=>'A','phone'=>'1','email'=>'a@a.test','source'=>'Website','status'=>'New','budget'=>'1','preferred_location'=>'X']);
        Lead::withoutGlobalScopes()->create(['tenant_id'=>$t2->id,'lead_id'=>'L-T2','name'=>'B','phone'=>'2','email'=>'b@b.test','source'=>'Website','status'=>'New','budget'=>'1','preferred_location'=>'X']);

        Sanctum::actingAs($user);

        $res = $this->withHeader('X-Tenant-ID', (string) $t1->id)->getJson('/api/leads');
        $res->assertOk();
        $payload = $res->json('data.data') ?? $res->json('data') ?? [];
        $ids = collect($payload)->pluck('lead_id')->all();
        $this->assertContains('L-T1', $ids);
        $this->assertNotContains('L-T2', $ids);
        app()->instance('current_tenant_id', null);
    }
}
