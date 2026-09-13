import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarRail,
} from '@/Components/base/Sidebar';
import { usePage } from '@inertiajs/react';

import { buildAdminItems, buildAssociateItems } from './parts/nav-items';
import { NavMenu } from './parts/nav-menu';
import {
    NoPlanNotice,
    PlanWidget,
    type Subscription,
} from './parts/plan-widget';

type SidebarProps = {
    auth: {
        user: { name: string; is_superadmin?: boolean; role?: string };
        associate?: { status?: string; is_public?: boolean } | null;
    };
    associate_counts?: { approved: number; pending: number; inactive: number };
    subscription?: Subscription | null;
    pending_payment_requests?: number;
    unread_invoices?: number;
};

// Navegación del panel (admin y asociado) sobre base/Sidebar. Reemplaza al viejo
// Components/Sidebar.tsx. La lógica de rol/bloqueos/plan es la misma; la compuerta real
// vive en el servidor (ADR-0002). Ver plan 0005 (corte 5D).
export default function AppSidebar() {
    const props = usePage().props as unknown as SidebarProps;
    const auth = props.auth;

    const isAdmin = auth.user.is_superadmin || auth.user.role === 'admin';

    const counts = props.associate_counts || {
        approved: 0,
        pending: 0,
        inactive: 0,
    };
    const pendingPayments: number = props.pending_payment_requests ?? 0;
    const unreadInvoices: number = props.unread_invoices ?? 0;
    const sub: Subscription | null = props.subscription ?? null;
    const associate = auth.associate;

    // Bloqueos derivados del estado de suscripción (solo asociados).
    const hasActiveSubscription =
        sub && (sub.status === 'active' || sub.status === 'grace');
    const isAssociateVerified = associate?.status === 'verified';
    const isGeneralLocked = !isAdmin && !hasActiveSubscription;
    const isCompanyLocked = !isAdmin && sub?.status === 'expired';
    const isBillingLocked = !isAdmin && !isAssociateVerified && !sub;
    const needsProfileCompletion = !!(
        !isAdmin &&
        sub &&
        sub.status !== 'none' &&
        associate &&
        !associate.is_public
    );
    const hasNoPlan = !isAdmin && (!sub || sub.status === 'none');

    const items = isAdmin
        ? buildAdminItems(counts, pendingPayments)
        : buildAssociateItems({
              isCompanyLocked,
              isGeneralLocked,
              isBillingLocked,
              unreadInvoices,
          });

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex h-16 items-center px-2">
                    <img
                        src="/images/camep/logo_camep_horizontal_sidebar.svg"
                        alt="CAMEP"
                        className="h-14 w-auto max-w-full object-contain object-left group-data-[collapsible=icon]:h-8"
                    />
                </div>
                {!isAdmin && (
                    <PlanWidget
                        sub={sub}
                        needsProfileCompletion={needsProfileCompletion}
                    />
                )}
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <NavMenu items={items} />
                    </SidebarGroupContent>
                </SidebarGroup>
                {!isAdmin && <NoPlanNotice hasNoPlan={hasNoPlan} />}
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
}
