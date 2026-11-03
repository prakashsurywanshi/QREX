<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable()->index();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('location')->nullable();
            $table->text('address')->nullable();
            $table->string('developer')->nullable();
            $table->string('rera_no')->nullable();
            $table->date('launch_date')->nullable();
            $table->date('possession_date')->nullable();
            $table->longText('description')->nullable();
            $table->json('amenities')->nullable();
            $table->json('images')->nullable();
            $table->string('status')->default('upcoming'); // upcoming, ongoing, completed
            $table->boolean('featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
