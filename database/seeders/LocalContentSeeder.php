<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder LOCAL — 4 blog posts + 4 anuncios públicos para pruebas visuales.
 * Idempotente: usa firstOrCreate por título.
 */
class LocalContentSeeder extends Seeder
{
    public function run(): void
    {
        // Usamos el primer admin/superadmin, o cualquier usuario
        $user = User::where('is_superadmin', true)->first()
            ?? User::first();

        if (! $user) {
            $this->command->warn('No hay usuarios en la base de datos. Crea uno primero.');
            return;
        }

        // ── 1. Blog ───────────────────────────────────────────────────────────

        $categories = [
            'Noticias Gremiales',
            'Sector Hidrocarburífero',
            'Desarrollo Empresarial',
        ];

        foreach ($categories as $catName) {
            BlogCategory::firstOrCreate(['name' => $catName]);
        }

        $catNoticias    = BlogCategory::where('name', 'Noticias Gremiales')->first();
        $catHidro       = BlogCategory::where('name', 'Sector Hidrocarburífero')->first();
        $catDesarrollo  = BlogCategory::where('name', 'Desarrollo Empresarial')->first();

        $posts = [
            [
                'title'       => 'CAMEP lidera mesa de trabajo con operadoras del sector',
                'excerpt'     => 'La cámara empresarial sostuvo un encuentro estratégico con representantes de las principales operadoras de hidrocarburos presentes en Puerto Gaitán.',
                'content'     => '<p>La Cámara Empresarial de Puerto Gaitán — CAMEP — convocó una mesa de trabajo con representantes de las principales operadoras del sector hidrocarburífero en la región. El objetivo fue establecer canales directos de comunicación y promover la participación de las empresas locales en los planes de proveeduría.</p><p>Durante el encuentro se identificaron oportunidades en contratación de transporte, mantenimiento industrial y servicios ambientales, sectores donde las pymes locales tienen ventajas competitivas.</p>',
                'category_id' => $catNoticias->id,
                'is_featured' => true,
                'status'      => 'published',
                'published_at'=> now()->subDays(2),
            ],
            [
                'title'       => 'Nuevas oportunidades de contratación en el bloque Rubiales',
                'excerpt'     => 'Se abrieron convocatorias para servicios de mantenimiento, transporte y suministros. Las empresas afiliadas a CAMEP tienen acceso prioritario.',
                'content'     => '<p>El bloque Rubiales ha publicado nuevas convocatorias de contratación para el segundo semestre. Los servicios requeridos incluyen mantenimiento mecánico, logística terrestre y dotación de equipos de seguridad industrial.</p><p>Las empresas afiliadas a CAMEP cuentan con acompañamiento para la preparación de propuestas técnicas y económicas.</p>',
                'category_id' => $catHidro->id,
                'is_featured' => false,
                'status'      => 'published',
                'published_at'=> now()->subDays(5),
            ],
            [
                'title'       => 'Programa de fortalecimiento empresarial: resultados del primer semestre',
                'excerpt'     => 'Más de 30 empresas participaron en los talleres de costos, finanzas y modelos de contratación organizados por CAMEP durante el primer semestre del año.',
                'content'     => '<p>El programa de fortalecimiento empresarial de CAMEP cerró su primer semestre con resultados positivos. Treinta y dos empresas completaron los módulos de costos, estructuración financiera y plataformas de contratación pública.</p><p>Para el segundo semestre se habilitarán módulos de transformación digital y gestión ambiental con certificación.</p>',
                'category_id' => $catDesarrollo->id,
                'is_featured' => false,
                'status'      => 'published',
                'published_at'=> now()->subDays(10),
            ],
            [
                'title'       => 'CAMEP presente en la feria regional de proveedores del Meta',
                'excerpt'     => 'La cámara representó al sector empresarial de Puerto Gaitán en el evento más importante de la región para el relacionamiento entre proveedores y compradores.',
                'content'     => '<p>Con un stand institucional y la participación de ocho empresas afiliadas, CAMEP hizo presencia en la Feria Regional de Proveedores del Meta celebrada en Villavicencio.</p><p>El evento permitió establecer nuevos contactos comerciales y visibilizar la oferta de servicios especializados que ofrece el municipio de Puerto Gaitán al sector productivo regional.</p>',
                'category_id' => $catNoticias->id,
                'is_featured' => true,
                'status'      => 'published',
                'published_at'=> now()->subDays(15),
            ],
        ];

        foreach ($posts as $postData) {
            BlogPost::firstOrCreate(
                ['title' => $postData['title']],
                array_merge($postData, ['user_id' => $user->id])
            );
        }

        // ── 2. Anuncios públicos ──────────────────────────────────────────────

        $announcements = [
            [
                'title'        => 'Convocatoria: Licitación servicios de mantenimiento vial 2025',
                'excerpt'      => 'Se abre proceso de selección para empresas proveedoras de mantenimiento y rehabilitación de vías terciarias en el municipio.',
                'content'      => '<p>CAMEP convoca a las empresas del sector a participar en el proceso de licitación para servicios de mantenimiento y rehabilitación de vías terciarias en el área de influencia del municipio de Puerto Gaitán.</p><p><strong>Requisitos:</strong> Experiencia acreditada mínima de 3 años, RUP vigente, capacidad de contratación acorde al presupuesto oficial.</p><p><strong>Cierre de propuestas:</strong> 30 de mayo de 2025.</p>',
                'visibility'   => 'public',
                'status'       => 'published',
                'published_at' => now()->subDays(1),
                'expires_at'   => now()->addDays(30),
            ],
            [
                'title'        => 'Asamblea General de Afiliados — Mayo 2025',
                'excerpt'      => 'Se convoca a todos los empresarios afiliados a la Asamblea General ordinaria del año. Fecha: 20 de mayo, 9:00 a.m., sede CAMEP.',
                'content'      => '<p>La Junta Directiva de CAMEP convoca a la Asamblea General Ordinaria de Afiliados correspondiente al año 2025.</p><p><strong>Fecha:</strong> 20 de mayo de 2025<br><strong>Hora:</strong> 9:00 a.m.<br><strong>Lugar:</strong> Sede CAMEP, Puerto Gaitán — Meta</p><p>Orden del día: informe de gestión, estados financieros, renovación parcial de junta y proposiciones.</p>',
                'visibility'   => 'public',
                'status'       => 'published',
                'published_at' => now()->subDays(3),
                'expires_at'   => now()->addDays(15),
            ],
            [
                'title'        => 'Apertura proceso de afiliación segundo semestre 2025',
                'excerpt'      => 'CAMEP abre oficialmente el proceso de afiliación para empresas interesadas en hacer parte del directorio y acceder a los beneficios gremiales.',
                'content'      => '<p>La Cámara Empresarial de Puerto Gaitán — CAMEP — anuncia la apertura del proceso de afiliación para el segundo semestre de 2025.</p><p>Las empresas interesadas pueden inscribirse a través del portal web y acceder al paquete de beneficios que incluye visibilidad en el directorio, participación en mesas de trabajo y representación ante operadoras.</p>',
                'visibility'   => 'public',
                'status'       => 'published',
                'published_at' => now()->subDays(7),
                'expires_at'   => now()->addDays(60),
            ],
            [
                'title'        => 'Capacitación gratuita: Costos y finanzas para pymes del sector',
                'excerpt'      => 'CAMEP ofrece taller gratuito de estructuración de costos para empresas proveedoras del sector hidrocarburífero. Cupos limitados.',
                'content'      => '<p>En alianza con el SENA regional, CAMEP ofrece un taller intensivo de estructuración de costos y finanzas dirigido a pymes proveedoras del sector hidrocarburífero.</p><p><strong>Fecha:</strong> 10 de junio de 2025<br><strong>Duración:</strong> 8 horas (un día)<br><strong>Costo:</strong> Gratuito para empresas afiliadas</p><p>Inscripciones a través del portal o comunicándose directamente con la sede.</p>',
                'visibility'   => 'public',
                'status'       => 'published',
                'published_at' => now()->subDays(12),
                'expires_at'   => now()->addDays(20),
            ],
        ];

        foreach ($announcements as $announcementData) {
            Announcement::firstOrCreate(
                ['title' => $announcementData['title']],
                array_merge($announcementData, ['author_id' => $user->id])
            );
        }

        $this->command->info('✓ LocalContentSeeder: 4 blog posts y 4 anuncios públicos creados.');
    }
}
