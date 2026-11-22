<?php

namespace Tests\Feature;

use App\Models\Commission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommissionFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_commission_can_be_created_in_db(): void
    {
        $user = User::factory()->create();
        $commission = Commission::withoutGlobalScopes()->create([
            'agent_id' => $user->id,
            'commission_type' => 'percentage',
            'commission_rate' => 2,
            'commission_amount' => 2000,
            'base_amount' => 100000,
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('commissions', ['id' => $commission->id, 'status' => 'pending']);
    }
}
