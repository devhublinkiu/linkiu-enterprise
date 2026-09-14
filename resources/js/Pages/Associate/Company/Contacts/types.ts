// Tipos y constantes de la sección Contactos y Referencias. Ver plan 0009 / ADR-0005-c.

export type ContactRow = {
    area: string;
    name: string;
    position: string;
    email: string;
    phone: string;
};

export type ReferenceRow = {
    type: 'commercial' | 'bank';
    name: string;
    contact_person: string;
    position: string;
    email: string;
    phone: string;
};

export type ContactsForm = {
    contacts: ContactRow[];
    main_ciiu: string;
    secondary_ciiu: string;
    billing_email: string;
    company_type: string[];
    references: ReferenceRow[];
    social_instagram: string;
    social_facebook: string;
    social_linkedin: string;
    social_other: string;
};

// Perfil de operación: multi-selección (marca todas las que apliquen).
export const COMPANY_TYPES = [
    'Suministros',
    'Constructor',
    'Consultor',
    'Proveedor',
    'Otros',
] as const;

// Canales digitales (todos opcionales). El ícono se resuelve en el part.
export const SOCIAL_CHANNELS = [
    { key: 'social_instagram', label: 'Instagram', placeholder: '@empresa' },
    {
        key: 'social_facebook',
        label: 'Facebook',
        placeholder: 'facebook.com/empresa',
    },
    {
        key: 'social_linkedin',
        label: 'LinkedIn',
        placeholder: 'linkedin.com/company/empresa',
    },
    {
        key: 'social_other',
        label: 'Sitio web / portafolio',
        placeholder: 'https://empresa.com',
    },
] as const satisfies ReadonlyArray<{
    key: keyof ContactsForm;
    label: string;
    placeholder: string;
}>;

export const emptyContact = (): ContactRow => ({
    area: '',
    name: '',
    position: '',
    email: '',
    phone: '',
});

export const emptyReference = (
    type: ReferenceRow['type'] = 'commercial',
): ReferenceRow => ({
    type,
    name: '',
    contact_person: '',
    position: '',
    email: '',
    phone: '',
});

// Las filas persistidas llegan de la BD con campos null (columnas nullable) y llaves extra
// (id, timestamps). Estos helpers las hidratan al shape del form: strings saneados a '' —
// para no romper inputs controlados ni los .trim() de la validación— descartando lo demás.
type RawContact = Partial<Record<keyof ContactRow, string | null>>;
type RawReference = Partial<Record<keyof ReferenceRow, string | null>>;

export const toContactRow = (c: RawContact = {}): ContactRow => ({
    area: c.area ?? '',
    name: c.name ?? '',
    position: c.position ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
});

export const toReferenceRow = (r: RawReference = {}): ReferenceRow => ({
    type: r.type === 'bank' ? 'bank' : 'commercial',
    name: r.name ?? '',
    contact_person: r.contact_person ?? '',
    position: r.position ?? '',
    email: r.email ?? '',
    phone: r.phone ?? '',
});

export const hydrateContacts = (rows?: RawContact[] | null): ContactRow[] =>
    rows && rows.length ? rows.map(toContactRow) : [emptyContact()];

export const hydrateReferences = (
    rows?: RawReference[] | null,
): ReferenceRow[] =>
    rows && rows.length ? rows.map(toReferenceRow) : [emptyReference()];

// Validación de correo para el aviso en vivo del cliente (el servidor es la autoridad).
export const isEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
