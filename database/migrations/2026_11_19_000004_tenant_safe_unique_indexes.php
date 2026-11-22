<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $pairs = [
            ['leads', 'leads_lead_id_unique', ['tenant_id', 'lead_id']],
            ['deals', 'deals_deal_id_unique', ['tenant_id', 'deal_id']],
            ['bookings', 'bookings_booking_id_unique', ['tenant_id', 'booking_id']],
            ['payments', 'payments_payment_id_unique', ['tenant_id', 'payment_id']],
            ['projects', 'projects_project_id_unique', ['tenant_id', 'project_id']],
            ['properties', 'properties_property_id_unique', ['tenant_id', 'property_id']],
            ['site_visits', 'site_visits_visit_id_unique', ['tenant_id', 'visit_id']],
            ['customers', 'customers_customer_id_unique', ['tenant_id', 'customer_id']],
        ];
        foreach ($pairs as [$tableName, $oldIndex, $cols]) {
            if (!Schema::hasTable($tableName)) continue;
            if (!Schema::hasColumn($tableName, 'tenant_id')) continue;
            try { Schema::table($tableName, function (Blueprint $table) use ($oldIndex) { $table->dropUnique($oldIndex); }); } catch (\Throwable $e) {}
            $newName = $tableName.'_tenant_'.implode('_',$cols).'_unique';
            try { Schema::table($tableName, function (Blueprint $table) use ($cols, $newName) { $table->unique($cols, $newName); }); } catch (\Throwable $e) {}
        }
    }

    public function down(): void
    {
        // Best-effort: no-op to avoid data loss on rollback.
    }
};
