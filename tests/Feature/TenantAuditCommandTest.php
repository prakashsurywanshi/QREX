<?php

namespace Tests\Feature;

use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantAuditCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_audit_command_runs(): void
    {
        Tenant::query()->firstOrCreate(['slug' => 'default'], ['name' => 'Default', 'domain' => 'default.test', 'is_active' => true]);
        $this->artisan('qrex:tenant-audit')->assertExitCode(0);
    }
}
