<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable()->index();
            $table->string('name');
            $table->decimal('min_value', 15, 2)->default(0);
            $table->decimal('max_value', 15, 2)->nullable();
            $table->string('type')->default('percentage'); // percentage, fixed
            $table->decimal('percentage', 8, 2)->nullable();
            $table->decimal('fixed_amount', 15, 2)->nullable();
            $table->string('applies_to')->default('deal'); // deal, booking, both
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_rules');
    }
};
