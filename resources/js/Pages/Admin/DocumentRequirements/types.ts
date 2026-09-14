// Tipos de la pantalla admin de Documentos Requeridos. Ver plan 0012.

export interface DocumentRequirement {
    id: number;
    key: string;
    label: string;
    icon: string;
    accepts: string[];
    is_required: boolean;
    is_active: boolean;
    legend: string | null;
    template_path: string | null;
    template_url: string | null;
    display_order: number;
}

export interface Props {
    documents: DocumentRequirement[];
    allowedIcons: string[];
    allowedMimes: string[];
}

export const MIME_LABELS: Record<string, string> = {
    pdf: 'PDF',
    jpg: 'JPG',
    jpeg: 'JPEG',
    png: 'PNG',
    docx: 'DOCX',
    xlsx: 'XLSX',
};

// Slug de la clave interna a partir del nombre visible (minúsculas, sin acentos, _).
export function toKeySlug(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}
