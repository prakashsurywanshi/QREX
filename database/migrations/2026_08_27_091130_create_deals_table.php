<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->string('deal_id')->unique();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->string('customer_name');
            $table->foreignId('property_id')->nullable()->constrained('properties')->nullOnDelete();
            $table->decimal('deal_value', 15, 2)->default(0);
            $table->string('value_label')->nullable();
            $table->string('stage')->default('New Lead');
            $table->integer('probability')->default(10);
            $table->integer('days_in_stage')->default(0);
            $table->foreignId('assigned_agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('last_activity')->nullable();
            $table->string('next_followup')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
