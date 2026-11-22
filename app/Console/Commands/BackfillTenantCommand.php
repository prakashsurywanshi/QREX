<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BackfillTenantCommand extends Command
{
    protected $signature = 'qrex:backfill-tenant {--tenant=} {--dry-run}';
    protected $description = 'Backfill tenant_id for legacy rows';

    public function handle(): int
    {
        $tenantId = $this->option('tenant');
        if (!$tenantId) {
            $tenantId = DB::table('tenants')->where('slug', 'default')->value('id');
        }
        if (!$tenantId) {
            $this->error('No tenant found. Create default tenant first.');
            return self::FAILURE;
        }

        $tables = ['users','leads','deals','bookings','payments','properties','property_images','customers','site_visits','tasks','campaigns','lead_activities','lead_handovers','notifications','media_files','amenities','property_types','commissions','commission_rules','commission_splits','payment_plans','installments','receipts','projects','towers','units','communications','buyers','device_tokens','audit_logs','sequences'];
        foreach ($tables as $table) {
            if (!Schema::hasTable($table) || !Schema::hasColumn($table, 'tenant_id')) continue;
            $count = DB::table($table)->whereNull('tenant_id')->count();
            if ($count === 0) continue;
            if ($this->option('dry-run')) {
                $this->line("{$table}: {$count} rows would be updated");
                continue;
            }
            DB::table($table)->whereNull('tenant_id')->update(['tenant_id' => $tenantId]);
            $this->info("{$table}: updated {$count}");
        }

        return self::SUCCESS;
    }
}
