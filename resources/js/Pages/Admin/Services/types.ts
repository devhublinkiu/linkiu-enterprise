// Tipos de la pantalla admin de Servicios. Ver plan 0010.

export interface Category {
    id: number;
    name: string;
    slug: string;
    order: number;
}

export interface Service {
    id: number;
    name: string;
    slug: string;
    category_id: number;
    is_active: boolean;
    category: Category | null;
    associates_count: number;
}

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
    first_page_url: string;
    last_page_url: string;
}

export interface Filters {
    search?: string;
    category_id?: string;
    per_page?: string;
}
