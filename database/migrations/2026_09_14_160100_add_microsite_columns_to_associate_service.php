<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Plan 0021 — enriquecimiento de servicios para el micrositio.
 *
 * El asociado NO retipea ni inventa servicios: la selección aprobada (sección
 * `services`, revisada) se mantiene. Aquí solo se añaden, por servicio, una
 * `description` y un `cover_path` opcionales para la tarjeta del micrositio.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('associate_service', function (Blueprint $table) {
            $table->text('description')->nullable();
            $table->string('cover_path')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('associate_service', function (Blueprint $table) {
            $table->dropColumn(['description', 'cover_path']);
        });
    }
};
