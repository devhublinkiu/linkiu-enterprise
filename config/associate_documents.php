<?php

/*
|--------------------------------------------------------------------------
| Associate Documents — Legacy Label Map
|--------------------------------------------------------------------------
|
| The live catalog of required documents now lives in the
| `document_requirements` table and is managed from the admin panel.
|
| This file only keeps the legacy mapping used by the historical migration
| `2026_05_27_120000_migrate_associate_files_keys_to_slugs.php`, which
| converted existing rows in `associates.files` from free-text Spanish
| labels to stable slug keys. Keep this so the migration remains
| reproducible from a pre-migration backup.
|
*/

return [
    'legacy_label_map' => [
        'Carta Solicitud Afiliación'                                => 'carta_solicitud_afiliacion',
        'Logo HD (JPG/PNG)'                                         => 'logo_hd',
        'Brochure/Portafolio'                                       => 'brochure_portafolio',
        'RUT'                                                       => 'rut',
        'Cámara y Comercio / Registro Mercantil'                    => 'camara_comercio',
        'Estados financieros con notas'                             => 'estados_financieros',
        'Fotocopia de la cédula del representante legal'            => 'cedula_representante_legal',
        'Antecedentes del contador público (Balance anterior)'      => 'antecedentes_contador_publico',
        'Composición Accionaria'                                    => 'composicion_accionaria',
        'Certificación Parafiscales'                                => 'certificacion_parafiscales',
        'Declaración de aceptación del PTEEI'                       => 'declaracion_pteei',
        'Compromiso de autoregulacion'                              => 'compromiso_autoregulacion',
        'Transferencia de datos'                                    => 'transferencia_datos',
        'Acuerdo de Afiliación'                                     => 'acuerdo_afiliacion',
        'Participación Accionaria'                                  => 'participacion_accionaria',
        'Certificado tamaño empresas'                               => 'certificado_tamano_empresa',
        'Carta de residencia del Representante Legal'               => 'carta_residencia_representante',
        'Última planilla de seguridad social'                       => 'planilla_seguridad_social',
        'Certificaciones de calidad'                                => 'certificaciones_calidad',
    ],
];
