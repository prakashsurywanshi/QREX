<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable()->index();
            $table->unsignedBigInteger('project_id')->index();
            $table->unsignedBigInteger('tower_id')->nullable()->index();
            $table->string('unit_no');
            $table->integer('floor')->nullable();
            $table->string('unit_type')->default('1bhk'); // 1bhk,2bhk,3bhk,4bhk,villa,plot,commercial,office
            $table->decimal('carpet_area', 10, 2)->nullable();
            $table->decimal('built_up_area', 10, 2)->nullable();
            $table->decimal('super_area', 10, 2)->nullable();
            $table->decimal('price', 15, 2)->nullable();
            $table->decimal('price_per_sqft', 10, 2)->nullable();
            $table->string('facing')->nullable();
            $table->string('status')->default('available'); // available, hold, booked, sold, blocked
            $table->unsignedBigInteger('held_by')->nullable();
            $table->timestamp('hold_expires_at')->nullable();
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->unsignedBigInteger('deal_id')->nullable();
            $table->json('features')->nullable();
            $table->string('floor_plan_path')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
