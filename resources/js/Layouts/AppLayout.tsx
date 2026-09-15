import AppSidebar from '@/Components/AppSidebar';
import { matchBreadcrumbs } from '@/Components/AppSidebar/parts/breadcrumbs';
import {
    buildAdminItems,
    buildAssociateItems,
} from '@/Components/AppSidebar/parts/nav-items';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/base/Avatar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/Components/base/Breadcrumb';
import { Button } from '@/Components/base/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/base/DropdownMenu';
import { Separator } from '@/Components/base/Separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/Components/base/Sidebar';
import { TooltipProvider } from '@/Components/base/Tooltip';
import NotificationToastStack from '@/Components/NotificationToastStack';
import { useNotifications } from '@/hooks/useNotifications';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, Globe, LogOut, UserCircle } from 'lucide-react';
import { Fragment, PropsWithChildren, ReactNode } from 'react';

type LayoutAuth = {
    user: {
        name: string;
        is_superadmin?: boolean;
        role?: string;
        profile_photo_url?: string | null;
    };
    associate?: {
        logo_url?: string | null;
        microsite_url?: string | null;
        microsite_published?: boolean;
    } | null;
};

export default function AppLayout({
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage<PageProps>();
    const url = page.url;
    const auth = page.props.auth as unknown as LayoutAuth;
    const user = auth.user;
    const associate = auth.associate;
    const { notifications, dismiss } = useNotifications();

    const isAdmin = user.is_superadmin || user.role === 'admin';

    // Migas: "Inicio" + el tramo de sección derivado de la navegación del sidebar.
    const navItems = isAdmin
        ? buildAdminItems({ approved: 0, pending: 0, inactive: 0 }, 0)
        : buildAssociateItems({
              isCompanyLocked: false,
              isGeneralLocked: false,
              isBillingLocked: false,
              unreadInvoices: 0,
          });
    const homeHref = route('dashboard');
    const crumbs = [
        { label: 'Inicio', href: homeHref },
        ...matchBreadcrumbs(url, navItems, homeHref),
    ];

    return (
        <TooltipProvider delayDuration={0}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    {/* Topbar */}
                    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
                        <div className="flex min-w-0 items-center gap-2">
                            <SidebarTrigger />
                            <Separator orientation="vertical" className="h-6" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {crumbs.map((c, i) => {
                                        const isLast = i === crumbs.length - 1;
                                        return (
                                            <Fragment key={i}>
                                                <BreadcrumbItem>
                                                    {isLast ? (
                                                        <BreadcrumbPage>
                                                            {c.label}
                                                        </BreadcrumbPage>
                                                    ) : c.href ? (
                                                        <BreadcrumbLink asChild>
                                                            <Link href={c.href}>
                                                                {c.label}
                                                            </Link>
                                                        </BreadcrumbLink>
                                                    ) : (
                                                        <span>{c.label}</span>
                                                    )}
                                                </BreadcrumbItem>
                                                {!isLast && (
                                                    <BreadcrumbSeparator />
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>

                        <div className="flex items-center gap-3">
                            {!isAdmin && associate?.microsite_url && (
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:inline-flex"
                                >
                                    <a
                                        href={associate.microsite_url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Globe />
                                        Ver mi página
                                        {associate.microsite_published ===
                                            false && (
                                            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                borrador
                                            </span>
                                        )}
                                    </a>
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Notificaciones"
                                className="text-muted-foreground"
                            >
                                <Bell />
                            </Button>
                            <Separator orientation="vertical" className="h-6" />

                            {/* Menú de usuario: Mi perfil / Salir (antes en el footer del sidebar) */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center gap-3 rounded-lg px-1 py-1 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                                    >
                                        <span className="hidden text-right sm:block">
                                            <span className="block text-xs font-medium leading-none text-foreground">
                                                {user.name}
                                            </span>
                                            <span className="mt-1 block text-[10px] text-muted-foreground">
                                                {isAdmin
                                                    ? 'Administrador CAMEP'
                                                    : 'Asociado'}
                                            </span>
                                        </span>
                                        <Avatar>
                                            <AvatarImage
                                                src={
                                                    user.profile_photo_url ||
                                                    associate?.logo_url ||
                                                    undefined
                                                }
                                                alt={user.name}
                                            />
                                            <AvatarFallback>
                                                {user.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium text-foreground">
                                            {user.name}
                                        </span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {isAdmin
                                                ? 'Administrador CAMEP'
                                                : 'Asociado'}
                                        </span>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('profile.edit')}>
                                            <UserCircle />
                                            Mi perfil
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        asChild
                                        variant="destructive"
                                    >
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="w-full"
                                        >
                                            <LogOut />
                                            Salir
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* Contenido */}
                    <div className="min-h-[calc(100svh-4rem)] p-6 md:p-10">
                        <div className="mx-auto max-w-7xl">{children}</div>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            {/* Notificaciones en tiempo real */}
            <NotificationToastStack
                notifications={notifications}
                dismiss={dismiss}
            />
        </TooltipProvider>
    );
}
