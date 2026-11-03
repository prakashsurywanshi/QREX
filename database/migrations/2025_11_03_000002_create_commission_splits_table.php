<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_splits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable()->index();
            $table->unsignedBigInteger('commission_id')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->decimal('share_percentage', 8, 2)->default(0);
            $table->decimal('share_amount', 15, 2)->default(0);
            $table->string('role')->default('co-broker'); // primary, co-broker
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_splits');
    }
};
