<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('role')->default('Sales Executive')->after('phone');
            $table->string('branch')->nullable()->after('role');
            $table->string('status')->default('Active')->after('branch');
            $table->timestamp('last_login_at')->nullable()->after('status');
            $table->string('avatar')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role', 'branch', 'status', 'last_login_at', 'avatar']);
        });
    }
};
