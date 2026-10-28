<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lead_activities', function (Blueprint $table) {
            $table->string('duration')->nullable()->after('description');
            $table->string('outcome')->nullable()->after('duration');
            $table->string('contact_number')->nullable()->after('outcome');
            $table->string('email_subject')->nullable()->after('contact_number');
            $table->date('next_followup')->nullable()->after('email_subject');
            $table->string('location')->nullable()->after('next_followup');
        });
    }

    public function down(): void
    {
        Schema::table('lead_activities', function (Blueprint $table) {
            $table->dropColumn([
                'duration',
                'outcome',
                'contact_number',
                'email_subject',
                'next_followup',
                'location',
            ]);
        });
    }
};
