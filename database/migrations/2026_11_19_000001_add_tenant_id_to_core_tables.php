<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'users','leads','deals','bookings','payments','properties','property_images',
            'customers','site_visits','tasks','campaigns','lead_activities','lead_handovers',
            'notifications','media_files','amenities','property_types','roles','permissions',
            'settings'
        ];

        foreach ($tables as $tableName) {
            if (!Schema::hasTable($tableName)) {
                continue;
            }
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (!Schema::hasColumn($tableName, 'tenant_id')) {
                    $table->unsignedBigInteger('tenant_id')->nullable()->after('id')->index();
                }
            });
        }
    }

    public function down(): void
    {
        $tables = [
            'users','leads','deals','bookings','payments','properties','property_images',
            'customers','site_visits','tasks','campaigns','lead_activities','lead_handovers',
            'notifications','media_files','amenities','property_types','roles','permissions',
            'settings'
        ];

        foreach ($tables as $tableName) {
            if (!Schema::hasTable($tableName) || !Schema::hasColumn($tableName, 'tenant_id')) {
                continue;
            }
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->dropIndex([$tableName . '_tenant_id_index']);
                $table->dropColumn('tenant_id');
            });
        }
    }
};
