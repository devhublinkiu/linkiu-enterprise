<?php

namespace App\Http\Controllers\Associate;

use App\Http\Controllers\Associate\Concerns\InteractsWithMicrositeMedia;
use App\Http\Controllers\Associate\Concerns\ManagesMicrositeAbout;
use App\Http\Controllers\Associate\Concerns\ManagesMicrositeContact;
use App\Http\Controllers\Associate\Concerns\ManagesMicrositePortada;
use App\Http\Controllers\Associate\Concerns\ManagesMicrositeProjects;
use App\Http\Controllers\Associate\Concerns\ManagesMicrositeServices;
use App\Http\Controllers\Associate\Concerns\ManagesMicrositeSlug;
use App\Http\Controllers\Controller;

/**
 * Micrositio del asociado ("Mi Página"). Plan 0021.
 *
 * El controlador es delgado a propósito: cada pestaña vive en su propio trait
 * (Regla 6) y los helpers de imágenes/dirección se comparten en un trait aparte.
 * - Slug (dirección pública): {@see ManagesMicrositeSlug}
 * - Portada (imagen o gradiente animado): {@see ManagesMicrositePortada}
 * - Quiénes somos (historia, certificaciones, equipo, clientes): {@see ManagesMicrositeAbout}
 * - Servicios (enriquecer los aprobados): {@see ManagesMicrositeServices}
 * - Proyectos (CRUD + galería): {@see ManagesMicrositeProjects}
 * - Contacto + publicado: {@see ManagesMicrositeContact}
 */
class MicrositeController extends Controller
{
    use InteractsWithMicrositeMedia;
    use ManagesMicrositeAbout;
    use ManagesMicrositeContact;
    use ManagesMicrositePortada;
    use ManagesMicrositeProjects;
    use ManagesMicrositeServices;
    use ManagesMicrositeSlug;
}
