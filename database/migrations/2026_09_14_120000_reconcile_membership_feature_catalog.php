<?php

use App\Models\Feature;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Plan 0016 — reconciliar el catálogo de módulos a los módulos reales.
 * Ver docs/adr/0002 (actualización) y docs/actualizaciones/0016-membresias-modelo-y-admin.md
 *
 * Cambios de DATOS (no de esquema):
 *   - `licitaciones` → `bienes_servicios` (rename de clave: preserva el id del
 *     feature y todas las filas del pivote `plan_feature`). Pasa a representar el
 *     acceso al módulo Bienes y Servicios. NO se añade gating nuevo en este plan.
 *   - Se retira `directorio_prioritario` (todos los planes son pagos; la prioridad
 *     se reemplaza por un futuro módulo `ranking`). Borrar el feature cae en
 *     cascada sobre su pivote. La columna `has_priority_directory` se conserva.
 *   - Se registra `ranking` como *Próximamente* (`is_enabled = false`).
 *   - Se marcan *Próximamente* (`is_enabled = false`) los módulos que aún no
 *     existen: EmpleaMEP (`bolsa_empleo`), Reseñas (`resenas`), Soporte técnico
 *     (`soporte_prioritario`).
 *
 * Idempotente: se puede correr sobre una base ya reconciliada sin efecto.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1) Rename licitaciones → bienes_servicios (solo si aún existe la vieja
        //    y no existe ya la nueva, para ser idempotente).
        $hasOld = DB::table('features')->where('key', 'licitaciones')->exists();
        $hasNew = DB::table('features')->where('key', 'bienes_servicios')->exists();

        if ($hasOld && ! $hasNew) {
            DB::table('features')->where('key', 'licitaciones')->update([
                'key' => 'bienes_servicios',
                'name' => 'Bienes y servicios',
                'description' => 'Acceso al mercado de licitaciones que publica el administrador.',
                'group' => 'contenido',
                'updated_at' => now(),
            ]);
        }

        // 2) Retirar directorio_prioritario (cascade borra su pivote).
        DB::table('features')->where('key', 'directorio_prioritario')->delete();

        // 3) Registrar ranking como Próximamente (si no existe).
        if (! DB::table('features')->where('key', 'ranking')->exists()) {
            DB::table('features')->insert([
                'key' => 'ranking',
                'name' => 'Ranking de mi perfil',
                'description' => 'Posición en el directorio ganada por hábito de pago, reseñas, actividad y vistas.',
                'type' => Feature::TYPE_BOOLEAN,
                'group' => 'visibilidad',
                'is_enabled' => false,
                'sort' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4) Marcar Próximamente los módulos que aún no existen.
        DB::table('features')
            ->whereIn('key', ['bolsa_empleo', 'resenas', 'soporte_prioritario'])
            ->update(['is_enabled' => false, 'updated_at' => now()]);
    }

    public function down(): void
    {
        // Reversa razonable (no restaura el pivote borrado de directorio_prioritario).
        DB::table('features')->where('key', 'ranking')->delete();

        $hasNew = DB::table('features')->where('key', 'bienes_servicios')->exists();
        $hasOld = DB::table('features')->where('key', 'licitaciones')->exists();
        if ($hasNew && ! $hasOld) {
            DB::table('features')->where('key', 'bienes_servicios')->update([
                'key' => 'licitaciones',
                'name' => 'Descarga de pliegos',
                'group' => 'contenido',
                'updated_at' => now(),
            ]);
        }

        DB::table('features')
            ->whereIn('key', ['bolsa_empleo', 'resenas', 'soporte_prioritario'])
            ->update(['is_enabled' => true, 'updated_at' => now()]);
    }
};
