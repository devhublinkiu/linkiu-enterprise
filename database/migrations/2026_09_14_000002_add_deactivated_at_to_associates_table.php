<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('associates', function (Blueprint $table) {
            // Desactivación manual por el admin. Distingue "desactivada a mano" de
            // "vencida por fecha" (que se deriva de plan_expires_at). Ver ADR-0007.
            $table->timestamp('deactivated_at')->nullable()->after('is_public');
        });
    }

    public function down(): void
    {
        Schema::table('associates', function (Blueprint $table) {
            $table->dropColumn('deactivated_at');
        });
    }
};
