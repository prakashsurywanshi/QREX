<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('property_id')->unique();
            $table->string('title');
            $table->string('type')->default('Apartment');
            $table->string('transaction_type')->default('Buy');
            $table->text('description')->nullable();
            $table->string('status')->default('Draft');
            $table->decimal('price', 15, 2)->default(0);
            $table->string('price_label')->nullable();
            $table->decimal('area', 10, 2)->default(0);
            $table->integer('bedrooms')->default(0);
            $table->integer('bathrooms')->default(0);
            $table->integer('floors')->default(1);
            $table->integer('parking')->default(0);
            $table->string('furnishing')->nullable();
            $table->string('possession_date')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->default('India');
            $table->string('pincode')->nullable();
            $table->string('latitude')->nullable();
            $table->string('longitude')->nullable();
            $table->json('amenities')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('is_website_visible')->default(true);
            $table->string('seo_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('slug')->nullable();
            $table->string('image')->nullable();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
