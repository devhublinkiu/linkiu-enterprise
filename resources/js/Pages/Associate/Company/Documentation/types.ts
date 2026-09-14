// Tipos y helpers de la sección Documentación. Ver plan 0013 / ADR-0005-e.

export interface DocSpec {
    key: string;
    label: string;
    icon: string;
    accepts: string[];
    legend?: string | null;
    template?: string | null;
}

export interface DocumentCatalog {
    mandatory: DocSpec[];
    optional: DocSpec[];
}

export type DocumentationForm = {
    // Archivos recién elegidos en esta sesión, por clave de documento.
    files: Record<string, File>;
    rep_name: string;
    rep_doc: string;
    membership_interest: string[];
    membership_interest_other: string;
    funds_origin_declaration: boolean;
};

// Intereses de afiliación (multi-selección). "Otro" habilita el texto libre.
export const INTERESTS = [
    'Gestión Gremial',
    'Información Sectorial',
    'Comunidad de Negocios',
    'Otro',
] as const;

export const MAX_FILE_MB = 10;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

export const acceptAttr = (accepts: string[]): string =>
    accepts.map((a) => `.${a}`).join(',');

export const fileExtension = (name: string): string => {
    const parts = name.split('.');
    return parts.length > 1 ? (parts.pop() as string).toLowerCase() : '';
};

export const humanSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const isImageUrl = (url: string): boolean =>
    /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
