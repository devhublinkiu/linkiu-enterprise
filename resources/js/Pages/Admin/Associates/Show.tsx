import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    CalendarDays,
    Check,
    Layers,
    ScrollText,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/Components/base/Avatar';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';
import { Progress } from '@/Components/base/Progress';
import { Tabs } from '@/Components/ui/Tabs';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';

import { TabBasicInfo } from './Parts/TabBasicInfo';
import { TabCharacterization } from './Parts/TabCharacterization';
import { TabContacts } from './Parts/TabContacts';
import { TabDocumentation } from './Parts/TabDocumentation';
import { TabOverview } from './Parts/TabOverview';
import { TabServices } from './Parts/TabServices';
import { SectionReviewData } from './Parts/section-review';
import { AdminState, ESTADO_BADGE, SECTION_KEYS } from './types';

interface AssociateContact {
    name?: string;
    position?: string;
    area?: string;
    email?: string;
    phone?: string;
}

interface AssociateReference {
    type?: string;
    name?: string;
    contact_person?: string;
    position?: string;
    email?: string;
    phone?: string;
}

interface AssociateServiceRef {
    id: number;
}

interface Associate {
    id: number;
    company_name: string;
    nit: string;
    initials: string;
    description: string;
    city: string;
    department: string;
    legal_status: string;
    rep_name: string;
    billing_email: string;
    address: string;
    company_type: string[];
    main_ciiu: string;
    secondary_ciiu: string;
    hydrocarbons_participation: boolean;
    hydrocarbons_level: string;
    private_income_pct: number;
    public_income_pct: number;
    pep_name: string;
    pep_doc_type: string;
    pep_entity: string;
    other_guilds: string;
    capacitation_plan: boolean;
    capacitation_level: string;
    capacitation_no_reason: string;
    company_classification: string;
    employees_direct_count: number;
    employees_tech: number;
    employees_prof: number;
    employees_admin: number;
    employees_exec: number;
    employees_other: number;
    employees_other_desc: string;
    pep_declaration: boolean;
    funds_origin_declaration: boolean;
    status: string;
    created_at: string;
    rep_position: string;
    constitution_date: string;
    country_origin: string;
    phone: string;
    website: string;
    contacts: AssociateContact[];
    references: AssociateReference[];
    social_instagram: string;
    social_facebook: string;
    social_linkedin: string;
    social_other: string;
    section_reviews: Record<string, SectionReviewData>;
    services: AssociateServiceRef[];
    files: Record<string, unknown> | null;
    membership_interest: string[];
    rep_doc: string;
    rep_doc_type: string;
    logo_path?: string;
    document_urls?: Record<string, string>;
}

interface DocSpec {
    key: string;
    label: string;
    icon: string;
    accepts: string[];
    legend?: string;
    template?: string;
}

interface DocumentCatalog {
    mandatory: DocSpec[];
    optional: DocSpec[];
}

interface Props {
    associate: Associate;
    documentCatalog: DocumentCatalog;
    estado: AdminState;
}

const NAV_ITEMS = [
    { value: 'overview', label: 'Resumen', icon: Layers, sectionKey: null },
    {
        value: 'basic',
        label: 'Inf. básica',
        icon: Building2,
        sectionKey: 'basicinfo',
    },
    {
        value: 'characterization',
        label: 'Caracterización',
        icon: Briefcase,
        sectionKey: 'characterization',
    },
    {
        value: 'contacts',
        label: 'Contactos',
        icon: Users,
        sectionKey: 'contacts',
    },
    {
        value: 'services',
        label: 'Servicios',
        icon: Layers,
        sectionKey: 'services',
    },
    {
        value: 'docs',
        label: 'Documentos',
        icon: ScrollText,
        sectionKey: 'documentation',
    },
] as const;

