<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Plan 0021 — corte 21-G (Portada). La portada del micrositio se vuelve
 * configurable: el asociado elige un **gradiente animado** (por defecto) o una
 * **imagen** propia con medida precisa. Es el fondo del hero (nombre de la empresa).
 * - `cover_type`: 'gradient' | 'image'.
 * - `microsite_cover_path`: imagen de portada (cuando cover_type = image).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('associates', function (Blueprint $table) {
            $table->string('cover_type')->default('gradient')->after('cover_path');
            $table->string('microsite_cover_path')->nullable()->after('cover_type');
        });
    }

    public function down(): void
    {
        Schema::table('associates', function (Blueprint $table) {
            $table->dropColumn(['cover_type', 'microsite_cover_path']);
        });
    }
};
