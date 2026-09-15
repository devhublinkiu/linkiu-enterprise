<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Plan 0021 — micrositio público del asociado.
 *
 * Campos nuevos sobre `associates`:
 * - `slug`: URL personalizada (única, se define una sola vez). Nace vacío → mientras
 *   tanto el micrositio se sirve por `/empresas/{id}`.
 * - `microsite_published`: interruptor de publicado (preview antes de salir).
 * - contacto público del micrositio: `whatsapp`, `contact_email`, `facade_photo_path`.
 * - `about_story`: historia ("Quiénes somos"), texto simple (distinta de `description`).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('associates', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('company_name');
            $table->boolean('microsite_published')->default(false)->after('is_public');
            $table->string('whatsapp')->nullable()->after('phone');
            $table->string('contact_email')->nullable()->after('billing_email');
            $table->string('facade_photo_path')->nullable()->after('cover_path');
            $table->text('about_story')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('associates', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn([
                'slug',
                'microsite_published',
                'whatsapp',
                'contact_email',
                'facade_photo_path',
                'about_story',
            ]);
        });
    }
};
