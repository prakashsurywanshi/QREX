<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Track when a deal last changed stage so days_in_stage can be derived.
        Schema::table('deals', function (Blueprint $table) {
            $table->timestamp('stage_changed_at')->nullable()->after('stage');
        });

        DB::table('deals')->whereNull('stage_changed_at')->update(['stage_changed_at' => DB::raw('created_at')]);

        // Indexes on the hot query paths across the CRM.
        Schema::table('leads', function (Blueprint $table) {
            $table->index(['phone']);
            $table->index(['status']);
            $table->index(['source']);
            $table->index(['assigned_agent_id']);
            $table->index(['created_at']);
        });

        Schema::table('deals', function (Blueprint $table) {
            $table->index(['stage']);
            $table->index(['assigned_agent_id']);
            $table->index(['lead_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index(['status']);
            $table->index(['due_date']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['status']);
            $table->index(['booking_date']);
        });

        Schema::table('site_visits', function (Blueprint $table) {
            $table->index(['status']);
            $table->index(['lead_id']);
            $table->index(['visit_date']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->index(['lead_id']);
            $table->index(['status']);
            $table->index(['assigned_to_id']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'is_read', 'created_at']);
        });

        Schema::table('lead_activities', function (Blueprint $table) {
            $table->index(['lead_id']);
        });

        Schema::table('property_images', function (Blueprint $table) {
            $table->index(['property_id']);
        });

        // Soft deletes for all primary business entities.
        Schema::table('leads', fn (Blueprint $table) => $table->softDeletes());
        Schema::table('properties', fn (Blueprint $table) => $table->softDeletes());
        Schema::table('customers', fn (Blueprint $table) => $table->softDeletes());
        Schema::table('deals', fn (Blueprint $table) => $table->softDeletes());
        Schema::table('bookings', fn (Blueprint $table) => $table->softDeletes());
        Schema::table('payments', fn (Blueprint $table) => $table->softDeletes());
        Schema::table('site_visits', fn (Blueprint $table) => $table->softDeletes());
        Schema::table('media_files', fn (Blueprint $table) => $table->softDeletes());
    }

    public function down(): void
    {
        Schema::table('deals', function (Blueprint $table) {
            $table->dropIndex(['stage']);
            $table->dropIndex(['assigned_agent_id']);
            $table->dropIndex(['lead_id']);
            $table->dropColumn('stage_changed_at');
        });

        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['phone']);
            $table->dropIndex(['status']);
            $table->dropIndex(['source']);
            $table->dropIndex(['assigned_agent_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['due_date']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['booking_date']);
        });

        Schema::table('site_visits', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['lead_id']);
            $table->dropIndex(['visit_date']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['lead_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['assigned_to_id']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'is_read', 'created_at']);
        });

        Schema::table('lead_activities', function (Blueprint $table) {
            $table->dropIndex(['lead_id']);
        });

        Schema::table('property_images', function (Blueprint $table) {
            $table->dropIndex(['property_id']);
        });

        Schema::table('leads', fn (Blueprint $table) => $table->dropSoftDeletes());
        Schema::table('properties', fn (Blueprint $table) => $table->dropSoftDeletes());
        Schema::table('customers', fn (Blueprint $table) => $table->dropSoftDeletes());
        Schema::table('deals', fn (Blueprint $table) => $table->dropSoftDeletes());
        Schema::table('bookings', fn (Blueprint $table) => $table->dropSoftDeletes());
        Schema::table('payments', fn (Blueprint $table) => $table->dropSoftDeletes());
        Schema::table('site_visits', fn (Blueprint $table) => $table->dropSoftDeletes());
        Schema::table('media_files', fn (Blueprint $table) => $table->dropSoftDeletes());
    }
};
