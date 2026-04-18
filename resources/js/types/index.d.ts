export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role?: string;
    is_superadmin?: boolean;
}

export interface Tenant {
    id: string;
    company_name: string;
    logo_url?: string;
    plan_type?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    tenant: Tenant;
    service_categories?: Array<{
        id: number;
        name: string;
        slug: string;
        services_count?: number;
    }>;
    recent_companies?: Array<{
        id: number;
        name: string;
        logo: string | null;
    }>;
};
