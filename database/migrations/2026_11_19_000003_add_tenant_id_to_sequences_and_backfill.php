<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sequences') && !Schema::hasColumn('sequences', 'tenant_id')) {
            Schema::table('sequences', function (Blueprint $table) {
                $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
            });
        }

        $defaultTenantId = null;
        if (Schema::hasTable('tenants')) {
            $existing = DB::table('tenants')->where('slug', 'default')->value('id');
            if (!$existing) {
                $existing = DB::table('tenants')->insertGetId([
                    'name' => 'Default Tenant',
                    'slug' => 'default',
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $defaultTenantId = $existing;
        }

        if ($defaultTenantId) {
            $tables = [
                'users','leads','deals','bookings','payments','properties','property_images','customers','site_visits','tasks','campaigns',
                'lead_activities','lead_handovers','notifications','media_files','amenities','property_types','commissions','commission_rules',
                'commission_splits','payment_plans','installments','receipts','projects','towers','units','communications','buyers','device_tokens','audit_logs','sequences'
            ];
            foreach ($tables as $table) {
                if (Schema::hasTable($table) && Schema::hasColumn($table, 'tenant_id')) {
                    DB::table($table)->whereNull('tenant_id')->update(['tenant_id' => $defaultTenantId]);
                }
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('sequences') && Schema::hasColumn('sequences', 'tenant_id')) {
            Schema::table('sequences', function (Blueprint $table) {
                try { $table->dropIndex(['tenant_id']); } catch (\Throwable $e) {}
                $table->dropColumn('tenant_id');
            });
        }
    }
};
