<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 5 días de gracia después del vencimiento (día 19) antes de cortar el perfil.
     */
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('grace_days')->default(5)->change();
        });

        // Alinear los planes existentes al proceso del cliente.
        DB::table('plans')->update(['grace_days' => 5]);
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('grace_days')->default(0)->change();
        });

        DB::table('plans')->update(['grace_days' => 0]);
    }
};
