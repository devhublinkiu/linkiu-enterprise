<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('associates', function (Blueprint $table) {
            $table->string('nit')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('associates', function (Blueprint $table) {
            $table->string('nit')->nullable(false)->change();
        });
    }
};