export default function Show({ associate, documentCatalog, estado }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const { post, processing } = useForm({});

    const handleAuditSection = (
        section: string,
        status: 'approved' | 'rejected',
        reason: string = '',
    ) =>
        router.post(
            route('admin.associates.audit-section', associate.id),
            {
                section,
                action: status === 'approved' ? 'approve' : 'reject',
                reason,
            },
            { preserveScroll: true },
        );

    const handleApproveAll = () =>
        post(route('admin.associates.approve', associate.id));

    const total = SECTION_KEYS.length;
    const sectionStats = SECTION_KEYS.reduce(
        (acc, sec) => {
            const s = associate.section_reviews?.[sec]?.status ?? 'draft';
            if (s === 'approved') acc.approved++;
            else if (s === 'rejected') acc.rejected++;
            else if (s === 'pending') acc.pending++;
            else acc.draft++;
            return acc;
        },
        { approved: 0, pending: 0, rejected: 0, draft: 0 },
    );
    const progressPct = Math.round((sectionStats.approved / total) * 100);
    const allApproved = sectionStats.approved === total;
    const alreadyAdmitted =
        associate.status === 'verified' || associate.status === 'approved';
    const canAdmit = allApproved && !alreadyAdmitted && !processing;

    const getSectionReview = (key: string): SectionReviewData =>
        associate.section_reviews?.[key] ?? { status: 'draft' };

    const sectionHasPending = (key: string) =>
        associate.section_reviews?.[key]?.status === 'pending';

    const badge = ESTADO_BADGE[estado];

    return (
        <AppLayout>
            <Head title={`Auditoría: ${associate.company_name}`} />

            <div className="mx-auto max-w-[1400px]">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                        {/* ── SIDEBAR ── */}
                        <aside className="space-y-4 lg:sticky lg:top-6 lg:w-64 lg:shrink-0 lg:self-start">
                            <Card>
                                <CardContent className="space-y-4 p-4">
                                    <Link
                                        href={route('admin.associates.index')}
                                        className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <ArrowLeft className="size-3.5" />{' '}
                                        Volver al listado
                                    </Link>

                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-11 rounded-lg">
                                            {associate.document_urls?.logo && (
                                                <AvatarImage
                                                    src={
                                                        associate.document_urls
                                                            .logo
                                                    }
                                                    alt={associate.company_name}
                                                />
                                            )}
                                            <AvatarFallback className="rounded-lg">
                                                <Building2 className="size-5 text-muted-foreground" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="line-clamp-2 text-sm font-medium leading-tight">
                                                {associate.company_name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                NIT {associate.nit}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <Badge variant={badge.variant}>
                                            {badge.label}
                                        </Badge>
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <CalendarDays className="size-3" />
                                            {new Date(
                                                associate.created_at,
                                            ).toLocaleDateString('es-CO')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="space-y-3 p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Secciones aprobadas
                                        </span>
                                        <span className="font-medium">
                                            {sectionStats.approved}/{total}
                                        </span>
                                    </div>
                                    <Progress value={progressPct} />
                                    <div className="flex gap-3 text-xs text-muted-foreground">
                                        <span>
                                            {sectionStats.pending} pend.
                                        </span>
                                        <span>
                                            {sectionStats.rejected} obs.
                                        </span>
                                        <span>{sectionStats.draft} borr.</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <nav className="space-y-1">
                                {NAV_ITEMS.map((item) => {
                                    const isActive = activeTab === item.value;
                                    const pend = item.sectionKey
                                        ? sectionHasPending(item.sectionKey)
                                        : false;
                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() =>
                                                setActiveTab(item.value)
                                            }
                                            className={cn(
                                                'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                <item.icon className="size-4" />
                                                {item.label}
                                            </span>
                                            {pend && (
                                                <span
                                                    className={cn(
                                                        'size-1.5 rounded-full',
                                                        isActive
                                                            ? 'bg-primary-foreground'
                                                            : 'bg-muted-foreground',
                                                    )}
                                                    aria-label="Pendiente de revisión"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>

                            <div className="space-y-2">
                                <Button
                                    className="w-full"
                                    onClick={handleApproveAll}
                                    disabled={!canAdmit}
                                >
                                    <Check className="size-4" /> Admitir socio
                                </Button>
                                {!alreadyAdmitted && !allApproved && (
                                    <p className="text-xs text-muted-foreground">
                                        Faltan {total - sectionStats.approved}{' '}
                                        secciones por aprobar para poder
                                        admitir.
                                    </p>
                                )}
                            </div>
                        </aside>

                        {/* ── CONTENT ── */}
                        <div className="min-w-0 flex-1">
                            <TabOverview
                                estado={estado}
                                sectionStats={sectionStats}
                                total={total}
                                progressPct={progressPct}
                                canAdmit={canAdmit}
                                allApproved={allApproved}
                                alreadyAdmitted={alreadyAdmitted}
                                handleApproveAll={handleApproveAll}
                            />
                            <TabBasicInfo
                                associate={associate}
                                sectionReview={getSectionReview('basicinfo')}
                                onAuditSection={handleAuditSection}
                            />
                            <TabCharacterization
                                associate={associate}
                                sectionReview={getSectionReview(
                                    'characterization',
                                )}
                                onAuditSection={handleAuditSection}
                            />
                            <TabContacts
                                associate={associate}
                                sectionReview={getSectionReview('contacts')}
                                onAuditSection={handleAuditSection}
                            />
                            <TabServices
                                associate={associate}
                                sectionReview={getSectionReview('services')}
                                onAuditSection={handleAuditSection}
                            />
                            <TabDocumentation
                                associate={associate}
                                sectionReview={getSectionReview(
                                    'documentation',
                                )}
                                onAuditSection={handleAuditSection}
                                documentCatalog={documentCatalog}
                            />
                        </div>
                    </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
