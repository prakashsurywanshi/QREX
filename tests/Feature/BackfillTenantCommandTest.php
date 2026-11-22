<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class BackfillTenantCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_backfill_command_dry_run_reports_rows(): void
    {
        Tenant::firstOrCreate(['slug' => 'default'], ['name' => 'Default', 'status' => 'active']);
        Lead::withoutGlobalScopes()->create([
            'lead_id' => 'L-999', 'name' => 'A', 'phone' => '1', 'email' => 'a@a.test',
            'source' => 'Web', 'status' => 'New', 'budget' => '1', 'preferred_location' => 'X',
            'tenant_id' => null,
        ]);

        $this->artisan('qrex:backfill-tenant --dry-run')
            ->expectsOutputToContain('would be updated')
            ->assertExitCode(0);
    }
}
