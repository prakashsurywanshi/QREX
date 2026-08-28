<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('lead_id')->unique();
            $table->string('name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('source')->default('Website');
            $table->string('status')->default('New');
            $table->string('budget')->nullable();
            $table->string('preferred_location')->nullable();
            $table->foreignId('interested_property_id')->nullable()->constrained('properties')->nullOnDelete();
            $table->foreignId('assigned_agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('score')->default(0);
            $table->text('requirements')->nullable();
            $table->string('last_contact')->nullable();
            $table->string('next_followup')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
