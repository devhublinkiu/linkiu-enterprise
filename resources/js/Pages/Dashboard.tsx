import { Head, useForm, usePage } from '@inertiajs/react';
import { Building2, Globe } from 'lucide-react';

import { Button } from '@/Components/base/Button';
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
    microsite_published?: boolean;
    microsite_url?: string | null;
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

    // Publicar el micrositio de un clic desde el aviso (hook antes de cualquier return).
    const publishForm = useForm({});
    const publish = () =>
        publishForm.post(
            route('associate.company.microsite.published.toggle'),
            {
                preserveScroll: true,
            },
        );

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

    // Perfil ya público pero micrositio en borrador → nadie lo ve. Aviso accionable.
    const micrositeInDraft =
        !!associate?.is_public && !associate?.microsite_published;

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

                {micrositeInDraft && (
                    <div className="flex flex-col gap-3 rounded-xl border border-accent-strong/30 bg-accent-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                                <Globe className="size-4" />
                            </span>
                            <div>
                                <p className="font-medium">
                                    Tu página pública está en borrador
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Publícala para aparecer en el directorio y
                                    que tus clientes te encuentren.
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {associate?.microsite_url && (
                                <Button asChild variant="outline" size="sm">
                                    <a
                                        href={associate.microsite_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Ver primero
                                    </a>
                                </Button>
                            )}
                            <Button
                                size="sm"
                                onClick={publish}
                                disabled={publishForm.processing}
                            >
                                {publishForm.processing
                                    ? 'Publicando…'
                                    : 'Publicar ahora'}
                            </Button>
                        </div>
                    </div>
                )}

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
