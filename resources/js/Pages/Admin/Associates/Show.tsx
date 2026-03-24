import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { 
    Check, 
    X, 
    Eye, 
    MessageSquare, 
    Building2, 
    FileText, 
    Clock,
    User,
    ShieldAlert,
    Download,
    ArrowLeft,
    Layers,
    Briefcase,
    Globe,
    Users,
    Network,
    Pencil,
    Save,
    AlertTriangle,
    Phone,
    CheckCircle2
} from 'lucide-react';
import { SearchableSelect } from '@/Components/ui/SearchableSelect';
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from '@/Components/ui/Tabs';
import { cn } from '@/lib/utils';

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
    status: 'pending' | 'verified' | 'approved' | 'rejected';
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
    audit_log: Record<string, { status: 'approved' | 'rejected', reason?: string }>;
    services: any[];
    files: any;
    membership_interest: string[];
    rep_doc: string;
    document_urls?: Record<string, string>;
    gallery_urls?: Array<{ path: string, url: string }>;
}

export default function Show({ associate, availableServices }: { associate: Associate, availableServices: any[] }) {
    const { data, setData, put, post, processing } = useForm({
        description: associate.description || '',
        service_ids: associate.services?.map(s => s.id) || []
    });
    const [auditState, setAuditState] = useState(associate.audit_log || {});
    const [isEditingServices, setIsEditingServices] = useState(false);

    const handleAudit = (field: string, status: 'approved' | 'rejected', reason: string = '') => {
        router.post(route('admin.associates.audit', associate.id), 
            { field, status, reason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAuditState({
                        ...auditState,
                        [field]: { status, reason }
                    });
                }
            }
        );
    };

    const handleApproveAll = () => {
        post(route('admin.associates.approve', associate.id));
    };

    const getFieldStatus = (field: string) => auditState[field]?.status || 'pending';

    const handleUpdate = () => {
        put(route('admin.associates.update', associate.id), {
            preserveScroll: true
        });
    };

    const toggleService = (id: number) => {
        const current = [...data.service_ids];
        const index = current.indexOf(id);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(id);
        }
        setData('service_ids', current);
    };

    const getPendingCount = (fields: string[]) => {
        return fields.filter(f => !auditState[f]).length;
    };

    // Define field groups for counting and organization
    const basicFields = [
        'company_name', 'nit', 'initials', 'legal_status', 'constitution_date', 
        'country_origin', 'phone', 'website', 'department', 'city', 'address', 'logo_path'
    ];

    const charFields = [
        'employees_direct_count', 'employees_tech', 'employees_prof', 'employees_admin', 
        'employees_exec', 'employees_other', 'company_classification', 'hydrocarbons_participation', 
        'hydrocarbons_level', 'private_income_pct', 'public_income_pct', 'pep_declaration', 
        'pep_name', 'pep_doc_type', 'pep_entity', 'capacitation_plan', 'capacitation_level', 
        'capacitation_no_reason', 'other_guilds', 'funds_origin_declaration'
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
    const docFields = docNames.map(name => `files.${name}`);

    const galleryFields = ['gallery_paths'];

    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.associates.index')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{associate.company_name}</h2>
                            <p className="text-sm text-slate-500 font-medium">NIT: {associate.nit}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="default"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
                            onClick={handleApproveAll}
                            disabled={processing || associate.status === 'approved' || associate.status === 'verified'}
                        >
                            <Check size={14} className="mr-2" />
                            Admitir Socio en CAMEP
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Auditoría: ${associate.company_name}`} />

            <div className="max-w-7xl mx-auto py-6">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex flex-wrap gap-1 justify-start border border-slate-200 shadow-sm">
                        <TabsTrigger value="overview" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                            <Layers size={14} /> Resumen
                        </TabsTrigger>
                        <TabsTrigger value="basic" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                            <Building2 size={14} /> Inf. Básica
                            {getPendingCount(basicFields) > 0 && <Badge className="ml-1 px-1.5 py-0 bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px]">{getPendingCount(basicFields)}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="characterization" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                            <Briefcase size={14} /> Caracterización
                            {getPendingCount(charFields) > 0 && <Badge className="ml-1 px-1.5 py-0 bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px]">{getPendingCount(charFields)}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="contacts" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                            <Users size={14} /> Contactos
                            {getPendingCount(contactFields) > 0 && <Badge className="ml-1 px-1.5 py-0 bg-slate-200 text-slate-700 hover:bg-slate-200 border-none text-[10px]">{getPendingCount(contactFields)}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="services" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                            <Globe size={14} /> Servicios
                            {getPendingCount(serviceFields) > 0 && <Badge className="ml-1 px-1.5 py-0 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px]">{getPendingCount(serviceFields)}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="docs" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                            <FileText size={14} /> Documentos
                            {getPendingCount(docFields) > 0 && <Badge className="ml-1 px-1.5 py-0 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none text-[10px]">{getPendingCount(docFields)}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="gallery" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                            <Globe size={14} /> Galería
                            {getPendingCount(galleryFields) > 0 && <Badge className="ml-1 px-1.5 py-0 bg-rose-100 text-rose-700 hover:bg-rose-100 border-none text-[10px]">{getPendingCount(galleryFields)}</Badge>}
                        </TabsTrigger>
                    </TabsList>

                    {/* --- TAB: OVERVIEW --- */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-slate-900 border-none rounded-2xl p-6 text-white md:col-span-1 shadow-xl">
                                <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-slate-400">Progreso de Auditoría</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 font-medium">Campos Aprobados</span>
                                        <span className="font-black text-emerald-400">{Object.values(auditState).filter(v => v.status === 'approved').length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 font-medium">Campos Rechazados</span>
                                        <span className="font-black text-red-400">{Object.values(auditState).filter(v => v.status === 'rejected').length}</span>
                                    </div>
                                    <div className="pt-2">
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                                                style={{ width: `${Math.min(100, (Object.values(auditState).filter(v => v.status === 'approved').length / (basicFields.length + charFields.length + docFields.length + serviceFields.length + contactFields.length)) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-[10px] mt-2 text-slate-500 font-bold uppercase">Aproximación de Completitud</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="md:col-span-2 border-slate-200 shadow-sm rounded-2xl flex flex-col justify-center items-center p-8 text-center bg-white">
                                <Building2 size={40} className="text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">
                                    Estado de la Solicitud: 
                                    <Badge className={cn(
                                        "ml-2 font-black uppercase tracking-widest text-[10px] px-3 py-1", 
                                        associate.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                        associate.status === 'verified' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        associate.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                        'bg-amber-100 text-amber-700 border-amber-200'
                                    )}>
                                        {associate.status === 'pending' ? 'Pendiente' : 
                                         associate.status === 'verified' ? 'Admitido / Pendiente Pago' :
                                         associate.status === 'approved' ? 'Activo / Aprobado' : 
                                         'Rechazado'}
                                    </Badge>
                                </h3>
                                <p className="text-slate-500 text-sm mt-2 max-w-md">
                                    {associate.status === 'pending' && "Revisa la información corporativa y documentos. Al admitir, el socio podrá elegir un plan y pagar la inscripción."}
                                    {associate.status === 'verified' && "El socio ya fue admitido. Estamos esperando a que realice el pago de su membresía e inscripción."}
                                    {associate.status === 'approved' && "El socio está activo y su perfil es público en el directorio."}
                                </p>
                                {associate.status === 'pending' && (
                                    <Button
                                        className="mt-6 bg-slate-900 text-white rounded-xl px-8 py-6 h-auto font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                        onClick={handleApproveAll}
                                        disabled={processing}
                                    >
                                        <CheckCircle2 size={18} className="mr-2" />
                                        Validar y Admitir como Socio
                                    </Button>
                                )}
                            </Card>
                        </div>
                    </TabsContent>

                    {/* --- TAB: BASIC INFO --- */}
                    <TabsContent value="basic" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AuditSection 
                                title="Identidad Corporativa" 
                                icon={Building2}
                                onAudit={handleAudit}
                                items={[
                                    { id: 'company_name', label: 'Nombre Empresa', value: associate.company_name, status: getFieldStatus('company_name'), reason: auditState['company_name']?.reason },
                                    { id: 'nit', label: 'NIT', value: associate.nit, status: getFieldStatus('nit'), reason: auditState['nit']?.reason },
                                    { id: 'initials', label: 'Sigla', value: associate.initials, status: getFieldStatus('initials'), reason: auditState['initials']?.reason },
                                    { id: 'legal_status', label: 'Tipo Sociedad', value: associate.legal_status, status: getFieldStatus('legal_status'), reason: auditState['legal_status']?.reason },
                                    { id: 'constitution_date', label: 'Fecha Constitución', value: associate.constitution_date, status: getFieldStatus('constitution_date'), reason: auditState['constitution_date']?.reason },
                                    { id: 'country_origin', label: 'País de Origen', value: associate.country_origin, status: getFieldStatus('country_origin'), reason: auditState['country_origin']?.reason },
                                ]}
                            />

                            <AuditSection 
                                title="Ubicación y Contacto" 
                                icon={Globe}
                                onAudit={handleAudit}
                                items={[
                                    { id: 'department', label: 'Departamento', value: associate.department, status: getFieldStatus('department'), reason: auditState['department']?.reason },
                                    { id: 'city', label: 'Ciudad / Municipio', value: associate.city, status: getFieldStatus('city'), reason: auditState['city']?.reason },
                                    { id: 'address', label: 'Dirección Completa', value: associate.address, status: getFieldStatus('address'), reason: auditState['address']?.reason },
                                    { id: 'phone', label: 'Teléfono Principal', value: associate.phone, status: getFieldStatus('phone'), reason: auditState['phone']?.reason },
                                    { id: 'website', label: 'Sitio Web', value: associate.website, status: getFieldStatus('website'), reason: auditState['website']?.reason },
                                ]}
                            />

                            <AuditSection 
                                title="Representante Legal" 
                                icon={User}
                                onAudit={handleAudit}
                                items={[
                                    { id: 'rep_name', label: 'Nombre Completo', value: associate.rep_name, status: getFieldStatus('rep_name'), reason: auditState['rep_name']?.reason },
                                    { id: 'rep_doc', label: 'Documento Identidad', value: associate.rep_doc, status: getFieldStatus('rep_doc'), reason: auditState['rep_doc']?.reason },
                                    { id: 'rep_position', label: 'Cargo', value: associate.rep_position, status: getFieldStatus('rep_position'), reason: auditState['rep_position']?.reason },
                                ]}
                            />
                        </div>
                    </TabsContent>

                    {/* --- TAB: CHARACTERIZATION --- */}
                    <TabsContent value="characterization" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AuditSection 
                                title="Estructura de Empleados" 
                                icon={Briefcase}
                                onAudit={handleAudit}
                                items={[
                                    { id: 'employees_direct_count', label: 'Nro Total Empleados', value: associate.employees_direct_count, status: getFieldStatus('employees_direct_count'), reason: auditState['employees_direct_count']?.reason },
                                    { id: 'employees_tech', label: 'Empleados Técnicos', value: associate.employees_tech, status: getFieldStatus('employees_tech'), reason: auditState['employees_tech']?.reason },
                                    { id: 'employees_prof', label: 'Empleados Profesionales', value: associate.employees_prof, status: getFieldStatus('employees_prof'), reason: auditState['employees_prof']?.reason },
                                    { id: 'employees_admin', label: 'Empleados Admin.', value: associate.employees_admin, status: getFieldStatus('employees_admin'), reason: auditState['employees_admin']?.reason },
                                    { id: 'employees_exec', label: 'Empleados Directivos', value: associate.employees_exec, status: getFieldStatus('employees_exec'), reason: auditState['employees_exec']?.reason },
                                    { id: 'employees_other', label: 'Otros Empleados', value: associate.employees_other ? `${associate.employees_other} (${associate.employees_other_desc})` : 0, status: getFieldStatus('employees_other'), reason: auditState['employees_other']?.reason },
                                    { id: 'company_classification', label: 'Clasificación Empresa', value: associate.company_classification, status: getFieldStatus('company_classification'), reason: auditState['company_classification']?.reason },
                                ]}
                            />

                            <div className="space-y-6">
                                <AuditSection 
                                    title="Actividad e Ingresos" 
                                    icon={Layers}
                                    onAudit={handleAudit}
                                    items={[
                                        { id: 'hydrocarbons_participation', label: 'Participación Hidrocarburos', value: associate.hydrocarbons_participation ? 'SÍ' : 'NO', status: getFieldStatus('hydrocarbons_participation'), reason: auditState['hydrocarbons_participation']?.reason },
                                        { id: 'hydrocarbons_level', label: 'Nivel Participación Hidro.', value: associate.hydrocarbons_level, status: getFieldStatus('hydrocarbons_level'), reason: auditState['hydrocarbons_level']?.reason },
                                        { id: 'private_income_pct', label: 'Ingresos Privados (%)', value: associate.private_income_pct ? `${associate.private_income_pct}%` : null, status: getFieldStatus('private_income_pct'), reason: auditState['private_income_pct']?.reason },
                                        { id: 'public_income_pct', label: 'Ingresos Públicos (%)', value: associate.public_income_pct ? `${associate.public_income_pct}%` : null, status: getFieldStatus('public_income_pct'), reason: auditState['public_income_pct']?.reason },
                                    ]}
                                />

                                <AuditSection 
                                    title="PEP y Transparencia" 
                                    icon={ShieldAlert}
                                    onAudit={handleAudit}
                                    items={[
                                        { id: 'pep_declaration', label: 'Declaración PEP', value: associate.pep_declaration ? 'SÍ' : 'NO', status: getFieldStatus('pep_declaration'), reason: auditState['pep_declaration']?.reason },
                                        { id: 'pep_name', label: 'Nombre Persona PEP', value: associate.pep_name, status: getFieldStatus('pep_name'), reason: auditState['pep_name']?.reason },
                                        { id: 'pep_doc_type', label: 'Tipo Doc. PEP', value: associate.pep_doc_type, status: getFieldStatus('pep_doc_type'), reason: auditState['pep_doc_type']?.reason },
                                        { id: 'pep_entity', label: 'Entidad PEP', value: associate.pep_entity, status: getFieldStatus('pep_entity'), reason: auditState['pep_entity']?.reason },
                                        { id: 'funds_origin_declaration', label: 'Decl. Origen Fondos', value: associate.funds_origin_declaration ? 'FIRMADO DIGITALMENTE' : 'PENDIENTE', status: getFieldStatus('funds_origin_declaration'), reason: auditState['funds_origin_declaration']?.reason },
                                        { id: 'capacitation_plan', label: 'Plan Capacitación', value: associate.capacitation_plan ? 'SÍ' : 'NO', status: getFieldStatus('capacitation_plan'), reason: auditState['capacitation_plan']?.reason },
                                        { id: associate.capacitation_plan ? 'capacitation_level' : 'capacitation_no_reason', label: associate.capacitation_plan ? 'Nivel Capacitación' : 'Motivo No Plan', value: associate.capacitation_plan ? associate.capacitation_level : associate.capacitation_no_reason, status: getFieldStatus(associate.capacitation_plan ? 'capacitation_level' : 'capacitation_no_reason'), reason: auditState[associate.capacitation_plan ? 'capacitation_level' : 'capacitation_no_reason']?.reason },
                                        { id: 'other_guilds', label: 'Otros Gremios', value: associate.other_guilds, status: getFieldStatus('other_guilds'), reason: auditState['other_guilds']?.reason },
                                    ]}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- TAB: CONTACTS --- */}
                    <TabsContent value="contacts" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                                    <h4 className="text-xs font-bold uppercase text-slate-500 flex justify-between items-center">
                                        Directorio de Contactos
                                        <Badge variant="outline" className="font-bold">{associate.contacts?.length || 0}</Badge>
                                    </h4>
                                </div>
                                <div className="p-6 space-y-4">
                                    {associate.contacts?.map((c: any, i: number) => (
                                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex justify-between">
                                                <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                                                <Badge variant="secondary" className="text-[10px] bg-slate-200 text-slate-700">{c.area}</Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium mt-1">{c.position}</p>
                                            <div className="mt-3 flex gap-4 text-xs font-medium text-slate-400">
                                                <span className="flex items-center gap-1.5"><MessageSquare size={12} /> {c.email}</span>
                                                <span className="flex items-center gap-1.5"><Phone size={12} /> {c.phone}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="space-y-6">
                                <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                                        <h4 className="text-xs font-bold uppercase text-slate-500 flex justify-between items-center">
                                            Referencias Registradas
                                            <Badge variant="outline" className="font-bold">{associate.references?.length || 0}</Badge>
                                        </h4>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {associate.references?.map((r: any, i: number) => (
                                            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex justify-between">
                                                    <p className="font-bold text-slate-900 text-sm">{r.name}</p>
                                                    <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">{r.type === 'bank' ? 'Banco' : 'Comercial'}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mt-1">{r.contact_person} {r.position && `(${r.position})`}</p>
                                                <div className="mt-3 flex gap-4 text-xs font-medium text-slate-400">
                                                    {r.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {r.phone}</span>}
                                                    {r.email && <span className="flex items-center gap-1.5"><MessageSquare size={12} /> {r.email}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <AuditSection 
                                    title="Clasificación y Redes" 
                                    icon={Network} 
                                    onAudit={handleAudit}
                                    items={[
                                        { id: 'billing_email', label: 'Email Facturación', value: associate.billing_email, status: getFieldStatus('billing_email'), reason: auditState['billing_email']?.reason },
                                        { id: 'main_ciiu', label: 'CIIU Principal', value: associate.main_ciiu, status: getFieldStatus('main_ciiu'), reason: auditState['main_ciiu']?.reason },
                                        { id: 'secondary_ciiu', label: 'CIIU Secundario', value: associate.secondary_ciiu, status: getFieldStatus('secondary_ciiu'), reason: auditState['secondary_ciiu']?.reason },
                                        { id: 'company_type', label: 'Tipo de Empresa', value: Array.isArray(associate.company_type) ? associate.company_type.join(', ') : associate.company_type, status: getFieldStatus('company_type'), reason: auditState['company_type']?.reason },
                                        { id: 'social_instagram', label: 'Instagram', value: associate.social_instagram, status: getFieldStatus('social_instagram'), reason: auditState['social_instagram']?.reason },
                                        { id: 'social_facebook', label: 'Facebook', value: associate.social_facebook, status: getFieldStatus('social_facebook'), reason: auditState['social_facebook']?.reason },
                                        { id: 'social_linkedin', label: 'LinkedIn', value: associate.social_linkedin, status: getFieldStatus('social_linkedin'), reason: auditState['social_linkedin']?.reason },
                                        { id: 'social_other', label: 'Otras Redes', value: associate.social_other, status: getFieldStatus('social_other'), reason: auditState['social_other']?.reason },
                                        { id: 'contacts', label: 'Auditoría Directorio Contactos', value: `${associate.contacts?.length || 0} registros`, status: getFieldStatus('contacts'), reason: auditState['contacts']?.reason },
                                        { id: 'references', label: 'Auditoría Referencias', value: `${associate.references?.length || 0} registros`, status: getFieldStatus('references'), reason: auditState['references']?.reason },
                                    ]}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- TAB: SERVICES --- */}
                    <TabsContent value="services" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="md:col-span-2 border-slate-200 overflow-hidden rounded-2xl shadow-sm">
                                <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Layers size={18} className="text-slate-400" />
                                        <h4 className="text-sm font-bold uppercase text-slate-700 tracking-wide">Descripción y Portafolio</h4>
                                    </div>
                                    {!isEditingServices ? (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setIsEditingServices(true)}
                                            className="h-8 text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 hover:bg-white shadow-sm border border-indigo-100"
                                        >
                                            <Pencil size={12} className="mr-1.5" /> Modificar Servicios
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => {
                                                    setIsEditingServices(false);
                                                    setData('service_ids', associate.services?.map(s => s.id) || []);
                                                }}
                                                className="h-8 text-[10px] font-bold uppercase border-slate-200"
                                            >Cancelar</Button>
                                            <Button 
                                                size="sm" 
                                                onClick={() => {
                                                    handleUpdate();
                                                    setIsEditingServices(false);
                                                }}
                                                className="h-8 text-[10px] font-bold uppercase bg-emerald-600 text-white hover:bg-emerald-700"
                                            ><Save size={12} className="mr-1.5" /> Guardar</Button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 space-y-8 bg-white">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción para el Directorio</Label>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAudit('description', 'approved')} className={cn("p-1.5 rounded-lg border transition-all", auditState['description']?.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300')}><Check size={14} /></button>
                                                <button onClick={() => handleAudit('description', 'rejected')} className={cn("p-1.5 rounded-lg border transition-all", auditState['description']?.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300')}><X size={14} /></button>
                                            </div>
                                        </div>
                                        {!isEditingServices ? (
                                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100 italic">"{associate.description || 'Sin descripción'}"</p>
                                        ) : (
                                            <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full min-h-[150px] p-4 rounded-xl border-slate-200 focus:border-indigo-500 transition-all text-sm resize-none" />
                                        )}
                                        {auditState['description']?.status === 'rejected' && <p className="text-[10px] font-bold text-red-600"><AlertTriangle size={12} className="inline mr-1" /> {auditState['description']?.reason}</p>}
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Servicios Seleccionados</Label>
                                        {!isEditingServices ? (
                                            <div className="flex flex-wrap gap-2">
                                                {associate.services?.map((s: any) => <Badge key={s.id} variant="outline" className="bg-indigo-50/50 border-indigo-100 text-indigo-700 font-bold px-3 py-1">{s.name}</Badge>)}
                                            </div>
                                        ) : (
                                            <div className="space-y-4 pb-32">
                                                {availableServices.map((cat: any) => (
                                                    <SearchableSelect key={cat.id} label={cat.name} multiple={true} value={cat.services.filter((s: any) => data.service_ids.includes(s.id)).map((s: any) => s.name)} onChange={(opt: any) => toggleService(opt.id)} options={cat.services} placeholder={`Selec. ${cat.name}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <AuditSection 
                                title="Intereses CAMEP" icon={Globe} onAudit={handleAudit}
                                items={[
                                    { id: 'membership_interest', label: 'Intereses Afiliación', value: Array.isArray(associate.membership_interest) ? associate.membership_interest.join(', ') : associate.membership_interest, status: getFieldStatus('membership_interest'), reason: auditState['membership_interest']?.reason },
                                ]}
                            />
                        </div>
                    </TabsContent>

                    {/* --- TAB: DOCUMENTS --- */}
                    <TabsContent value="docs" className="space-y-6">
                        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden max-w-4xl mx-auto">
                            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Auditando Documentación Oficial</h3>
                                        <p className="text-xs text-slate-400 font-medium">Previsualiza y aprueba cada archivo adjunto por el asociado.</p>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 font-black">
                                    {Object.keys(associate.document_urls || {}).length} ARCHIVOS
                                </Badge>
                            </div>
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                    <div className="divide-y divide-slate-50">
                                        {docNames.slice(0, 10).map(docName => (
                                            <FileAuditItem 
                                                key={docName}
                                                id={`files.${docName}`}
                                                name={docName} 
                                                status={getFieldStatus(`files.${docName}`) as any} 
                                                reason={auditState[`files.${docName}`]?.reason}
                                                fileUrl={associate.document_urls?.[docName]}
                                                onAudit={(s: 'approved' | 'rejected', r: string) => handleAudit(`files.${docName}`, s, r)}
                                            />
                                        ))}
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {docNames.slice(10).map(docName => (
                                            <FileAuditItem 
                                                key={docName}
                                                id={`files.${docName}`}
                                                name={docName} 
                                                status={getFieldStatus(`files.${docName}`) as any} 
                                                reason={auditState[`files.${docName}`]?.reason}
                                                fileUrl={associate.document_urls?.[docName]}
                                                onAudit={(s: 'approved' | 'rejected', r: string) => handleAudit(`files.${docName}`, s, r)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- TAB: GALLERY --- */}
                    <TabsContent value="gallery" className="space-y-6">
                        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Globe size={16} className="text-slate-400" />
                                    Galería de Imágenes
                                </h3>
                                <div className="flex items-center gap-3">
                                    <Button onClick={() => handleAudit('gallery_paths', 'approved')} className={cn("h-8 text-[10px] font-bold uppercase", auditState['gallery_paths']?.status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white')}>Aprobar Todo</Button>
                                    <Button onClick={() => handleAudit('gallery_paths', 'rejected')} variant="outline" className={cn("h-8 text-[10px] font-bold uppercase", auditState['gallery_paths']?.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' : 'border-slate-200')}>Rechazar Todo</Button>
                                </div>
                            </div>
                            <CardContent className="p-8">
                                {associate.gallery_urls && associate.gallery_urls.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {associate.gallery_urls.map((img: any, i: number) => (
                                            <div key={i} className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                <img 
                                                    src={img.url} 
                                                    alt={`Gallery ${i}`} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => window.open(img.url, '_blank')}>
                                                        <Eye size={20} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Globe size={40} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-500 font-medium">No se han subido imágenes a la galería.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

// --- Sub-components for Audit ---

function AuditSection({ title, icon: Icon, items, onAudit }: { title: string, icon: any, items: any[], onAudit: any }) {
    const [rejectionField, setRejectionField] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    return (
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Icon size={16} className="text-slate-400" />
                    {title}
                </h3>
            </div>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50 font-sans">
                    {items.map((item, idx) => (
                        <div key={idx} className="px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">{item.label}</p>
                                    {item.value ? (
                                        <p className="text-sm font-semibold text-slate-800">
                                            {typeof item.value === 'string' && item.value.match(/^\d{4}-\d{2}-\d{2}T/) 
                                                ? new Date(item.value).toISOString().split('T')[0] 
                                                : item.value}
                                        </p>
                                    ) : (
                                        <div className="flex items-center gap-2 text-amber-600">
                                            <Clock size={12} />
                                            <span className="text-sm font-bold italic">Pendiente por recibir</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.status === 'pending' ? (
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                onClick={() => setRejectionField(rejectionField === item.id ? null : item.id)}
                                                size="sm" variant="outline" className={cn("h-8 w-8 p-0 rounded-full border-red-100 text-red-600 hover:bg-red-50", rejectionField === item.id && "bg-red-50")}
                                            >
                                                <X size={14} />
                                            </Button>
                                            <Button 
                                                onClick={() => onAudit(item.id, 'approved')}
                                                size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                                            >
                                                <Check size={14} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end">
                                            <Badge className={cn("text-[10px] font-bold uppercase shadow-none border", 
                                                item.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                            )}>
                                                {item.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rejection Form inline */}
                            {rejectionField === item.id && (
                                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                                    <Label className="text-[10px] font-black uppercase text-red-900 mb-2 block">Motivo del Rechazo</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Ej. El documento está borroso..."
                                            className="h-9 text-xs border-red-200 focus-visible:ring-red-500 bg-white"
                                        />
                                        <Button 
                                            onClick={() => {
                                                onAudit(item.id, 'rejected', rejectionReason);
                                                setRejectionField(null);
                                                setRejectionReason('');
                                            }}
                                            disabled={!rejectionReason.trim()}
                                            className="h-9 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase px-4"
                                        >
                                            Ok
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Display Saved Reason if rejected */}
                            {item.status === 'rejected' && item.reason && (
                                <div className="mt-2 flex items-start gap-2 text-red-600 bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                                    <MessageSquare size={12} className="shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold">{item.reason}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function FileAuditItem({ id, name, status, reason, fileUrl, onAudit }: { id: string, name: string, status: 'approved' | 'rejected' | 'pending', reason?: string, fileUrl?: string, onAudit: any }) {
    const [isRejecting, setIsRejecting] = useState(false);
    const [localReason, setLocalReason] = useState('');

    const handleView = () => {
        if (fileUrl) window.open(fileUrl, '_blank');
    };

    const handleDownload = () => {
        if (!fileUrl) return;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 group font-sans">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">{name}</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">
                            {status === 'pending' ? 'Documento pendiente de revisión' : (status === 'approved' ? 'Verificado' : 'Rechazado')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button 
                        onClick={handleDownload}
                        disabled={!fileUrl}
                        variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg"
                    >
                        <Download size={14} />
                    </Button>
                    <Button 
                        onClick={handleView}
                        disabled={!fileUrl}
                        variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg"
                    >
                        <Eye size={14} />
                    </Button>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50">
                {status === 'pending' ? (
                    <div className="space-y-3">
                        {!isRejecting ? (
                            <div className="flex items-center gap-2">
                                <Button 
                                    onClick={() => onAudit('approved', '')}
                                    className="flex-1 h-8 text-[10px] font-bold uppercase bg-slate-900 hover:bg-slate-800 rounded-lg"
                                >Aprobar</Button>
                                <Button 
                                    onClick={() => setIsRejecting(true)}
                                    variant="outline" className="flex-1 h-8 text-[10px] font-bold uppercase border-slate-200 text-red-600 hover:bg-red-50 rounded-lg"
                                >Rechazar</Button>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-top-1 duration-200">
                                <Label className="text-[10px] font-black uppercase text-red-900 mb-1.5 block">Motivo del Rechazo</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={localReason}
                                        onChange={(e) => setLocalReason(e.target.value)}
                                        placeholder="Ej. Formato inválido..."
                                        className="h-8 text-xs border-red-200 focus-visible:ring-red-500"
                                    />
                                    <Button 
                                        onClick={() => {
                                            onAudit('rejected', localReason);
                                            setIsRejecting(false);
                                        }}
                                        disabled={!localReason.trim()}
                                        className="h-8 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase px-3"
                                    >Ok</Button>
                                    <Button 
                                        onClick={() => setIsRejecting(false)}
                                        variant="ghost" className="h-8 text-[10px] font-bold uppercase px-2"
                                    >X</Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full">
                        <div className={cn("flex items-center gap-2 mb-1 text-[10px] font-black uppercase tracking-wider", 
                            status === 'approved' ? 'text-emerald-600' : 'text-red-600'
                        )}>
                            {status === 'approved' ? <Check size={14} /> : <X size={14} />}
                            <span>{status === 'approved' ? 'Documento Aprobado' : 'Documento Rechazado'}</span>
                        </div>
                        {status === 'rejected' && reason && (
                            <p className="text-[10px] font-bold text-red-500 pl-5 italic opacity-80">{reason}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
