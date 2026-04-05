import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import {
    Check,
    Building2,
    Briefcase,
    Globe,
    Users,
    Layers,
    ArrowLeft,
    ScrollText,
    Camera,
    CalendarDays,
} from 'lucide-react';
import { Tabs } from '@/Components/ui/Tabs';
import { cn } from '@/lib/utils';

// Parts
import { TabOverview } from './Parts/TabOverview';
import { TabBasicInfo } from './Parts/TabBasicInfo';
import { TabCharacterization } from './Parts/TabCharacterization';
import { TabContacts } from './Parts/TabContacts';
import { TabServices } from './Parts/TabServices';
import { TabDocumentation } from './Parts/TabDocumentation';
import { TabGallery } from './Parts/TabGallery';

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
    contacts: any[];
    references: any[];
    social_instagram: string;
    social_facebook: string;
    social_linkedin: string;
    social_other: string;
    audit_log: Record<string, {
        status: 'approved' | 'rejected' | 'pending' | 'editable' | 'draft' | 'change_requested' | 'verified',
        reason?: string,
        change_request?: { reason: string; requested_at: string; requested_by: string }
    }>;
    services: any[];
    files: any;
    membership_interest: string[];
    rep_doc: string;
    rep_doc_type: string;
    logo_path?: string;
    document_urls?: Record<string, string>;
    gallery_urls?: Array<{ path: string; url: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    draft:    { label: 'Borrador',   className: 'bg-slate-100 text-slate-600' },
    pending:  { label: 'En Revisión', className: 'bg-amber-100 text-amber-700' },
    verified: { label: 'Admitido',   className: 'bg-blue-100 text-blue-700' },
    approved: { label: 'Activo',     className: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Rechazado',  className: 'bg-red-100 text-red-700' },
};

export default function Show({ associate, availableServices }: { associate: Associate; availableServices: any[] }) {
    const [activeTab, setActiveTab] = useState('overview');
    const { data, setData, put, post, processing } = useForm({
        description: associate.description || '',
        service_ids: associate.services?.map(s => s.id) || []
    });
    const [auditState, setAuditState] = useState(associate.audit_log || {});
    const [isEditingServices, setIsEditingServices] = useState(false);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleAudit = (field: string, status: 'approved' | 'rejected' | 'reset', reason: string = '') => {
        router.post(route('admin.associates.audit', associate.id),
            { field, status, reason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAuditState(prev => {
                        const next = { ...prev };
                        if (status === 'reset') delete next[field];
                        else next[field] = { status: status as any, reason };
                        return next;
                    });
                }
            }
        );
    };

    const handleApproveAll = () => post(route('admin.associates.approve', associate.id));

    const getFieldStatus = (field: string) => {
        const status = auditState[field]?.status || 'pending';
        return status === 'editable' ? 'pending' : status;
    };

    const getChangeRequest = (field: string) => auditState[field]?.change_request || null;

    const handleUpdate = () => put(route('admin.associates.update', associate.id), { preserveScroll: true });

    const toggleService = (id: number) => {
        const current = [...data.service_ids];
        const index = current.indexOf(id);
        if (index > -1) current.splice(index, 1);
        else current.push(id);
        setData('service_ids', current);
    };

    const getPendingCount = (fields: string[]) => fields.filter(f => auditState[f]?.status === 'pending').length;

    // ── Field groups ──────────────────────────────────────────────────────────
    const basicFields = [
        'company_name', 'nit', 'initials', 'legal_status', 'constitution_date',
        'country_origin', 'phone', 'website', 'department', 'city', 'address',
        'rep_name', 'rep_doc_type', 'rep_doc', 'rep_position'
    ];
    const charFields = [
        'employees_direct_count', 'employees_tech', 'employees_prof', 'employees_admin',
        'employees_exec', 'employees_other', 'employees_other_desc', 'company_classification',
        'hydrocarbons_participation', 'hydrocarbons_level', 'private_income_pct', 'public_income_pct',
        'pep_declaration', 'pep_name', 'pep_doc_type', 'pep_entity', 'capacitation_plan',
        'capacitation_level', 'capacitation_no_reason', 'other_guilds'
    ];
    const contactFields = [
        'contacts', 'references', 'billing_email', 'social_instagram', 'social_facebook',
        'social_linkedin', 'social_other', 'main_ciiu', 'secondary_ciiu', 'company_type'
    ];
    const serviceFields = ['description', 'service_ids'];
    const docNames = [
        'Carta Solicitud Afiliación', 'Logo HD (JPG/PNG)', 'Brochure/Portafolio', 'RUT',
        'Cámara y Comercio / Registro Mercantil', 'Estados financieros con notas',
        'Fotocopia de la cédula del representante legal', 'Antecedentes del contador público (Balance anterior)',
        'Composición Accionaria', 'Certificación Parafiscales', 'Declaración de aceptación del PTEEI',
        'Compromiso de autoregulacion', 'Transferencia de datos', 'Acuerdo de Afiliación',
        'Participación Accionaria', 'Certificado tamaño empresas', 'Carta de residencia del Representante Legal',
        'Última planilla de seguridad social', 'Certificaciones de calidad'
    ];
    const docFields = [...docNames.map(n => `files.${n}`), 'funds_origin_declaration', 'membership_interest'];
    const galleryFields = ['gallery_paths'];

    // ── Progress stats ────────────────────────────────────────────────────────
    const totalFields   = basicFields.length + charFields.length + contactFields.length + serviceFields.length + docFields.length;
    const approvedCount = Object.values(auditState).filter((v: any) => v.status === 'approved').length;
    const rejectedCount = Object.values(auditState).filter((v: any) => v.status === 'rejected').length;
    const pendingLeft   = totalFields - approvedCount - rejectedCount;
    const progressPct   = Math.min(100, Math.round((approvedCount / totalFields) * 100));

    // ── Sidebar nav definition ────────────────────────────────────────────────
    const navItems = [
        { value: 'overview',        label: 'Resumen',         icon: Layers,     fields: [] },
        { value: 'basic',           label: 'Inf. Básica',     icon: Building2,  fields: basicFields },
        { value: 'characterization',label: 'Caracterización', icon: Briefcase,  fields: charFields },
        { value: 'contacts',        label: 'Contactos',       icon: Users,      fields: contactFields },
        { value: 'services',        label: 'Servicios',       icon: Globe,      fields: serviceFields },
        { value: 'docs',            label: 'Documentos',      icon: ScrollText, fields: docFields },
        { value: 'gallery',         label: 'Galería',         icon: Camera,     fields: galleryFields },
    ];

    const statusCfg = STATUS_CONFIG[associate.status] ?? STATUS_CONFIG.pending;
    const canAdmit  = !processing && associate.status !== 'approved' && associate.status !== 'verified';

    return (
        <AppLayout>
            <Head title={`Auditoría: ${associate.company_name}`} />

            <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex gap-6 items-start">

                        {/* ── SIDEBAR ──────────────────────────────────────── */}
                        <aside className="w-60 shrink-0 sticky top-6 self-start space-y-3">

                            {/* Company card */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                {/* Back link */}
                                <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                                    <Link
                                        href={route('admin.associates.index')}
                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors w-fit"
                                    >
                                        <ArrowLeft size={12} /> Volver al listado
                                    </Link>
                                </div>

                                <div className="p-4 space-y-3">
                                    {/* Logo + name */}
                                    <div className="flex items-center gap-3">
                                        {associate.document_urls?.logo ? (
                                            <div className="h-11 w-11 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0 shadow-sm">
                                                <img src={associate.document_urls.logo} alt="Logo" className="h-full w-full object-contain p-1" />
                                            </div>
                                        ) : (
                                            <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                                <Building2 size={20} className="text-slate-300" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 leading-tight line-clamp-2">{associate.company_name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">NIT {associate.nit}</p>
                                        </div>
                                    </div>

                                    {/* Status + date */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full", statusCfg.className)}>
                                            {statusCfg.label}
                                        </span>
                                        <span className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                                            <CalendarDays size={10} />
                                            {new Date(associate.created_at).toLocaleDateString('es-CO')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress card */}
                            <div className="bg-slate-900 rounded-2xl p-4 space-y-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Auditoría</p>
                                <div className="grid grid-cols-3 gap-1 text-center">
                                    <div className="bg-white/5 rounded-xl py-2">
                                        <p className="text-base font-black text-emerald-400">{approvedCount}</p>
                                        <p className="text-[8px] font-bold uppercase text-slate-500 mt-0.5">Ok</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl py-2">
                                        <p className="text-base font-black text-amber-400">{pendingLeft}</p>
                                        <p className="text-[8px] font-bold uppercase text-slate-500 mt-0.5">Pend.</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl py-2">
                                        <p className="text-base font-black text-red-400">{rejectedCount}</p>
                                        <p className="text-[8px] font-bold uppercase text-slate-500 mt-0.5">Obs.</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase">Completitud</span>
                                        <span className="text-[9px] text-emerald-400 font-black">{progressPct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="bg-white rounded-2xl border border-slate-200 p-2 space-y-0.5">
                                {navItems.map(item => {
                                    const pending   = item.fields.length > 0 ? getPendingCount(item.fields) : 0;
                                    const isActive  = activeTab === item.value;
                                    return (
                                        <button
                                            key={item.value}
                                            onClick={() => setActiveTab(item.value)}
                                            className={cn(
                                                "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-all",
                                                isActive
                                                    ? "bg-slate-900 text-white shadow-sm"
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <span className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-wide">
                                                <item.icon size={13} />
                                                {item.label}
                                            </span>
                                            {pending > 0 && (
                                                <span className={cn(
                                                    "text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                                                    isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {pending}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Admit button */}
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] h-11 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleApproveAll}
                                disabled={!canAdmit}
                            >
                                <Check size={14} className="mr-2" />
                                Admitir Socio en CAMEP
                            </Button>
                        </aside>

                        {/* ── CONTENT ──────────────────────────────────────── */}
                        <div className="flex-1 min-w-0">
                            <TabOverview
                                associate={associate}
                                auditState={auditState}
                                fieldGroups={{ basicFields, charFields, contactFields, serviceFields, docFields }}
                                handleApproveAll={handleApproveAll}
                                processing={processing}
                            />
                            <TabBasicInfo
                                associate={associate}
                                auditState={auditState}
                                getFieldStatus={getFieldStatus}
                                getChangeRequest={getChangeRequest}
                                handleAudit={handleAudit as any}
                            />
                            <TabCharacterization
                                associate={associate}
                                auditState={auditState}
                                getFieldStatus={getFieldStatus}
                                getChangeRequest={getChangeRequest}
                                handleAudit={handleAudit as any}
                            />
                            <TabContacts
                                associate={associate}
                                auditState={auditState}
                                getFieldStatus={getFieldStatus}
                                getChangeRequest={getChangeRequest}
                                handleAudit={handleAudit as any}
                            />
                            <TabServices
                                associate={associate}
                                auditState={auditState}
                                getFieldStatus={getFieldStatus}
                                getChangeRequest={getChangeRequest}
                                handleAudit={handleAudit as any}
                                isEditingServices={isEditingServices}
                                setIsEditingServices={setIsEditingServices}
                                data={data}
                                setData={setData}
                                availableServices={availableServices}
                                toggleService={toggleService}
                                handleUpdate={handleUpdate}
                                processing={processing}
                            />
                            <TabDocumentation
                                associate={associate}
                                auditState={auditState}
                                getFieldStatus={getFieldStatus}
                                getChangeRequest={getChangeRequest}
                                handleAudit={handleAudit as any}
                                docNames={docNames}
                            />
                            <TabGallery
                                associate={associate}
                                auditState={auditState}
                                handleAudit={handleAudit as any}
                            />
                        </div>

                    </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
