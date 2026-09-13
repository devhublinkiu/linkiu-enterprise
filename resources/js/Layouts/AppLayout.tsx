import AppSidebar from '@/Components/AppSidebar';
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
import { usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
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
                            <button
                                type="button"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Notificaciones"
                            >
                                <Bell size={20} />
                            </button>
                            <Separator orientation="vertical" className="h-6" />
                            <div className="flex items-center gap-3">
                                <div className="hidden text-right sm:block">
                                    <p className="text-xs font-medium leading-none text-foreground">
                                        {user.name}
                                    </p>
                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                        {isAdmin
                                            ? 'Administrador CAMEP'
                                            : 'Asociado'}
                                    </p>
                                </div>
                                <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg border border-border bg-primary text-xs font-medium text-primary-foreground">
                                    {user.profile_photo_url ? (
                                        <img
                                            src={user.profile_photo_url}
                                            alt="Avatar"
                                            className="size-full object-cover"
                                        />
                                    ) : associate?.logo_url ? (
                                        <img
                                            src={associate.logo_url}
                                            alt="Logo"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
                                </div>
                            </div>
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
