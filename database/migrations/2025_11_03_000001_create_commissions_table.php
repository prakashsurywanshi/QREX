<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable()->index();
            $table->unsignedBigInteger('deal_id')->nullable()->index();
            $table->unsignedBigInteger('booking_id')->nullable()->index();
            $table->unsignedBigInteger('property_id')->nullable()->index();
            $table->unsignedBigInteger('agent_id')->nullable()->index();
            $table->string('commission_type')->default('percentage'); // percentage, fixed
            $table->decimal('commission_rate', 8, 2)->nullable();
            $table->decimal('commission_amount', 15, 2)->default(0);
            $table->decimal('base_amount', 15, 2)->nullable(); // deal value / booking value
            $table->string('split_type')->default('individual'); // individual, team, co-broking
            $table->unsignedBigInteger('parent_commission_id')->nullable()->index();
            $table->string('status')->default('pending'); // pending, approved, paid, rejected
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('paid_by')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_reference')->nullable();
            $table->json('calculation_details')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
