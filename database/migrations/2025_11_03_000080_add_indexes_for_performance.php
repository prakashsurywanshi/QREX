<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->index('tenant_id');
            $table->index('assigned_to');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index('unit_id');
            $table->index('status');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index('booking_id');
            $table->index('payment_date');
        });

        Schema::table('commissions', function (Blueprint $table) {
            $table->index('tenant_id');
            $table->index('agent_id');
            $table->index('deal_id');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['tenant_id']);
            $table->dropIndex(['assigned_to']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
        });
    }
};
