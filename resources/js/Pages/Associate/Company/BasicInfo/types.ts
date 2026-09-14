// Tipos compartidos de la sección Información Básica. Ver plan 0007 / ADR-0005-a.

export type BasicInfoForm = {
    company_name: string;
    initials: string;
    nit: string;
    legal_status: string;
    legal_status_other: string;
    constitution_date: string;
    country_origin: string;
    phone: string;
    website: string;
    department: string;
    department_id: number | null;
    city: string;
    city_id: number | null;
    address: string;
    rep_name: string;
    rep_position: string;
    rep_doc_type: string;
    rep_doc: string;
};

export type LocationOption = { id: number; code: string; name: string };

export type SectionStatus =
    | 'draft'
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'change_pending';

// Valores del Select de tipo de sociedad. Cualquier otro valor guardado se trata como "Otro".
export const LEGAL_STATUSES = [
    'SAS',
    'Ltda.',
    'Anónima',
    'ESAL',
    'Cooperativa',
    'Otro',
] as const;

export const DOC_TYPES = [
    { value: 'CC', label: 'Cédula de ciudadanía' },
    { value: 'CE', label: 'Cédula de extranjería' },
    { value: 'PAS', label: 'Pasaporte' },
    { value: 'NIT', label: 'NIT' },
] as const;
