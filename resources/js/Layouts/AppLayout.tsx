import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { Bell } from 'lucide-react';
import Sidebar from '@/Components/Sidebar';
import NotificationToastStack from '@/Components/NotificationToastStack';
import { useNotifications } from '@/hooks/useNotifications';
import { PageProps } from '@/types';
import { cn } from '@/lib/utils';

export default function AppLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { tenant } = usePage<PageProps>().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { notifications, dismiss } = useNotifications();

    return (
        <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
            {/* Sidebar */}
            <Sidebar
                tenant={tenant}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* Main Content Area */}
            <div className={cn(
                "transition-all duration-300 ease-in-out",
                isSidebarOpen ? 'pl-72' : 'pl-20'
            )}>
                {/* Admin Topbar */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-bold text-slate-400 capitalize truncate max-w-[200px]">
                            {tenant?.company_name || 'Panel de Gestión'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="h-8 w-px bg-slate-100" />
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 leading-none">
                                    {(usePage().props.auth.user as any).name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase">
                                    {(usePage().props.auth.user as any).is_superadmin || (usePage().props.auth.user as any).role === 'admin'
                                        ? 'Administrador CAMEP'
                                        : 'Asociado Linkiu'}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-lg overflow-hidden border border-slate-200">
                                {(usePage().props.auth.user as any).profile_photo_url ? (
                                    <img
                                        src={(usePage().props.auth.user as any).profile_photo_url}
                                        alt="Avatar"
                                        className="h-full w-full object-cover bg-white"
                                    />
                                ) : (usePage().props.auth as any).associate?.status === 'approved' && (usePage().props.auth as any).associate?.logo_url ? (
                                    <img
                                        src={(usePage().props.auth as any).associate.logo_url}
                                        alt="Logo"
                                        className="h-full w-full object-cover bg-white"
                                    />
                                ) : (
                                    (usePage().props.auth.user as any).name.charAt(0)
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 md:p-10 min-h-[calc(100vh-64px)]">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Real-time notification toasts */}
            <NotificationToastStack notifications={notifications} dismiss={dismiss} />
        </div>
    );
}
