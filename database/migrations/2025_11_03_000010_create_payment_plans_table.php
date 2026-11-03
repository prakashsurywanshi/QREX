<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable()->index();
            $table->unsignedBigInteger('booking_id')->nullable()->index();
            $table->unsignedBigInteger('deal_id')->nullable()->index();
            $table->unsignedBigInteger('unit_id')->nullable()->index();
            $table->string('plan_name');
            $table->decimal('total_amount', 15, 2);
            $table->decimal('booking_amount', 15, 2)->default(0);
            $table->string('plan_type')->default('milestone'); // milestone, slab, custom
            $table->string('status')->default('active'); // active, completed, cancelled
            $table->date('start_date')->nullable();
            $table->json('terms')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_plans');
    }
};
