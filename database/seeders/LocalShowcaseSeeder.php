<?php

namespace Database\Seeders;

use App\Models\Associate;
use App\Models\BienesServiciosEmpresa;
use App\Models\Licitacion;
use App\Models\Plan;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Slider;
use Database\Seeders\Support\DemoIllustrations as Art;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Seeder de DEMOSTRACIÓN (solo local): llena toda la vista pública con datos
 * ficticios e ILUSTRACIONES SVG (no fotos). Deja empresas VISIBLES en el
 * directorio y con micrositio publicado, planes, categorías/servicios, sliders
 * del home, licitaciones y —reutilizando LocalContentSeeder— blog y anuncios.
 *
 * Idempotente (firstOrCreate/updateOrCreate por clave natural) y seguro de
 * repetir. No borra ni toca datos reales. Ejecutar:
 *   php artisan db:seed --class=LocalShowcaseSeeder
 */
class LocalShowcaseSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->warn('LocalShowcaseSeeder es solo para desarrollo. Abortado en producción.');

            return;
        }

        $plans = $this->seedPlans();
        $cats = $this->seedCategoriesAndServices();

        foreach ($this->companies() as $data) {
            $this->seedCompany($data, $plans, $cats);
        }

        $this->seedSliders();
        $this->seedBienesServicios();

        // Blog + anuncios: reutilizamos el seeder existente (idempotente).
        $this->call(LocalContentSeeder::class);

        $this->command->info('✓ LocalShowcaseSeeder: público lleno con datos ficticios e ilustraciones.');
    }

    // ─── Planes ───────────────────────────────────────────────────────────────

    private function seedPlans(): Collection
    {
        $tiers = [
            ['name' => 'Básico', 'slug' => 'basico', 'price_monthly' => 80000, 'color_hex' => '#6b7280', 'limit_services' => 3, 'limit_gallery' => 4, 'is_popular' => false],
            ['name' => 'Profesional', 'slug' => 'profesional', 'price_monthly' => 150000, 'color_hex' => '#00B53C', 'limit_services' => 8, 'limit_gallery' => 12, 'is_popular' => true],
            ['name' => 'Corporativo', 'slug' => 'corporativo', 'price_monthly' => 300000, 'color_hex' => '#151515', 'limit_services' => 20, 'limit_gallery' => 30, 'is_popular' => false],
        ];

        foreach ($tiers as $t) {
            Plan::firstOrCreate(['slug' => $t['slug']], array_merge($t, [
                'description' => 'Plan '.$t['name'].' para empresas asociadas de CAMEP.',
                'currency' => 'COP',
                'grace_days' => 8,
                'is_active' => true,
            ]));
        }

        return Plan::whereIn('slug', ['basico', 'profesional', 'corporativo'])->get()->keyBy('slug');
    }

    // ─── Categorías + servicios ─────────────────────────────────────────────────

    private function seedCategoriesAndServices(): array
    {
        $data = [
            'Transporte y Logística' => ['Transporte de carga pesada', 'Logística de distribución'],
            'Construcción' => ['Obras civiles', 'Mantenimiento de infraestructura'],
            'Tecnología' => ['Desarrollo de software', 'Soporte técnico en campo'],
            'Salud y Seguridad' => ['Medicina del trabajo', 'Dotación de EPP'],
            'Ingeniería' => ['Consultoría de ingeniería', 'Diseño de proyectos industriales'],
            'Medio Ambiente' => ['Reforestación y compensación', 'Gestión de residuos'],
            'Capacitación' => ['Formación técnica especializada', 'Programas HSE'],
            'Papelería y Suministros' => ['Suministro de papelería', 'Impresión y señalización'],
            'Mantenimiento Industrial' => ['Mantenimiento mecánico', 'Soldadura y metalmecánica'],
            'Servicios Administrativos' => ['Asesoría jurídica', 'Contabilidad y auditoría'],
        ];

        $models = [];
        foreach ($data as $catName => $services) {
            $cat = ServiceCategory::firstOrCreate(['slug' => Str::slug($catName)], ['name' => $catName]);
            $models[$catName] = $cat;
            foreach ($services as $s) {
                Service::firstOrCreate(['slug' => Str::slug($s)], [
                    'category_id' => $cat->id,
                    'name' => $s,
                    'is_active' => true,
                ]);
            }
        }

        return $models;
    }

    // ─── Empresas ───────────────────────────────────────────────────────────────

    /** @return array<int,array<string,mixed>> */
    private function companies(): array
    {
        return [
            ['name' => 'Transportes del Llano S.A.S', 'nit' => '900123456-1', 'tier' => 'corporativo', 'verified' => true,
                'cats' => ['Transporte y Logística', 'Mantenimiento Industrial'], 'rep' => 'Carlos Andrés Pérez', 'rich' => true,
                'desc' => 'Líder en transporte de carga pesada y logística en la Orinoquia, con más de 15 años de experiencia en el sector hidrocarburífero.'],
            ['name' => 'Constructora Orinoquía Ltda', 'nit' => '900234567-2', 'tier' => 'profesional', 'verified' => true,
                'cats' => ['Construcción', 'Ingeniería'], 'rep' => 'María Fernanda Gómez', 'rich' => true,
                'desc' => 'Especialistas en obras civiles, mantenimiento de vías e instalaciones para el sector oil & gas en el Meta.'],
            ['name' => 'TechField Solutions S.A.S', 'nit' => '900345678-3', 'tier' => 'basico', 'verified' => false,
                'cats' => ['Tecnología', 'Servicios Administrativos'], 'rep' => 'Andrés Felipe Ruiz', 'rich' => true,
                'desc' => 'Automatización, telemetría y soporte IT para operaciones de hidrocarburos en zonas remotas.'],
            ['name' => 'Agroforestal Sabanas Verde', 'nit' => '900456789-4', 'tier' => 'profesional', 'verified' => true,
                'cats' => ['Medio Ambiente', 'Capacitación'], 'rep' => 'Luz Adriana Moreno', 'rich' => true,
                'desc' => 'Gestión ambiental, reforestación y compensación ecológica en el piedemonte llanero y la Orinoquia.'],
            ['name' => 'Metalmecánica del Meta S.A.S', 'nit' => '900567890-5', 'tier' => 'profesional', 'verified' => true,
                'cats' => ['Mantenimiento Industrial', 'Ingeniería'], 'rep' => 'Jorge Iván Castro', 'rich' => false,
                'desc' => 'Soldadura, metalmecánica y mantenimiento mecánico industrial para operadoras y contratistas.'],
            ['name' => 'Suministros Rubiales', 'nit' => '900678901-6', 'tier' => 'basico', 'verified' => false,
                'cats' => ['Papelería y Suministros', 'Servicios Administrativos'], 'rep' => 'Diana Carolina Niño', 'rich' => false,
                'desc' => 'Dotación de papelería, señalización industrial y suministros corporativos con entrega en campo.'],
            ['name' => 'Salud Ocupacional Llanos IPS', 'nit' => '900789012-7', 'tier' => 'corporativo', 'verified' => true,
                'cats' => ['Salud y Seguridad', 'Capacitación'], 'rep' => 'Sandra Milena Rojas', 'rich' => false,
                'desc' => 'Medicina del trabajo, exámenes ocupacionales y programas HSE para el sector energético.'],
            ['name' => 'Ingeniería & Montajes Gaitán', 'nit' => '900890123-8', 'tier' => 'profesional', 'verified' => true,
                'cats' => ['Ingeniería', 'Construcción'], 'rep' => 'Óscar Eduardo Lara', 'rich' => false,
                'desc' => 'Diseño de proyectos industriales, montajes electromecánicos y consultoría de ingeniería.'],
        ];
    }

    private function seedCompany(array $d, Collection $plans, array $cats): void
    {
        $name = $d['name'];
        $slug = Associate::normalizeSlug($name);
        $initials = $this->initials($name);
        $palette = Art::PALETTES[crc32($d['nit']) % count(Art::PALETTES)];
        $logoColors = [Art::GREEN, Art::INK, Art::RED, '#2f9e8f', '#8b6bd9', '#f08a24', '#0ea5a0', '#b4820a'];
        $logoBg = $logoColors[crc32($name) % count($logoColors)];

        $base = 'demo/'.$slug;
        $logo = Art::mark("$base/logo.svg", $initials, $logoBg);
        $cover = Art::banner("$base/cover.svg", 1200, 480, $palette);
        $msCover = Art::banner("$base/microsite-cover.svg", 1600, 700, $palette, $name);
        $aboutImg = Art::banner("$base/about.svg", 900, 700, $palette);
        $gallery = array_values(array_filter([
            Art::banner("$base/gallery-1.svg", 800, 600, $palette),
            Art::banner("$base/gallery-2.svg", 800, 600, Art::PALETTES[(crc32($d['nit']) + 1) % count(Art::PALETTES)]),
            Art::banner("$base/gallery-3.svg", 800, 600, Art::PALETTES[(crc32($d['nit']) + 2) % count(Art::PALETTES)]),
        ]));
        $facades = array_values(array_filter([
            Art::banner("$base/facade-1.svg", 1200, 800, $palette),
            Art::banner("$base/facade-2.svg", 1200, 800, Art::PALETTES[(crc32($d['nit']) + 3) % count(Art::PALETTES)]),
        ]));

        $reviews = [];
        foreach (Associate::REVIEWABLE_SECTIONS as $s) {
            $reviews[$s] = ['status' => Associate::SEC_APPROVED];
        }

        $plan = $plans[$d['tier']] ?? $plans->first();

        $associate = Associate::updateOrCreate(
            ['nit' => $d['nit']],
            [
                'company_name' => $name,
                'initials' => $initials,
                'description' => $d['desc'],
                'legal_status' => 'SAS',
                'constitution_date' => now()->subYears(6 + (crc32($name) % 10)),
                'country_origin' => 'Colombia',
                'address' => 'Km '.(2 + crc32($name) % 8).' vía Puerto Gaitán',
                'department' => 'Meta',
                'city' => 'Puerto Gaitán',
                'main_ciiu' => (string) (4900 + crc32($name) % 90),
                'company_type' => ['servicios'],
                'rep_name' => $d['rep'],
                'rep_position' => 'Representante Legal',
                'phone' => '31'.str_pad((string) (crc32($name) % 100000000), 8, '0', STR_PAD_LEFT),
                'whatsapp' => '31'.str_pad((string) (crc32($name.'w') % 100000000), 8, '0', STR_PAD_LEFT),
                'contact_email' => 'contacto@'.Str::slug($name, '').'.com',
                'billing_email' => 'facturacion@'.Str::slug($name, '').'.com',
                'website' => 'https://www.'.Str::slug($name, '').'.com',
                'social_facebook' => 'https://facebook.com/'.Str::slug($name),
                'social_instagram' => 'https://instagram.com/'.Str::slug($name),
                'social_linkedin' => 'https://linkedin.com/company/'.Str::slug($name),
                'about_story' => 'En '.$name.' trabajamos cada día por la excelencia operativa y el desarrollo de la región. '
                    .'Combinamos experiencia, talento local y estándares de seguridad para acompañar a las operadoras y empresas del sector en la Orinoquia colombiana.',
                'is_verified' => $d['verified'],
                'status' => 'approved',
                'is_public' => true,
                'plan_id' => $plan?->id,
                'plan_expires_at' => now()->addMonths(3),
                'billing_cycle' => 'monthly',
                'section_reviews' => $reviews,
                // Micrositio
                'slug' => $slug,
                'microsite_published' => true,
                'cover_type' => (crc32($name) % 2 === 0) ? 'image' : 'gradient',
                'logo_path' => $logo,
                'cover_path' => $cover,
                'microsite_cover_path' => $msCover,
                'about_image_path' => $aboutImg,
                'gallery_paths' => $gallery,
                'facade_paths' => $facades,
            ]
        );

        // Servicios (con pivot enriquecido para el micrositio).
        $serviceIds = Service::whereHas('category', fn ($q) => $q->whereIn('name', $d['cats']))
            ->pluck('id')->take(4)->all();
        $pivot = [];
        foreach ($serviceIds as $i => $sid) {
            $pivot[$sid] = [
                'description' => 'Servicio prestado con personal certificado y equipos propios, con cobertura en el área de influencia del Meta.',
                'cover_path' => Art::banner("$base/service-$i.svg", 800, 500, Art::PALETTES[($i) % count(Art::PALETTES)]),
            ];
        }
        $associate->services()->syncWithoutDetaching($pivot);

        // Contactos (todas las empresas).
        if ($associate->contacts()->count() === 0) {
            $associate->contacts()->createMany([
                ['area' => 'Comercial', 'name' => $d['rep'], 'position' => 'Representante Legal', 'email' => 'comercial@'.Str::slug($name, '').'.com', 'phone' => $associate->phone],
                ['area' => 'Operaciones', 'name' => 'Coordinación de Operaciones', 'position' => 'Coordinador', 'email' => 'operaciones@'.Str::slug($name, '').'.com', 'phone' => $associate->whatsapp],
            ]);
        }

        if (! ($d['rich'] ?? false)) {
            return;
        }

        // ── Contenido rico del micrositio (primeras empresas) ──
        if ($associate->projects()->count() === 0) {
            foreach ([
                ['title' => 'Mantenimiento de vías internas — Campo Rubiales', 'client' => 'Operadora del Meta', 'sort' => 1],
                ['title' => 'Montaje de infraestructura modular', 'client' => 'Consorcio Energético Llanos', 'sort' => 2],
            ] as $p) {
                $project = $associate->projects()->create([
                    'title' => $p['title'],
                    'client' => $p['client'],
                    'description' => 'Proyecto ejecutado cumpliendo los estándares HSE y en los tiempos acordados con el cliente.',
                    'sort' => $p['sort'],
                ]);
                $project->images()->createMany(array_map(fn ($n) => [
                    'path' => Art::banner("$base/project-{$p['sort']}-$n.svg", 1000, 700, $palette),
                    'sort' => $n,
                ], [1, 2]));
            }
        }

        if ($associate->certifications()->count() === 0) {
            $associate->certifications()->createMany([
                ['name' => 'ISO 9001', 'year' => 2023, 'image_path' => Art::badge("$base/cert-iso9001.svg", 'ISO 9001'), 'sort' => 1],
                ['name' => 'ISO 45001', 'year' => 2022, 'image_path' => Art::badge("$base/cert-iso45001.svg", 'ISO 45001'), 'sort' => 2],
                ['name' => 'RUC Consejo Colombiano de Seguridad', 'year' => 2024, 'image_path' => Art::badge("$base/cert-ruc.svg", 'RUC'), 'sort' => 3],
            ]);
        }

        if ($associate->teamMembers()->count() === 0) {
            $team = [
                [$d['rep'], 'Gerente General'],
                ['Laura Jiménez', 'Directora de Operaciones'],
                ['Camilo Ortega', 'Líder HSE'],
            ];
            foreach ($team as $i => [$tn, $tp]) {
                $associate->teamMembers()->create([
                    'name' => $tn,
                    'position' => $tp,
                    'photo_path' => Art::avatar("$base/team-$i.svg", $this->initials($tn), $logoColors[$i % count($logoColors)]),
                    'email' => Str::slug($tn, '.').'@'.Str::slug($name, '').'.com',
                    'sort' => $i + 1,
                ]);
            }
        }

        if ($associate->clients()->count() === 0) {
            $clients = ['Frontera Energy', 'Ecopetrol', 'Parex Resources', 'GeoPark'];
            foreach ($clients as $i => $cn) {
                $associate->clients()->create([
                    'name' => $cn,
                    'logo_path' => Art::mark("$base/client-$i.svg", $this->initials($cn), $logoColors[($i + 2) % count($logoColors)]),
                    'sort' => $i + 1,
                ]);
            }
        }
    }

    // ─── Sliders del home ───────────────────────────────────────────────────────

    private function seedSliders(): void
    {
        $slides = [
            ['title' => 'Tu éxito es nuestro éxito', 'sub' => 'Juntos llegamos lejos', 'pal' => Art::PALETTES[0]],
            ['title' => 'Empresas que hacen región', 'sub' => 'Directorio empresarial de Puerto Gaitán', 'pal' => Art::PALETTES[1]],
            ['title' => 'Oportunidades reales', 'sub' => 'Licitaciones y convocatorias del sector', 'pal' => Art::PALETTES[2]],
        ];

        foreach ($slides as $i => $s) {
            $path = Art::banner('demo/slider/slide-'.($i + 1).'.svg', 1920, 700, $s['pal'], $s['title'], $s['sub']);
            Slider::firstOrCreate(
                ['title' => $s['title']],
                ['image_path' => $path, 'order' => $i + 1, 'is_active' => true]
            );
        }
    }

    // ─── Bienes y Servicios + Licitaciones ──────────────────────────────────────

    private function seedBienesServicios(): void
    {
        $empresas = [
            'Transportes del Llano S.A.S',
            'Constructora Orinoquía Ltda',
            'Metalmecánica del Meta S.A.S',
            'Ingeniería & Montajes Gaitán',
        ];

        foreach ($empresas as $nombre) {
            $empresa = BienesServiciosEmpresa::firstOrCreate(
                ['slug' => Str::slug($nombre)],
                ['nombre' => $nombre, 'departamento' => 'Meta', 'ciudad' => 'Puerto Gaitán', 'estado' => 'activo']
            );

            if ($empresa->licitaciones()->count() > 0) {
                continue;
            }

            $empresa->licitaciones()->createMany([
                [
                    'titulo' => 'Servicios de transporte de personal — '.$nombre,
                    'extracto' => 'Convocatoria abierta para servicios de transporte de personal en operaciones de campo.',
                    'contenido' => '<p>Se requieren vehículos homologados y conductores certificados. Vigencia del contrato: 12 meses.</p>',
                    'publico_objetivo' => 'abierto',
                    'estado' => 'publicado',
                    'fecha_publicacion' => now()->subDays(4),
                    'fecha_cierre' => now()->addDays(25),
                ],
                [
                    'titulo' => 'Suministro y mantenimiento electromecánico — '.$nombre,
                    'extracto' => 'Proceso exclusivo para empresas asociadas con suscripción activa.',
                    'contenido' => '<p>Incluye mantenimiento preventivo y correctivo de equipos rotativos. Experiencia mínima: 3 años.</p>',
                    'publico_objetivo' => 'exclusivo_asociados',
                    'estado' => 'publicado',
                    'fecha_publicacion' => now()->subDays(8),
                    'fecha_cierre' => now()->addDays(15),
                ],
            ]);
        }
    }

    private function initials(string $name): string
    {
        $words = preg_split('/\s+/', trim($name));
        $letters = '';
        foreach ($words as $w) {
            if ($w === '' || ! ctype_alpha($w[0])) {
                continue;
            }
            $letters .= mb_strtoupper(mb_substr($w, 0, 1));
            if (mb_strlen($letters) >= 2) {
                break;
            }
        }

        return $letters !== '' ? $letters : mb_strtoupper(mb_substr($name, 0, 2));
    }
}
