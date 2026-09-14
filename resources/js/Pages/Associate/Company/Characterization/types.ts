// Tipos y constantes de la sección Caracterización. Ver plan 0008 / ADR-0005-b.

export type CharacterizationForm = {
    employees_tech: number;
    employees_prof: number;
    employees_admin: number;
    employees_exec: number;
    employees_other: number;
    employees_other_desc: string;
    employees_direct_count: number; // derivado (solo lectura): suma de las categorías
    hydrocarbons_participation: boolean | null;
    hydrocarbons_level: string;
    pep_declaration: boolean | null;
    pep_name: string;
    pep_doc_type: string;
    pep_entity: string;
    capacitation_plan: boolean | null;
    capacitation_level: string;
    capacitation_no_reason: string;
    company_classification: string;
    public_income_pct: number;
    private_income_pct: number;
    other_guilds: string;
};

// Categorías de empleados (su suma alimenta el total derivado).
export const EMPLOYEE_CATS = [
    { key: 'employees_tech', label: 'Técnico' },
    { key: 'employees_prof', label: 'Profesional' },
    { key: 'employees_admin', label: 'Administrativo' },
    { key: 'employees_exec', label: 'Directivo' },
    { key: 'employees_other', label: 'Otros' },
] as const satisfies ReadonlyArray<{
    key: keyof CharacterizationForm;
    label: string;
}>;

export const HYDROCARBON_LEVELS = [
    'Nacional',
    'Departamental',
    'Municipal',
] as const;

export const CAPACITATION_LEVELS = [
    'Alta Gerencia',
    'Media',
    'Profesionales',
    'Técnicos',
    'Todos',
] as const;

export const NO_PLAN_REASONS = [
    'Falta de recursos',
    'Desconocimiento',
    'Falta de oferta',
    'Otro',
] as const;

// Tamaño de la organización (guía por número de empleados; el identificador es el valor).
export const CLASSIFICATIONS = [
    { value: 'Micro', title: 'Microempresa', desc: 'Hasta 10 empleados.' },
    { value: 'Pequeña', title: 'Pequeña', desc: 'Entre 11 y 50 empleados.' },
    { value: 'Mediana', title: 'Mediana', desc: 'Entre 51 y 200 empleados.' },
    { value: 'Grande', title: 'Grande', desc: 'Más de 200 empleados.' },
] as const;
