<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_id')->unique();
            $table->string('customer_name');
            $table->string('property_name');
            $table->string('agent_name');
            $table->date('booking_date');
            $table->decimal('deal_value', 15, 2)->default(0);
            $table->string('deal_label')->nullable();
            $table->decimal('booking_amount', 15, 2)->default(0);
            $table->string('booking_amount_label')->nullable();
            $table->string('status')->default('Booking Pending');
            $table->string('agreement_status')->default('Pending');
            $table->string('possession_status')->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
