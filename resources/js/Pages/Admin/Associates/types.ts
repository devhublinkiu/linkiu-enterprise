// Tipos de la lista admin de asociados. Ver plan 0014 / ADR-0007.

export interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginator<T> {
    data: T[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    links: PaginatorLink[];
    prev_page_url: string | null;
    next_page_url: string | null;
}

export type AdminState =
    | 'pendiente'
    | 'admitida_sin_pago'
    | 'activa'
    | 'en_gracia'
    | 'vencida'
    | 'desactivada';

export type SubscriptionStatus = 'none' | 'active' | 'grace' | 'expired';

export interface AssociateRow {
    id: number;
    company_name: string;
    nit: string | null;
    city: string | null;
    created_at: string;
    is_public: boolean;
    is_verified: boolean;
    section_reviews: Record<string, { status: string }> | null;
    estado: AdminState;
    subscription_status: SubscriptionStatus;
    plan_expires_at: string | null;
}

export interface Filters {
    estado?: string | null;
    q?: string | null;
}

// Etiqueta + variante de badge por estado derivado.
export const ESTADO_BADGE: Record<
    AdminState,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
> = {
    pendiente: { label: 'Pendiente', variant: 'secondary' },
    admitida_sin_pago: { label: 'Admitida · sin pago', variant: 'outline' },
    activa: { label: 'Activa', variant: 'default' },
    en_gracia: { label: 'En gracia', variant: 'secondary' },
    vencida: { label: 'Vencida', variant: 'destructive' },
    desactivada: { label: 'Desactivada', variant: 'outline' },
};

// Secciones revisables (mismo set que el backend REVIEWABLE_SECTIONS).
export const SECTION_KEYS = [
    'basicinfo',
    'characterization',
    'contacts',
    'documentation',
    'services',
] as const;

// Días enteros entre hoy y una fecha ISO (positivo = futuro).
export function daysUntil(iso: string | null): number | null {
    if (!iso) return null;
    const ms = new Date(iso).getTime() - Date.now();
    return Math.round(ms / (1000 * 60 * 60 * 24));
}
