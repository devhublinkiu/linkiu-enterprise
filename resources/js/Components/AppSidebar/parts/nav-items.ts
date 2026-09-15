import {
    Briefcase,
    Building,
    Building2,
    CreditCard,
    Crown,
    Files,
    Globe,
    Image as ImageIcon,
    Layers,
    LayoutDashboard,
    ListChecks,
    type LucideIcon,
    Mail,
    Megaphone,
    Network,
    Plug,
    Receipt,
    Rss,
    ShieldCheck,
    Star,
    Trophy,
    Users,
} from 'lucide-react';

// Definición de la navegación del panel. La compuerta real por rol/plan vive en el servidor
// (middleware superadmin / subscription.active / feature:*, ADR-0002); aquí solo se refleja.
export type NavChild = {
    name: string;
    href: string;
    locked?: boolean;
    count?: number;
    soon?: boolean;
};

export type NavItem = {
    name: string;
    icon: LucideIcon;
    href?: string;
    locked?: boolean;
    count?: number | string;
    children?: NavChild[];
    // Módulo anunciado pero aún no disponible: se muestra con badge "Próximamente"
    // y no navega. La compuerta real de plan vive en el servidor (ADR-0002).
    soon?: boolean;
};

export type AssociateLocks = {
    isCompanyLocked: boolean;
    isGeneralLocked: boolean;
    isBillingLocked: boolean;
    unreadInvoices: number;
};

export function buildAdminItems(
    counts: { approved: number; pending: number; inactive: number },
    pendingPayments: number,
): NavItem[] {
    return [
        { name: 'Dashboard', icon: LayoutDashboard, href: route('dashboard') },
        {
            name: 'Empresas',
            icon: Building2,
            children: [
                {
                    name: 'Activas',
                    href: route('admin.associates.index', {
                        estado: 'activa',
                    }),
                    count: counts.approved,
                },
                {
                    name: 'Pendientes',
                    href: route('admin.associates.index', {
                        estado: 'pendiente',
                    }),
                    count: counts.pending,
                },
                {
                    name: 'Inactivas',
                    href: route('admin.associates.index', {
                        estado: 'inactiva',
                    }),
                    count: counts.inactive,
                },
            ],
        },
        { name: 'Usuarios', icon: Users, href: route('admin.users.index') },
        { name: 'Roles y permisos', icon: ShieldCheck, href: '#', soon: true },
        { name: 'Reseñas', icon: Star, href: '#', soon: true },
        {
            name: 'Servicios',
            icon: Layers,
            href: route('admin.services.index'),
        },
        {
            name: 'Documentos Requeridos',
            icon: ListChecks,
            href: route('admin.document-requirements.index'),
        },
        {
            name: 'Red Camep',
            icon: Network,
            children: [
                { name: 'Ver Foro', href: route('forums.index') },
                {
                    name: 'Gestionar Círculos',
                    href: route('admin.forums.categories.index'),
                },
                {
                    name: 'Reportes de Comunidad',
                    href: route('admin.forums.reports.index'),
                },
            ],
        },
        { name: 'Planes', icon: Files, href: route('admin.plans.index') },
        {
            name: 'Finanzas',
            icon: CreditCard,
            children: [
                {
                    name: 'Datos bancarios',
                    href: route('admin.bank-accounts.index'),
                },
                {
                    name: 'Pagos',
                    href: route('admin.payments.index'),
                    count: pendingPayments || undefined,
                },
                {
                    name: 'Facturación',
                    href: route('admin.invoices.index'),
                },
            ],
        },
        {
            name: 'Anuncios',
            icon: Megaphone,
            href: route('admin.announcements.index'),
        },
        {
            name: 'Bienes y Servicios',
            icon: Briefcase,
            children: [
                {
                    name: 'Empresas',
                    href: route('admin.bienes-servicios.companies.index'),
                },
                {
                    name: 'Licitaciones',
                    href: route('admin.bienes-servicios.tenders.index'),
                },
            ],
        },
        { name: 'Blogs', icon: Rss, href: route('admin.blog.index') },
        {
            name: 'Solicitudes',
            icon: Mail,
            href: route('admin.contacts.index'),
        },
        { name: 'Slider', icon: ImageIcon, href: route('admin.sliders.index') },
        {
            name: 'Integraciones',
            icon: Plug,
            children: [
                { name: 'Bold', href: route('admin.integrations.index') },
            ],
        },
    ];
}

export function buildAssociateItems(locks: AssociateLocks): NavItem[] {
    const {
        isCompanyLocked,
        isGeneralLocked,
        isBillingLocked,
        unreadInvoices,
    } = locks;

    return [
        { name: 'Dashboard', icon: LayoutDashboard, href: route('dashboard') },
        {
            name: 'Mi empresa',
            icon: Building,
            locked: isCompanyLocked,
            children: [
                {
                    name: 'Información Básica',
                    href: route('associate.company.basic'),
                    locked: isCompanyLocked,
                },
                {
                    name: 'Caracterización',
                    href: route('associate.company.characterization'),
                    locked: isCompanyLocked,
                },
                {
                    name: 'Contactos',
                    href: route('associate.company.contacts'),
                    locked: isCompanyLocked,
                },
                {
                    name: 'Servicios',
                    href: route('associate.company.services'),
                    locked: isCompanyLocked,
                },
                {
                    name: 'Documentación',
                    href: route('associate.company.documentation'),
                    locked: isCompanyLocked,
                },
            ],
        },
        {
            // Micrositio público del asociado (plan 0021). Se nutre por secciones,
            // espejo de las pestañas públicas. Se irá completando por cortes.
            name: 'Mi Página',
            icon: Globe,
            locked: isGeneralLocked,
            children: [
                {
                    name: 'Portada',
                    href: route('associate.company.microsite.portada'),
                    locked: isGeneralLocked,
                },
                {
                    name: 'Quiénes somos',
                    href: route('associate.company.microsite.about'),
                    locked: isGeneralLocked,
                },
                {
                    name: 'Servicios',
                    href: route('associate.company.microsite.services'),
                    locked: isGeneralLocked,
                },
                {
                    name: 'Proyectos',
                    href: route('associate.company.microsite.projects'),
                    locked: isGeneralLocked,
                },
                {
                    name: 'Galería',
                    href: route('associate.company.gallery'),
                    locked: isGeneralLocked,
                },
                {
                    name: 'Contacto',
                    href: route('associate.company.microsite.contact'),
                    locked: isGeneralLocked,
                },
            ],
        },
        {
            name: 'Anuncios y Licitaciones',
            icon: Megaphone,
            href: route('associate.announcements.index'),
            locked: isGeneralLocked,
        },
        {
            name: 'Bienes y Servicios',
            icon: Building2,
            href: route('associate.company.bienes-servicios.index'),
            locked: isGeneralLocked,
        },
        {
            name: 'EmpleAmep',
            icon: Briefcase,
            href: '#',
            soon: true,
        },
        {
            name: 'Red Camep',
            icon: Network,
            href: route('forums.index'),
            locked: isGeneralLocked,
        },
        { name: 'Reseñas', icon: Star, href: '#', soon: true },
        { name: 'Mi Ranking', icon: Trophy, href: '#', soon: true },
        {
            // Siempre accesible — puerta a la renovación.
            name: 'Gestión del Plan',
            icon: Crown,
            href: route('associate.company.billing'),
            locked: isBillingLocked,
        },
        {
            name: 'Mis Facturas',
            icon: Receipt,
            href: route('associate.company.invoices.index'),
            locked: isGeneralLocked,
            count: unreadInvoices || undefined,
        },
    ];
}
