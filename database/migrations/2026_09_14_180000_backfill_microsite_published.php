<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Plan 0021 — corte 21-E. El interruptor `microsite_published` (default false)
 * empieza a compuertar la visibilidad pública del micrositio. Para NO ocultar de
 * golpe a las empresas que YA estaban visibles (approved + is_public), se les marca
 * como publicadas de una vez. Las nuevas nacen en borrador y el asociado publica
 * cuando quiera (vista previa entre tanto).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('associates')
            ->where('status', 'approved')
            ->where('is_public', true)
            ->update(['microsite_published' => true]);
    }

    public function down(): void
    {
        // No se revierte: el estado de publicado es dato del asociado, no del esquema.
    }
};
