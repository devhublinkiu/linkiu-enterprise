<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Plan 0021 (corte 21-B, diseño aprobado). Ajustes de medios del micrositio:
 * - "Quiénes somos" lleva una imagen propia → `about_image_path`.
 * - La fachada pasa de 1 a hasta 3 imágenes (slider) → `facade_paths` (JSON),
 *   reemplaza a `facade_photo_path`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('associates', function (Blueprint $table) {
            $table->string('about_image_path')->nullable()->after('about_story');
            $table->json('facade_paths')->nullable()->after('cover_path');
            $table->dropColumn('facade_photo_path');
        });
    }

    public function down(): void
    {
        Schema::table('associates', function (Blueprint $table) {
            $table->string('facade_photo_path')->nullable()->after('cover_path');
            $table->dropColumn(['about_image_path', 'facade_paths']);
        });
    }
};
