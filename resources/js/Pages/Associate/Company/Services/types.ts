// Tipos de la sección Servicios del asociado. Ver plan 0011 / ADR-0005-d.

export interface ServiceItem {
    id: number;
    name: string;
    category_id: number;
    category?: { id: number; name: string } | null;
}

export interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    order: number;
}

export type ServicesForm = {
    description: string;
    service_ids: number[];
};
