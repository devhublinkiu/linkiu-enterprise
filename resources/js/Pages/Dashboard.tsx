import { Head, usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';

import AppLayout from '@/Layouts/AppLayout';
import { InvoicesCard } from '@/Pages/Dashboard/Parts/InvoicesCard';
import {
    MembershipCard,
    type Subscription,
} from '@/Pages/Dashboard/Parts/MembershipCard';
import { ProfileCard } from '@/Pages/Dashboard/Parts/ProfileCard';
import { QuickAccessCard } from '@/Pages/Dashboard/Parts/QuickAccessCard';
import { PageProps } from '@/types';

type Associate = {
    logo_url?: string | null;
    is_public?: boolean;
    company_name?: string;
};

export default function Dashboard() {
    const page = usePage<
        PageProps & {
            auth: { associate?: Associate | null };
            associateProfile: {
                company_name?: string;
                section_reviews?: Record<string, { status: string }>;
            } | null;
            subscription?: Subscription | null;
            unread_invoices?: number | null;
        }
    >().props;

    const { auth, associateProfile } = page;
    const isAdmin = auth.user?.is_superadmin || auth.user?.role === 'admin';
    const associate = auth.associate ?? null;

    // Vista de administrador (mínima; el panel admin real vive en sus módulos).
    if (isAdmin || !associateProfile) {
        return (
            <AppLayout>
                <Head title="Dashboard" />
                <div className="mx-auto max-w-5xl space-y-6">
                    <div>
                        <h1 className="font-display text-h3">Panel</h1>
                        <p className="text-sm text-muted-foreground">
                            Bienvenido, {auth.user?.name}.
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const sectionReviews = associateProfile.section_reviews || {};
    const companyName =
        associateProfile.company_name ||
        associate?.company_name ||
        'tu empresa';
    const sub = page.subscription ?? null;
    const unread = page.unread_invoices ?? 0;

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                        {associate?.logo_url ? (
                            <img
                                src={associate.logo_url}
                                alt={companyName}
                                className="size-full object-contain"
                            />
                        ) : (
                            <Building2 className="size-6 text-muted-foreground/50" />
                        )}
                    </div>
                    <div>
                        <h1 className="font-display text-h3">
                            Hola, {companyName}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Este es el resumen de tu cuenta en CAMEP.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <MembershipCard sub={sub} />
                    <ProfileCard
                        sectionReviews={sectionReviews}
                        isPublic={!!associate?.is_public}
                    />
                    <QuickAccessCard />
                    <InvoicesCard unread={unread} />
                </div>
            </div>
        </AppLayout>
    );
}
