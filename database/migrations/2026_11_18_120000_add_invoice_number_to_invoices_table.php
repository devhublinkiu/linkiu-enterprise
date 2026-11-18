<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('invoice_number')->nullable()->unique()->after('type');
        });

        // Backfill de las facturas existentes: serie por tipo y año, en orden de
        // creación (id). No se modifica ningún otro dato.
        $counters = [];
        DB::table('invoices')
            ->orderBy('id')
            ->get(['id', 'type', 'created_at'])
            ->each(function ($inv) use (&$counters) {
                $prefix = $inv->type === 'cuenta_cobro' ? 'CC' : 'FC';
                $year = Carbon::parse($inv->created_at)->year;
                $key = "{$prefix}-{$year}";
                $counters[$key] = ($counters[$key] ?? 0) + 1;

                DB::table('invoices')
                    ->where('id', $inv->id)
                    ->update([
                        'invoice_number' => sprintf('%s-%04d', $key, $counters[$key]),
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropUnique(['invoice_number']);
            $table->dropColumn('invoice_number');
        });
    }
};
