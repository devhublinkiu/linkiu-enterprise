<?php

namespace Database\Seeders;

use App\Models\Feature;
use App\Models\Plan;
use Illuminate\Database\Seeder;

/**
 * Cataloga los módulos y, sobre todo, siembra el pivote preservando el acceso
 * actual de cada plan.
 *
 * Ver docs/adr/0002-interruptores-de-modulo-por-plan.md
 *
 * Idempotente: se puede correr las veces que haga falta (updateOrCreate).
 *
 * REGLA CLAVE: ningún asociado gana ni pierde acceso el día del despliegue.
 *   - Módulos ya aplicados hoy (directorio, licitaciones, límites): se copia el
 *     valor real de la columna del plan.
 *   - Módulos SIN control hoy (foros, anuncios): se siembran habilitados para
 *     todos, porque hoy todos los tienen. Aplicar el middleware queda como
 *     no-op; lo que cambia es que ahora existe el interruptor.
 *   - Banderas muertas (soporte, reseñas, bolsa de empleo): se copia la bandera
 *     tal cual; no las aplica nada todavía.
 *   - Módulos futuros (vitrina): apagados.
 *   - Pago en línea: habilitado para todos.
 */
class FeatureSeeder extends Seeder
{
    /**
     * Catálogo. `seed` decide el valor por plan:
     *   'column:<col>' → copia esa columna del plan
     *   'on'           → habilitado para todos
     *   'off'          → deshabilitado para todos
     *
     * `enabled_default` (opcional) fija `is_enabled` al CREAR el feature (fresh
     * install). Los *Próximamente* nacen apagados; no se pisa lo que un admin ya
     * haya cambiado a mano. Ver plan 0016.
     */
    private const CATALOG = [
        ['key' => 'galeria',                'name' => 'Galería de fotos',           'type' => 'limit',   'group' => 'contenido',   'seed' => 'column:limit_gallery', 'sort' => 10],
        ['key' => 'servicios',              'name' => 'Servicios propios',          'type' => 'limit',   'group' => 'contenido',   'seed' => 'column:limit_services', 'sort' => 20],
        ['key' => 'anuncios',               'name' => 'Anuncios',                   'type' => 'boolean', 'group' => 'comunidad',   'seed' => 'on', 'sort' => 30],
        ['key' => 'bienes_servicios',       'name' => 'Bienes y servicios',         'type' => 'boolean', 'group' => 'contenido',   'seed' => 'column:can_download_tenders', 'sort' => 40],
        ['key' => 'foros',                  'name' => 'Red CAMEP',                  'type' => 'boolean', 'group' => 'comunidad',   'seed' => 'on', 'sort' => 50],
        ['key' => 'bolsa_empleo',           'name' => 'EmpleaMEP (hojas de vida)',  'type' => 'boolean', 'group' => 'servicio',    'seed' => 'column:has_job_board', 'sort' => 60, 'enabled_default' => false],
        ['key' => 'resenas',                'name' => 'Reseñas de empresas',        'type' => 'boolean', 'group' => 'servicio',    'seed' => 'column:has_reviews', 'sort' => 70, 'enabled_default' => false],
        ['key' => 'soporte_prioritario',    'name' => 'Soporte técnico',            'type' => 'boolean', 'group' => 'servicio',    'seed' => 'column:has_priority_support', 'sort' => 80, 'enabled_default' => false],
        ['key' => 'ranking',                'name' => 'Ranking de mi perfil',       'type' => 'boolean', 'group' => 'visibilidad', 'seed' => 'off', 'sort' => 90, 'enabled_default' => false],
        ['key' => 'vitrina',                'name' => 'Vitrina empresarial',        'type' => 'boolean', 'group' => 'futuro',      'seed' => 'off', 'sort' => 100, 'enabled_default' => false],
        ['key' => 'pago_en_linea',          'name' => 'Pago en línea (Bold)',       'type' => 'boolean', 'group' => 'facturacion', 'seed' => 'on', 'sort' => 110],
    ];

    public function run(): void
    {
        $plans = Plan::all();

        foreach (self::CATALOG as $entry) {
            $feature = Feature::updateOrCreate(
                ['key' => $entry['key']],
                [
                    'name' => $entry['name'],
                    'description' => $entry['description'] ?? null,
                    'type' => $entry['type'],
                    'group' => $entry['group'],
                    'sort' => $entry['sort'],
                    // is_enabled: no lo pisamos si un admin ya lo cambió a mano;
                    // al crear, respeta enabled_default (los Próximamente nacen off).
                    'is_enabled' => Feature::where('key', $entry['key'])->value('is_enabled')
                        ?? ($entry['enabled_default'] ?? true),
                ]
            );

            foreach ($plans as $plan) {
                // No pisar lo que un admin ya haya configurado en el pivote.
                if ($plan->features()->where('feature_id', $feature->id)->exists()) {
                    continue;
                }

                [$enabled, $limit] = $this->seedValues($entry, $plan);

                $plan->features()->attach($feature->id, [
                    'enabled' => $enabled,
                    'limit_value' => $limit,
                ]);
            }
        }
    }

    /**
     * @return array{0:bool,1:?int} [enabled, limit_value]
     */
    private function seedValues(array $entry, Plan $plan): array
    {
        $seed = $entry['seed'];

        if ($seed === 'on') {
            return [true, null];
        }
        if ($seed === 'off') {
            return [false, null];
        }

        // 'column:<col>'
        $column = substr($seed, strlen('column:'));
        $value = $plan->{$column};

        if ($entry['type'] === Feature::TYPE_LIMIT) {
            // En la convención histórica, 0 = ilimitado → enabled con limit null.
            $intVal = (int) ($value ?? 0);

            return [true, $intVal === 0 ? null : $intVal];
        }

        return [(bool) $value, null];
    }
}
