<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Slugs reservados
    |--------------------------------------------------------------------------
    |
    | El micrositio se sirve en el raíz (dominio/mi-empresa) con una ruta de
    | último recurso. Ningún asociado puede tomar un slug que pise una ruta del
    | sistema: aquí van los primeros segmentos de todas las rutas vivas + palabras
    | de plataforma. La comprobación es case-insensitive contra el slug ya
    | normalizado. Ver ADR-0009 y plan 0021 (corte 21-A).
    |
    */
    'reserved_slugs' => [
        // Público
        'empresas', 'categorias', 'servicios', 'nosotros', 'nuestra-historia',
        'que-nos-inspira', 'nuestro-proposito', 'proyeccion-2030', 'operadoras',
        'bienes-y-servicios', 'blog', 'anuncios', 'contacto', 'red-camep',
        // Autenticado / plataforma
        'login', 'register', 'forgot-password', 'reset-password', 'logout',
        'dashboard', 'profile', 'admin', 'my-company', 'my-announcements',
        'mis-facturas', 'ubicaciones', 'associate', 'billing', 'dev', 'storage',
        'api', 'webhooks', 'sanctum', 'up', 'welcome', 'home',
    ],

    // Longitud del slug (tras normalizar).
    'slug_min' => 3,
    'slug_max' => 60,
];
