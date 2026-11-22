<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('audit_logs') && !Schema::hasColumn('audit_logs', 'tenant_id')) {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->unsignedBigInteger('tenant_id')->nullable()->index()->after('id');
            });
        }

        if (Schema::hasTable('units')) {
            Schema::table('units', function (Blueprint $table) {
                if (!Schema::hasColumn('units', 'hold_expires_at')) return;
                $table->index(['status', 'hold_expires_at'], 'units_status_hold_expires_idx');
            });
        }

        if (Schema::hasTable('commissions')) {
            Schema::table('commissions', function (Blueprint $table) {
                $table->index(['agent_id', 'status'], 'commissions_agent_status_idx');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('units')) {
            Schema::table('units', function (Blueprint $table) {
                $table->dropIndex('units_status_hold_expires_idx');
            });
        }
        if (Schema::hasTable('commissions')) {
            Schema::table('commissions', function (Blueprint $table) {
                $table->dropIndex('commissions_agent_status_idx');
            });
        }
    }
};
