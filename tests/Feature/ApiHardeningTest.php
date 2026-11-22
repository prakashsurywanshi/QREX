<?php

namespace Tests\Feature;

use App\Models\Commission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_logs_forbidden_for_non_admin(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $this->getJson('/api/audit-logs')->assertStatus(403);
    }

    public function test_commission_show_forbidden_for_other_agent(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $commission = Commission::create([
            'agent_id' => $owner->id,
            'commission_type' => 'fixed',
            'commission_amount' => 1000,
            'base_amount' => 10000,
            'split_type' => 'individual',
            'status' => 'pending',
        ]);
        Sanctum::actingAs($other);
        $this->getJson('/api/commissions/'.$commission->id)->assertStatus(403);
    }

    public function test_whatsapp_webhook_rejects_bad_signature_when_secret_configured(): void
    {
        config(['services.whatsapp.meta.app_secret' => 'secret']);
        $this->postJson('/api/whatsapp/webhook', ['entry' => []], ['X-Hub-Signature-256' => 'sha256=bad'])->assertStatus(403);
    }
}
