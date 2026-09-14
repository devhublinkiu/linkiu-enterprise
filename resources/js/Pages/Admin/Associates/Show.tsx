import { Button } from '@/Components/ui/Button';
import { Tabs } from '@/Components/ui/Tabs';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    CalendarDays,
    Camera,
    Check,
    Globe,
    Layers,
    ScrollText,
    Users,
} from 'lucide-react';
import { useState } from 'react';

// Parts
import { SectionReviewData } from './Parts/SectionAuditPanel';
import { TabBasicInfo } from './Parts/TabBasicInfo';
import { TabCharacterization } from './Parts/TabCharacterization';
import { TabContacts } from './Parts/TabContacts';
import { TabDocumentation } from './Parts/TabDocumentation';
import { TabGallery } from './Parts/TabGallery';
import { TabOverview } from './Parts/TabOverview';
import { TabServices } from './Parts/TabServices';

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

// Solo se lee `id` de los servicios del asociado (para precargar el formulario).
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
    status: 'draft' | 'pending' | 'verified' | 'approved' | 'rejected';
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
    gallery_urls?: Array<{ path: string; url: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    draft: { label: 'Borrador', className: 'bg-slate-100 text-slate-600' },
    pending: { label: 'En Revisión', className: 'bg-amber-100 text-amber-700' },
    verified: { label: 'Admitido', className: 'bg-blue-100 text-blue-700' },
    approved: { label: 'Activo', className: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Rechazado', className: 'bg-red-100 text-red-700' },
};

const REVIEWABLE_SECTIONS = [
    'basicinfo',
    'characterization',
    'contacts',
    'documentation',
    'services',
] as const;

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

export default function Show({
    associate,
    documentCatalog,
}: {
    associate: Associate;
    documentCatalog: DocumentCatalog;
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const { post, processing } = useForm({});

    // ── Section audit handler ─────────────────────────────────────────────────
    const handleAuditSection = (
        section: string,
        status: 'approved' | 'rejected',
        reason: string = '',
    ) => {
        router.post(
            route('admin.associates.audit-section', associate.id),
            {
                section,
                action: status === 'approved' ? 'approve' : 'reject',
                reason,
            },
            { preserveScroll: true },
        );
    };

    const handleApproveAll = () =>
        post(route('admin.associates.approve', associate.id));

    // ── Section-level progress ────────────────────────────────────────────────
    const sectionStats = REVIEWABLE_SECTIONS.reduce(
        (acc, sec) => {
            const s = associate.section_reviews?.[sec]?.status || 'draft';
            if (s === 'approved') acc.approved++;
            else if (s === 'rejected') acc.rejected++;
            else if (s === 'pending') acc.pending++;
            else acc.draft++;
            return acc;
        },
        { approved: 0, rejected: 0, pending: 0, draft: 0 },
    );

    const progressPct = Math.round(
        (sectionStats.approved / REVIEWABLE_SECTIONS.length) * 100,
    );

    const getSectionReview = (key: string): SectionReviewData =>
        associate.section_reviews?.[key] ?? { status: 'draft' };

    const sectionHasPending = (key: string) => {
        const s = associate.section_reviews?.[key]?.status;
        return s === 'pending';
    };

    // ── Sidebar nav ───────────────────────────────────────────────────────────
    const navItems = [
        { value: 'overview', label: 'Resumen', icon: Layers, sectionKey: null },
        {
            value: 'basic',
            label: 'Inf. Básica',
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
            icon: Globe,
            sectionKey: 'services',
        },
        {
            value: 'docs',
            label: 'Documentos',
            icon: ScrollText,
            sectionKey: 'documentation',
        },
        { value: 'gallery', label: 'Galería', icon: Camera, sectionKey: null },
    ];

    const statusCfg = STATUS_CONFIG[associate.status] ?? STATUS_CONFIG.pending;
    const canAdmit =
        !processing &&
        associate.status !== 'approved' &&
        associate.status !== 'verified';

    return (
        <AppLayout>
            <Head title={`Auditoría: ${associate.company_name}`} />

            <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex items-start gap-6">
                        {/* ── SIDEBAR ──────────────────────────────────────── */}
                        <aside className="sticky top-6 w-60 shrink-0 space-y-3 self-start">
                            {/* Company card */}
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-4 pb-3 pt-4">
                                    <Link
                                        href={route('admin.associates.index')}
                                        className="flex w-fit items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 transition-colors hover:text-slate-900"
                                    >
                                        <ArrowLeft size={12} /> Volver al
                                        listado
                                    </Link>
                                </div>

                                <div className="space-y-3 p-4">
                                    <div className="flex items-center gap-3">
                                        {associate.document_urls?.logo ? (
                                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                                <img
                                                    src={
                                                        associate.document_urls
                                                            .logo
                                                    }
                                                    alt="Logo"
                                                    className="h-full w-full object-contain p-1"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                                <Building2
                                                    size={20}
                                                    className="text-slate-300"
                                                />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="line-clamp-2 text-sm font-black leading-tight text-slate-900">
                                                {associate.company_name}
                                            </p>
                                            <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                                                NIT {associate.nit}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <span
                                            className={cn(
                                                'rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest',
                                                statusCfg.className,
                                            )}
                                        >
                                            {statusCfg.label}
                                        </span>
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                            <CalendarDays size={10} />
                                            {new Date(
                                                associate.created_at,
                                            ).toLocaleDateString('es-CO')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress card */}
                            <div className="space-y-3 rounded-2xl bg-slate-900 p-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    Secciones
                                </p>
                                <div className="grid grid-cols-3 gap-1 text-center">
                                    <div className="rounded-xl bg-white/5 py-2">
                                        <p className="text-base font-black text-emerald-400">
                                            {sectionStats.approved}
                                        </p>
                                        <p className="mt-0.5 text-[8px] font-bold uppercase text-slate-500">
                                            Ok
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-white/5 py-2">
                                        <p className="text-base font-black text-amber-400">
                                            {sectionStats.pending}
                                        </p>
                                        <p className="mt-0.5 text-[8px] font-bold uppercase text-slate-500">
                                            Pend.
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-white/5 py-2">
                                        <p className="text-base font-black text-red-400">
                                            {sectionStats.rejected}
                                        </p>
                                        <p className="mt-0.5 text-[8px] font-bold uppercase text-slate-500">
                                            Obs.
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1 flex justify-between">
                                        <span className="text-[9px] font-bold uppercase text-slate-500">
                                            Aprobadas
                                        </span>
                                        <span className="text-[9px] font-black text-emerald-400">
                                            {progressPct}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="space-y-0.5 rounded-2xl border border-slate-200 bg-white p-2">
                                {navItems.map((item) => {
                                    const hasPending = item.sectionKey
                                        ? sectionHasPending(item.sectionKey)
                                        : false;
                                    const isActive = activeTab === item.value;
                                    return (
                                        <button
                                            key={item.value}
                                            onClick={() =>
                                                setActiveTab(item.value)
                                            }
                                            className={cn(
                                                'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition-all',
                                                isActive
                                                    ? 'bg-slate-900 text-white shadow-sm'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                                            )}
                                        >
                                            <span className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-wide">
                                                <item.icon size={13} />
                                                {item.label}
                                            </span>
                                            {hasPending && (
                                                <span
                                                    className={cn(
                                                        'min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[9px] font-black',
                                                        isActive
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-amber-100 text-amber-700',
                                                    )}
                                                >
                                                    !
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Admit button */}
                            <Button
                                className="h-11 w-full rounded-xl bg-emerald-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={handleApproveAll}
                                disabled={!canAdmit}
                            >
                                <Check size={14} className="mr-2" />
                                Admitir Socio en CAMEP
                            </Button>
                        </aside>

                        {/* ── CONTENT ──────────────────────────────────────── */}
                        <div className="min-w-0 flex-1">
                            <TabOverview
                                associate={associate}
                                sectionStats={sectionStats}
                                handleApproveAll={handleApproveAll}
                                processing={processing}
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
                            <TabGallery associate={associate} />
                        </div>
                    </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
