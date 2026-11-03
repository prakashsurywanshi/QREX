<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable()->index();
            $table->nullableMorphs('communicable');
            $table->string('type')->default('note'); // note, call, whatsapp, email, site_visit, status_change, assignment, reminder
            $table->string('direction')->default('outbound'); // inbound, outbound
            $table->string('subject')->nullable();
            $table->longText('content')->nullable();
            $table->json('meta')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->string('call_outcome')->nullable(); // connected, voicemail, no-answer, interested, not-interested
            $table->timestamp('next_follow_up_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communications');
    }
};
