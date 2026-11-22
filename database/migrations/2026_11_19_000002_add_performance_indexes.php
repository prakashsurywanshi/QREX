<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $index = function (string $table, array $cols, string $name) {
            if (!Schema::hasTable($table)) return;
            foreach ($cols as $c) { if (!Schema::hasColumn($table, $c)) return; }
            Schema::table($table, function (Blueprint $t) use ($cols, $name, $table) {
                try { $t->index($cols, $name); } catch (\Throwable $e) {}
            });
        };

        $index('leads', ['tenant_id', 'status'], 'leads_tenant_status_idx');
        $index('leads', ['assigned_agent_id'], 'leads_assigned_agent_idx');
        $index('deals', ['tenant_id', 'stage'], 'deals_tenant_stage_idx');
        $index('bookings', ['tenant_id', 'status'], 'bookings_tenant_status_idx');
        $index('payments', ['tenant_id', 'status'], 'payments_tenant_status_idx');
        $index('site_visits', ['tenant_id', 'status'], 'site_visits_tenant_status_idx');
        $index('tasks', ['tenant_id', 'status'], 'tasks_tenant_status_idx');
        $index('properties', ['tenant_id', 'status'], 'properties_tenant_status_idx');
    }

    public function down(): void
    {
        foreach ([
            ['leads','leads_tenant_status_idx'],['leads','leads_assigned_agent_idx'],
            ['deals','deals_tenant_stage_idx'],['bookings','bookings_tenant_status_idx'],
            ['payments','payments_tenant_status_idx'],['site_visits','site_visits_tenant_status_idx'],
            ['tasks','tasks_tenant_status_idx'],['properties','properties_tenant_status_idx'],
        ] as [$table,$name]) {
            if (!Schema::hasTable($table)) continue;
            try { Schema::table($table, fn(Blueprint $t) => $t->dropIndex($name)); } catch (\Throwable $e) {}
        }
    }
};
