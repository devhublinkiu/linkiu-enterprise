<?php

namespace Database\Seeders;

use App\Models\DocumentRequirement;
use Illuminate\Database\Seeder;

class DocumentRequirementSeeder extends Seeder
{
    public function run(): void
    {
        $mandatory = [
            ['carta_solicitud_afiliacion',     'Carta Solicitud Afiliación',                       'FileText',        ['pdf']],
            ['brochure_portafolio',            'Brochure/Portafolio',                              'FileSpreadsheet', ['pdf']],
            ['rut',                            'RUT',                                              'FileDigit',       ['pdf'],          'Del año más reciente'],
            ['camara_comercio',                'Cámara y Comercio / Registro Mercantil',           'Landmark',        ['pdf'],          'Del año más reciente'],
            ['estados_financieros',            'Estados financieros con notas',                    'FileSpreadsheet', ['pdf']],
            ['cedula_representante_legal',     'Fotocopia de la cédula del representante legal',   'ShieldCheck',     ['pdf']],
            ['antecedentes_contador_publico',  'Antecedentes del contador público (Balance anterior)', 'FileCheck',   ['pdf']],
            ['composicion_accionaria',         'Composición Accionaria',                           'CheckCircle2',    ['pdf']],
            ['certificacion_parafiscales',     'Certificación Parafiscales',                       'Check',           ['pdf']],
            ['declaracion_pteei',              'Declaración de aceptación del PTEEI',              'FileText',        ['pdf'],          'Usa la plantilla oficial', '/plantillas_docs/FR-PICAMEP-006_V01_FORMATO_DECLARACION_DE_ACEPTACION_Y_AUTORIZACION_DEL_PTEEI.pdf'],
            ['compromiso_autoregulacion',      'Compromiso de autoregulacion',                     'Scale',           ['pdf'],          'Usa la plantilla oficial', '/plantillas_docs/FR-PICAMEP-005_FORMATO_COMPROMISO_DE_AUTOREGULACION.pdf'],
            ['transferencia_datos',            'Transferencia de datos',                           'Share2',          ['pdf'],          'Usa la plantilla oficial', '/plantillas_docs/FR-PICAMEP-004_FORMATO_TRANSFERENCIA_DE_DATOS.pdf'],
            ['acuerdo_afiliacion',             'Acuerdo de Afiliación',                            'FileText',        ['pdf', 'docx'],  'Usa la plantilla oficial', '/plantillas_docs/FR-PICAMEP-003_FORMATO_ACUERDO_DE_AFILIACION.docx'],
            ['participacion_accionaria',       'Participación Accionaria',                         'Building2',       ['pdf', 'docx'],  'Usa la plantilla oficial', '/plantillas_docs/FR-PICAMEP-007_FORMATO_PARTICIPACION_ACCIONARIA.docx'],
            ['certificado_tamano_empresa',     'Certificado tamaño empresas',                      'Building',        ['pdf', 'docx'],  'Usa la plantilla oficial', '/plantillas_docs/FR-PICAMEP-008_FORMATO_CERTIFICACION_DE_TAMANO_EMPRESA_JURIDICAS.docx'],
        ];

        $optional = [
            ['carta_residencia_representante', 'Carta de residencia del Representante Legal',      'FileText',        ['pdf']],
            ['planilla_seguridad_social',      'Última planilla de seguridad social',              'FileCheck',       ['pdf']],
            ['certificaciones_calidad',        'Certificaciones de calidad',                       'ShieldCheck',     ['pdf']],
        ];

        $order = 0;

        foreach ($mandatory as $row) {
            DocumentRequirement::updateOrCreate(
                ['key' => $row[0]],
                [
                    'label'         => $row[1],
                    'icon'          => $row[2],
                    'accepts'       => $row[3],
                    'legend'        => $row[4] ?? null,
                    'template_path' => $row[5] ?? null,
                    'is_required'   => true,
                    'is_active'     => true,
                    'display_order' => $order++,
                ]
            );
        }

        foreach ($optional as $row) {
            DocumentRequirement::updateOrCreate(
                ['key' => $row[0]],
                [
                    'label'         => $row[1],
                    'icon'          => $row[2],
                    'accepts'       => $row[3],
                    'legend'        => $row[4] ?? null,
                    'template_path' => $row[5] ?? null,
                    'is_required'   => false,
                    'is_active'     => true,
                    'display_order' => $order++,
                ]
            );
        }
    }
}
