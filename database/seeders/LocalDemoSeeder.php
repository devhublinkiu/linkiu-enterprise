<?php

namespace Database\Seeders;

use App\Models\Associate;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeder LOCAL — solo para desarrollo visual.
 * Crea 4 empresas demo, 10 categorías con 2 servicios cada una (20 en total).
 * Es idempotente: no duplica si ya existe el nombre.
 */
class LocalDemoSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Categorías + servicios (10 cats × 2 servicios = 20) ────────────
        $categoriesData = [
            'Transporte y Logística'     => ['Transporte de carga pesada',       'Logística de distribución'],
            'Construcción'               => ['Obras civiles',                     'Mantenimiento de infraestructura'],
            'Tecnología'                 => ['Desarrollo de software',            'Soporte técnico en campo'],
            'Salud y Seguridad'          => ['Medicina del trabajo',              'Dotación de EPP'],
            'Ingeniería'                 => ['Consultoría de ingeniería',         'Diseño de proyectos industriales'],
            'Medio Ambiente'             => ['Reforestación y compensación',      'Gestión de residuos'],
            'Capacitación'               => ['Formación técnica especializada',   'Programas HSE'],
            'Papelería y Suministros'    => ['Suministro de papelería',           'Impresión y señalización'],
            'Mantenimiento Industrial'   => ['Mantenimiento mecánico',            'Soldadura y metalmecánica'],
            'Servicios Administrativos'  => ['Asesoría jurídica',                 'Contabilidad y auditoría'],
        ];

        $categoryModels = [];

        foreach ($categoriesData as $catName => $services) {
            $category = ServiceCategory::firstOrCreate(
                ['slug' => Str::slug($catName)],
                ['name' => $catName]
            );
            $categoryModels[$catName] = $category;

            foreach ($services as $serviceName) {
                Service::firstOrCreate(
                    ['slug' => Str::slug($serviceName)],
                    [
                        'category_id' => $category->id,
                        'name'        => $serviceName,
                        'is_active'   => true,
                    ]
                );
            }
        }

        // ── 2. Empresas demo ──────────────────────────────────────────────────
        $companies = [
            [
                'company_name' => 'Transportes del Llano S.A.S',
                'nit'          => '900123456-1',
                'description'  => 'Empresa líder en transporte de carga pesada y logística en la región de la Orinoquia. Más de 15 años de experiencia en el sector hidrocarburífero.',
                'rep_name'     => 'Carlos Andrés Pérez',
                'phone'        => '3101234567',
                'address'      => 'Km 5 vía Puerto Gaitán',
                'department'   => 'Meta',
                'city'         => 'Puerto Gaitán',
                'is_verified'  => true,
                'categories'   => ['Transporte y Logística', 'Mantenimiento Industrial'],
            ],
            [
                'company_name' => 'Constructora Orinoquía Ltda',
                'nit'          => '900234567-2',
                'description'  => 'Especialistas en obras civiles, mantenimiento de vías y construcción de instalaciones para el sector de oil & gas en el Meta.',
                'rep_name'     => 'María Fernanda Gómez',
                'phone'        => '3209876543',
                'address'      => 'Calle 5 # 3-20, Puerto Gaitán',
                'department'   => 'Meta',
                'city'         => 'Puerto Gaitán',
                'is_verified'  => true,
                'categories'   => ['Construcción', 'Ingeniería'],
            ],
            [
                'company_name' => 'TechField Solutions S.A.S',
                'nit'          => '900345678-3',
                'description'  => 'Soluciones tecnológicas para campo: automatización, telemetría y soporte IT para operaciones de hidrocarburos en zonas remotas.',
                'rep_name'     => 'Andrés Felipe Ruiz',
                'phone'        => '3156789012',
                'address'      => 'Vereda Rubiales, Puerto Gaitán',
                'department'   => 'Meta',
                'city'         => 'Puerto Gaitán',
                'is_verified'  => false,
                'categories'   => ['Tecnología', 'Servicios Administrativos'],
            ],
            [
                'company_name' => 'Agroforestal Sabanas Verde',
                'nit'          => '900456789-4',
                'description'  => 'Empresa dedicada a la gestión ambiental, reforestación y compensación ecológica en el piedemonte llanero y la Orinoquia colombiana.',
                'rep_name'     => 'Luz Adriana Moreno',
                'phone'        => '3183456789',
                'address'      => 'Vereda La Cristalina',
                'department'   => 'Meta',
                'city'         => 'Puerto Gaitán',
                'is_verified'  => false,
                'categories'   => ['Medio Ambiente', 'Capacitación'],
            ],
        ];

        foreach ($companies as $data) {
            $categories = $data['categories'];
            unset($data['categories']);

            $associate = Associate::firstOrCreate(
                ['nit' => $data['nit']],
                array_merge($data, [
                    'status'        => 'approved',
                    'is_public'     => true,
                    'legal_status'  => 'SAS',
                    'company_type'  => ['servicios'],
                ])
            );

            // Adjuntar servicios de las categorías asignadas
            $serviceIds = Service::whereHas('category', function ($q) use ($categories) {
                $q->whereIn('name', $categories);
            })->pluck('id')->toArray();

            $associate->services()->syncWithoutDetaching($serviceIds);
        }

        $this->command->info('✓ LocalDemoSeeder: 4 empresas, 10 categorías y 20 servicios creados.');
    }
}
