<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_visits', function (Blueprint $table) {
            $table->id();
            $table->string('visit_id')->unique();
            $table->string('customer_name');
            $table->string('property_name');
            $table->string('agent_name');
            $table->date('visit_date');
            $table->string('visit_time');
            $table->string('status')->default('Scheduled');
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_visits');
    }
};
