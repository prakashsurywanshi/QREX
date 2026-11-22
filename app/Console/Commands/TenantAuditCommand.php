<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TenantAuditCommand extends Command
{
    protected $signature = 'qrex:tenant-audit {--tenant=}';
    protected $description = 'Report rows missing tenant_id for tenant-scoped tables';

    public function handle(): int
    {
        $tables = [
            'users','leads','deals','bookings','payments','payment_plans','installments','receipts','commissions','commission_splits','commission_rules',
            'projects','towers','units','properties','property_images','customers','site_visits','tasks','notifications','campaigns','media_files',
            'communications','audit_logs','device_tokens','sequences','buyers',
        ];
        $tenantId = $this->option('tenant');
        $issues = 0;
        foreach ($tables as $table) {
            if (!Schema::hasTable($table) || !Schema::hasColumn($table, 'tenant_id')) continue;
            $q = DB::table($table)->whereNull('tenant_id');
            if ($tenantId) $q->where('tenant_id', $tenantId);
            $count = DB::table($table)->whereNull('tenant_id')->count();
            if ($count > 0) {
                $this->warn("{$table}: {$count} rows missing tenant_id");
                $issues += $count;
            } else {
                $this->line("{$table}: ok");
            }
        }
        $this->info($issues === 0 ? 'Tenant audit clean.' : "Tenant audit found {$issues} rows missing tenant_id.");
        return $issues === 0 ? self::SUCCESS : self::FAILURE;
    }
}
