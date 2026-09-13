import AppSidebar from '@/Components/AppSidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/base/Avatar';
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
import { Bell, LogOut, UserCircle } from 'lucide-react';
import { PropsWithChildren, ReactNode } from 'react';

type LayoutAuth = {
    user: {
        name: string;
        is_superadmin?: boolean;
        role?: string;
        profile_photo_url?: string | null;
    };
    associate?: { logo_url?: string | null } | null;
};

export default function AppLayout({
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage<PageProps>().props;
    const tenant = page.tenant;
    const auth = page.auth as unknown as LayoutAuth;
    const user = auth.user;
    const associate = auth.associate;
    const { notifications, dismiss } = useNotifications();

    const isAdmin = user.is_superadmin || user.role === 'admin';

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
                            <h2 className="max-w-[200px] truncate text-sm font-medium text-muted-foreground">
                                {tenant?.company_name || 'Panel de Gestión'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">
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
