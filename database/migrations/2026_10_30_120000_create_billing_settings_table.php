<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Ajustes globales de cobro (fila única): día de corte y días de prórroga para
 * toda la cámara. Antes el corte era una constante (Associate::BILLING_DAY = 19)
 * y la prórroga vivía por plan (plans.grace_days). Se centralizan aquí para que
 * el admin los edite. Migración aditiva: no se borra plans.grace_days.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billing_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('cutoff_day')->default(19);
            $table->unsignedSmallInteger('grace_days')->default(5);
            $table->timestamps();
        });

        // Fila única por defecto.
        DB::table('billing_settings')->insert([
            'cutoff_day' => 19,
            'grace_days' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_settings');
    }
};
