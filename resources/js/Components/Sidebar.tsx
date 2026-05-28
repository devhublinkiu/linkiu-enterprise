import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
    UserCircle,
    Layers,
    Image as ImageIcon,
    Building2,
    ShieldCheck,
    Star,
    Network,
    CreditCard,
    Megaphone,
    Rss,
    Plug,
    Files,
    ChevronDown,
    Building,
    Mail,
    Lock,
    Briefcase,
    Receipt,
    Ticket,
    Crown,
    Clock,
    AlertCircle,
    ListChecks
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/Components/ui/Separator';

interface NavItem {
    name: string;
    icon: any;
    href?: string;
    show?: boolean;
    locked?: boolean;
    count?: number | string;
    countColor?: string;
    children?: {
        name: string;
        href: string;
        show?: boolean;
        locked?: boolean;
        count?: number;
        countColor?: string;
    }[];
}

interface Subscription {
    status: 'none' | 'active' | 'grace' | 'expired';
    plan_name: string | null;
    plan_color: string | null;
    days_remaining: number | null;
    days_total: number | null;
    expires_at: string | null;
}

interface SidebarProps {
    tenant: any;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ tenant, isOpen, setIsOpen }: SidebarProps) {
    const { auth, associate_counts, subscription, pending_payment_requests, unread_invoices } = usePage().props as any;
    const isSuperAdmin = auth.user.is_superadmin;
    const isAdmin = isSuperAdmin || auth.user.role === 'admin';
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const counts = associate_counts || { approved: 0, pending: 0, inactive: 0 };
    const pendingPayments: number = pending_payment_requests ?? 0;
    const unreadInvoices: number = unread_invoices ?? 0;
    const sub: Subscription | null = subscription ?? null;

    // Determine if the associate nav is locked
    const hasActiveSubscription = sub && (sub.status === 'active' || sub.status === 'grace');
    const isAssociateVerified = auth.associate?.status === 'verified';
    const isAssociatePending = !auth.associate || auth.associate.status === 'pending';

    // General lock for most features (Forum, Ads, etc.)
    const isGeneralLocked = !isAdmin && !hasActiveSubscription;

    // "Mi Empresa" is ONLY locked if subscription is expired (and not in grace)
    // but should be OPEN during onboarding (pending/none)
    const isCompanyLocked = !isAdmin && sub?.status === 'expired';

    // "Gestión del Plan" is open if verified OR already has a subscription
    const isBillingLocked = !isAdmin && !isAssociateVerified && !sub;

    // Show profile completion badge when plan is active but profile is not yet public
    const associate = auth.associate;
    const needsProfileCompletion = !isAdmin && sub && sub.status !== 'none' && associate && !associate.is_public;
    const hasNoPlan = !isAdmin && (!sub || sub.status === 'none');

    const toggleMenu = (name: string) => {
        if (!isOpen) {
            setIsOpen(true);
            setOpenMenus([name]);
            return;
        }
        setOpenMenus(prev =>
            prev.includes(name)
                ? prev.filter(m => m !== name)
                : [...prev, name]
        );
    };

    // Close all submenus when closing the sidebar
    useEffect(() => {
        if (!isOpen) setOpenMenus([]);
    }, [isOpen]);

    const adminItems: NavItem[] = [
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            href: route('dashboard'),
            show: true
        },
        {
            name: 'Empresas',
            icon: Building2,
            show: isAdmin,
            children: [
                {
                    name: 'Activas',
                    href: route('admin.associates.index', { status: 'approved' }),
                    count: counts.approved,
                    countColor: 'bg-emerald-600'
                },
                {
                    name: 'Pendientes',
                    href: route('admin.associates.index', { status: 'pending' }),
                    count: counts.pending,
                    countColor: 'bg-amber-600'
                },
                {
                    name: 'Inactivas',
                    href: route('admin.associates.index', { status: 'inactive' }),
                    count: counts.inactive,
                    countColor: 'bg-slate-400'
                },
            ]
        },
        {
            name: 'Usuarios',
            icon: Users,
            href: route('admin.users.index'),
            show: isAdmin
        },
        {
            name: 'Roles y permisos',
            icon: ShieldCheck,
            href: '#',
            show: isAdmin
        },
        {
            name: 'Reseñas',
            icon: Star,
            href: '#',
            show: isAdmin
        },
        {
            name: 'Servicios',
            icon: Layers,
            href: route('admin.services.index'),
            show: isAdmin
        },
        {
            name: 'Documentos Requeridos',
            icon: ListChecks,
            href: route('admin.document-requirements.index'),
            show: isAdmin
        },
        {
            name: 'Red Camep',
            icon: Network,
            show: isAdmin,
            children: [
                { name: 'Ver Foro', href: route('forums.index') },
                { name: 'Gestionar Círculos', href: route('admin.forums.categories.index') },
                { name: 'Reportes de Comunidad', href: route('admin.forums.reports.index') },
            ]
        },
        {
            name: 'Planes',
            icon: Files,
            href: route('admin.plans.index'),
            show: isAdmin
        },
        {
            name: 'Finanzas',
            icon: CreditCard,
            show: isAdmin,
            children: [
                { name: 'Datos bancarios', href: route('admin.bank-accounts.index') },
                {
                    name: 'Solicitudes de pago',
                    href: route('admin.payment-requests.index'),
                    count: pendingPayments || undefined,
                    countColor: 'bg-amber-600'
                },
                { name: 'Facturación', href: route('admin.invoices.index') },
            ]
        },
        {
            name: 'Anuncios',
            icon: Megaphone,
            href: route('admin.announcements.index'),
            show: isAdmin
        },
        {
            name: 'Bienes y Servicios',
            icon: Briefcase,
            show: isAdmin,
            children: [
                { name: 'Empresas', href: route('admin.bienes-servicios.companies.index') },
                { name: 'Licitaciones', href: route('admin.bienes-servicios.tenders.index') },
            ]
        },
        {
            name: 'Blogs',
            icon: Rss,
            href: route('admin.blog.index'),
            show: isAdmin
        },
        {
            name: 'Solicitudes',
            icon: Mail,
            href: route('admin.contacts.index'),
            show: isAdmin
        },
        {
            name: 'Slider',
            icon: ImageIcon,
            href: route('admin.sliders.index'),
            show: isAdmin
        },
        {
            name: 'Integraciones',
            icon: Plug,
            show: isAdmin,
            children: [
                { name: 'Wompi', href: '#' },
                { name: 'Epayco', href: '#' },
            ]
        },
    ];

    const associateItems: NavItem[] = [
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            href: route('dashboard'),
            show: true,
            locked: false,
        },
        {
            name: 'Mi empresa',
            icon: Building,
            show: true,
            locked: isCompanyLocked,
            children: [
                { name: 'Información Básica', href: route('associate.company.basic'), locked: isCompanyLocked },
                { name: 'Caracterización', href: route('associate.company.characterization'), locked: isCompanyLocked },
                { name: 'Contactos', href: route('associate.company.contacts'), locked: isCompanyLocked },
                { name: 'Servicios', href: route('associate.company.services'), locked: isCompanyLocked },
                { name: 'Documentación', href: route('associate.company.documentation'), locked: isCompanyLocked },
            ]
        },
        {
            name: 'Galería de Fotos',
            icon: ImageIcon,
            href: route('associate.company.gallery'),
            show: true,
            locked: isGeneralLocked,
        },
        {
            name: 'Anuncios y Licitaciones',
            icon: Megaphone,
            href: route('associate.announcements.index'),
            show: true,
            locked: isGeneralLocked,
        },
        {
            name: 'Bienes y Servicios',
            icon: Building2,
            href: route('associate.company.bienes-servicios.index'),
            show: true,
            locked: isGeneralLocked,
        },
        {
            name: 'EmpleAmep',
            icon: Briefcase,
            href: '#',
            show: true,
            locked: isGeneralLocked,
        },
        {
            name: 'Red Camep',
            icon: Network,
            href: route('forums.index'),
            show: true,
            locked: isGeneralLocked,
        },
        {
            name: 'Reseñas',
            icon: Star,
            href: '#',
            show: true,
            locked: isGeneralLocked,
        },
        {
            // Always accessible — gateway to renewal
            name: 'Gestión del Plan',
            icon: Crown,
            href: route('associate.company.billing'),
            show: true,
            locked: isBillingLocked,
        },
        {
            name: 'Mis Facturas',
            icon: Receipt,
            href: route('associate.company.invoices.index'),
            show: true,
            locked: isGeneralLocked,
            count: unreadInvoices || undefined,
            countColor: 'bg-slate-900',
        },
        {
            name: 'Soporte Técnico',
            icon: Ticket,
            href: '#',
            show: true,
            locked: isGeneralLocked,
        },
    ];

    const navItems = isAdmin ? adminItems : associateItems;

    // Auto-open menu if child is active
    useEffect(() => {
        if (isOpen) {
            navItems.filter(item => item.show !== false).forEach(item => {
                if (item.children) {
                    const hasActiveChild = item.children.some(child => {
                        if (!child.href || child.href === '#') return false;
                        return route().current(child.href) || window.location.href.includes(child.href);
                    });

                    if (hasActiveChild && !openMenus.includes(item.name)) {
                        setOpenMenus(prev => {
                            if (prev.includes(item.name)) return prev;
                            return [...prev, item.name];
                        });
                    }
                }
            });
        }
    }, [isOpen, usePage().url, navItems]);

    // Plan progress bar calculation
    const planProgress = (() => {
        if (!sub || sub.status !== 'active' || sub.days_remaining === null || !sub.days_total) return null;
        const elapsed = sub.days_total - sub.days_remaining;
        const pct = Math.min(Math.round((elapsed / sub.days_total) * 100), 100);
        return { pct, elapsed, total: sub.days_total, remaining: sub.days_remaining };
    })();

    return (
        <aside
            className={cn(
                "fixed top-0 left-0 h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-50 flex flex-col shadow-sm",
                isOpen ? "w-72" : "w-20"
            )}
        >
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-between px-4 shrink-0 border-b border-slate-50 overflow-hidden">
                <div className="flex items-center gap-3 min-w-0">
                    {!isOpen ? (
                        <div className="h-10 w-10 flex items-center justify-center shrink-0">
                            <img
                                src="/images/camep/logo_camep_horizontal_sidebar.svg"
                                className="h-8 w-8 object-contain"
                                alt="CAMEP"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center animate-in fade-in duration-500 px-1 shrink-0">
                            <img
                                src="/images/camep/logo_camep_horizontal_sidebar.svg"
                                className="h-14 w-auto object-contain"
                                alt="CAMEP"
                            />
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200",
                        !isOpen && "hidden"
                    )}
                >
                    <ChevronLeft size={18} />
                </button>
            </div>

            {/* Plan Progress Widget — only for active associates */}
            {!isAdmin && isOpen && sub && sub.status !== 'none' && (
                <div className={cn(
                    "mx-3 mt-4 rounded-xl p-3 border",
                    sub.status === 'active' && "bg-slate-50 border-slate-100",
                    sub.status === 'grace' && "bg-amber-50 border-amber-200",
                    sub.status === 'expired' && "bg-red-50 border-red-200",
                )}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <div
                                className="h-2 w-2 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: sub.plan_color || '#64748b' }}
                            />
                            <span className="text-xs font-black text-slate-900 uppercase truncate">
                                {sub.plan_name || 'Sin plan'}
                            </span>
                        </div>
                        <span className={cn(
                            "text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md shrink-0 shadow-sm",
                            sub.status === 'active' && "bg-emerald-600 text-white",
                            sub.status === 'grace' && "bg-amber-600 text-white",
                            sub.status === 'expired' && "bg-red-600 text-white",
                        )}>
                            {sub.status === 'active' ? 'Active' : sub.status === 'grace' ? 'Grace' : 'Expired'}
                        </span>
                    </div>

                    {/* Progress bar */}
                    {planProgress && sub.status === 'active' && (
                        <div className="space-y-1.5">
                            <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{
                                        width: `${planProgress.pct}%`,
                                        backgroundColor: sub.plan_color || '#10b981'
                                    }}
                                />
                            </div>
                            <div className="flex justify-between items-center px-0.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{planProgress.elapsed}d uso</span>
                                <span className="text-[10px] text-slate-900 font-black uppercase flex items-center gap-1">
                                    <Clock size={8} />
                                    {planProgress.remaining}d restante
                                </span>
                            </div>
                        </div>
                    )}

                    {sub.status === 'grace' && (
                        <p className="text-[10px] text-amber-700 font-black uppercase mt-1 animate-pulse">
                            Prórroga — {sub.days_remaining}d faltantes
                        </p>
                    )}

                    {sub.status === 'expired' && (
                        <p className="text-[10px] text-red-700 font-black uppercase mt-1">
                            Vencido el {sub.expires_at}
                        </p>
                    )}
                </div>
            )}

            {/* Profile completion CTA — shown when plan active but not yet public */}
            {!isAdmin && isOpen && needsProfileCompletion && (
                <Link
                    href={route('associate.company.basic')}
                    className="mx-3 mt-3 flex items-start gap-3 rounded-xl p-3 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-all group shadow-sm"
                >
                    <div className="mt-0.5 h-5 w-5 shrink-0 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                        <AlertCircle size={12} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-emerald-900 uppercase leading-tight">Activar Perfil</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1 leading-normal uppercase">Completa los datos para aparecer en el directorio.</p>
                    </div>
                </Link>
            )}

            {/* No plan notice */}
            {!isAdmin && isOpen && hasNoPlan && (
                <div className="mx-3 mt-4 rounded-xl p-4 border border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-200">
                    <p className="text-[11px] font-black uppercase mb-1">Sin Suscripción</p>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">Activa tu membresía para habilitar todas las funciones.</p>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                {navItems.filter(item => item.show !== false).map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isMenuOpen = openMenus.includes(item.name);
                    const isActive = item.href ? (route().current(item.href) || (item.name === 'Dashboard' && route().current('dashboard'))) : false;
                    const itemLocked = !isAdmin && (item as any).locked;

                    if (itemLocked) {
                        return (
                            <div key={item.name} className="space-y-1">
                                <div className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest cursor-not-allowed",
                                    "text-slate-300"
                                )}>
                                    <item.icon size={16} className="shrink-0 text-slate-200" />
                                    {isOpen && (
                                        <span className="flex-1 whitespace-nowrap animate-in fade-in duration-300">
                                            {item.name}
                                        </span>
                                    )}
                                    {isOpen && <Lock size={12} className="text-slate-200 shrink-0" />}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={item.name} className="space-y-1">
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative font-bold text-xs uppercase",
                                        isActive
                                            ? "bg-slate-950 text-white shadow-lg shadow-slate-200"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                                    )}
                                >
                                    <item.icon size={16} className={cn("shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-950")} />
                                    {isOpen && (
                                        <>
                                            <span className="flex-1 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300 text-xs">
                                                {item.name}
                                            </span>
                                            {(item as any).count !== undefined && (
                                                <span className={cn(
                                                    "px-1.5 py-0.5 rounded text-[10px] font-black text-white shrink-0 shadow-sm",
                                                    (item as any).countColor || 'bg-slate-400'
                                                )}>
                                                    {(item as any).count}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            ) : (
                                <button
                                    onClick={() => toggleMenu(item.name)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative font-bold text-xs uppercase",
                                        isMenuOpen
                                            ? "text-slate-950 bg-slate-50"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                                    )}
                                >
                                    <item.icon size={16} className={cn("shrink-0", isMenuOpen ? "text-slate-950" : "text-slate-400 group-hover:text-slate-950")} />
                                    {isOpen && (
                                        <>
                                            <span className="flex-1 text-left whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300 text-xs">
                                                {item.name}
                                            </span>
                                            {item.count !== undefined ? (
                                                <span className={cn(
                                                    "px-1.5 py-0.5 rounded text-[10px] font-black text-white shrink-0 shadow-sm",
                                                    item.countColor || 'bg-slate-400'
                                                )}>
                                                    {item.count}
                                                </span>
                                            ) : (
                                                <ChevronDown size={14} className={cn("transition-transform duration-300", isMenuOpen && "rotate-180")} />
                                            )}
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Sub-menu rendering */}
                            {isOpen && hasChildren && isMenuOpen && (
                                <div className="ml-7 space-y-1 animate-in slide-in-from-top-1 duration-300 border-l border-slate-100 pl-3">
                                    {item.children?.map(child => {
                                        const childLocked = !isAdmin && (child as any).locked;
                                        if (childLocked) {
                                            return (
                                                <div
                                                    key={child.name}
                                                    className="flex items-center justify-between py-2 text-xs font-bold uppercase text-slate-300 cursor-not-allowed"
                                                >
                                                    <span>{child.name}</span>
                                                    <Lock size={10} className="mr-2 text-slate-200" />
                                                </div>
                                            );
                                        }
                                        return (
                                            <Link
                                                key={child.name}
                                                href={child.href}
                                                className={cn(
                                                    "flex items-center justify-between py-2 text-xs font-bold uppercase transition-all duration-300",
                                                    (route().current(child.href) || window.location.href.includes(child.href))
                                                        ? "text-slate-950"
                                                        : "text-slate-400 hover:text-slate-950"
                                                )}
                                            >
                                                <span>{child.name}</span>
                                                {(child as any).count !== undefined && (
                                                    <span className={cn(
                                                        "mr-2 px-1.5 py-0.5 rounded text-[10px] font-black text-white shadow-sm",
                                                        (child as any).countColor || 'bg-slate-400'
                                                    )}>
                                                        {(child as any).count}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}

                            {!isOpen && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-950 text-white text-xs font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-50 shadow-2xl">
                                    {item.name}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer Section */}
            <div className="p-3 bg-slate-50/50 space-y-1 mt-auto border-t border-slate-100">
                <Link
                    href={route('profile.edit')}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative font-bold text-xs uppercase",
                        route().current('profile.edit')
                            ? "bg-slate-100 text-slate-950"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                    )}
                >
                    <UserCircle size={16} className="shrink-0 text-slate-400 group-hover:text-slate-950" />
                    {isOpen && (
                        <span className="animate-in fade-in duration-300 text-xs">Mi Perfil</span>
                    )}
                </Link>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-700 transition-all duration-300 group relative font-bold text-xs uppercase text-left"
                >
                    <LogOut size={16} className="shrink-0 text-slate-400 group-hover:text-red-600" />
                    {isOpen && (
                        <span className="animate-in fade-in duration-300 text-xs">Salir</span>
                    )}
                </Link>
            </div>
        </aside>
    );
}
