import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import {
    Building2,
    MapPin,
    Phone,
    Globe,
    User,
    ShieldCheck,
    CheckCircle2,
    Lock,
    Pencil,
    MessageSquare,
    AlertCircle,
    X,
    ChevronRight,
    Calendar,
    Info,
} from 'lucide-react';
import { SearchableSelect } from '@/Components/ui/SearchableSelect';
import { cn } from '@/lib/utils';

interface Props {
    auth: any;
    initialAssociate?: any;
}

const LEGAL_STATUSES = ['SAS', 'Ltda.', 'Anónima', 'ESAL', 'Cooperativa', 'Otro'];

const REQUIRED_FIELDS = ['company_name', 'nit', 'legal_status', 'department', 'city', 'phone', 'rep_name'];

function completionScore(data: any): { filled: number; total: number; pct: number } {
    const filled = REQUIRED_FIELDS.filter(f => data[f] && String(data[f]).trim() !== '').length;
    return { filled, total: REQUIRED_FIELDS.length, pct: Math.round((filled / REQUIRED_FIELDS.length) * 100) };
}

export default function BasicInfo({ auth, initialAssociate }: Props) {
    const [isEditing, setIsEditing] = useState(!initialAssociate);
    const [saved, setSaved] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingDeps, setLoadingDeps] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    const auditLog = initialAssociate?.audit_log || {};

    const { data, setData, post, processing, errors } = useForm({
        company_name: initialAssociate?.company_name || '',
        initials: initialAssociate?.initials || '',
        nit: initialAssociate?.nit || '',
        legal_status: initialAssociate?.legal_status || '',
        legal_status_other: '',
        constitution_date: initialAssociate?.constitution_date
            ? initialAssociate.constitution_date.split('T')[0]
            : '',
        country_origin: initialAssociate?.country_origin || 'Colombia',
        phone: initialAssociate?.phone || '',
        website: initialAssociate?.website || '',
        department: initialAssociate?.department || '',
        department_id: initialAssociate?.department_id || '',
        city: initialAssociate?.city || '',
        city_id: initialAssociate?.city_id || '',
        address: initialAssociate?.address || '',
        rep_name: initialAssociate?.rep_name || '',
        rep_position: initialAssociate?.rep_position || '',
        rep_doc_type: initialAssociate?.rep_doc_type || '',
        rep_doc: initialAssociate?.rep_doc || '',
    });

    const score = completionScore(data);

    // Fetch Departments
    useEffect(() => {
        const fetchDeps = async () => {
            setLoadingDeps(true);
            try {
                const res = await fetch('https://api-colombia.com/api/v1/Department');
                const result = await res.json();
                const sorted = result.sort((a: any, b: any) => a.name.localeCompare(b.name));
                setDepartments(sorted);
                if (initialAssociate?.department && !data.department_id) {
                    const match = sorted.find((d: any) => d.name === initialAssociate.department);
                    if (match) setData(prev => ({ ...prev, department_id: match.id }));
                }
            } catch (e) {
                console.error('Error fetching departments', e);
            } finally {
                setLoadingDeps(false);
            }
        };
        fetchDeps();
    }, []);

    // Fetch Cities
    useEffect(() => {
        if (data.department_id) {
            const fetchCities = async () => {
                setLoadingCities(true);
                try {
                    const res = await fetch(`https://api-colombia.com/api/v1/Department/${data.department_id}/cities`);
                    const result = await res.json();
                    setCities(result.sort((a: any, b: any) => a.name.localeCompare(b.name)));
                } catch (e) {
                    console.error('Error fetching cities', e);
                } finally {
                    setLoadingCities(false);
                }
            };
            fetchCities();
        }
    }, [data.department_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('associate.company.update.basic'), {
            onSuccess: () => {
                setIsEditing(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 4000);
            },
        });
    };

    const isLocked = (field: string) => {
        if (!isEditing) return true;
        if (auditLog[field]?.status === 'approved') return true;
        return false;
    };

    const fieldStatus = (field: string) => {
        const audit = auditLog[field];
        if (!audit) return null;
        if (audit.status === 'approved') return 'approved';
        if (audit.status === 'rejected') return 'rejected';
        return null;
    };

    const rejectedFields = Object.entries(auditLog)
        .filter(([_, audit]: [any, any]) => audit.status === 'rejected')
        .map(([key, audit]: [any, any]) => ({
            field: key,
            reason: audit.reason,
            label: ({
                company_name: 'Razón Social',
                initials: 'Sigla',
                nit: 'NIT',
                legal_status: 'Tipo de Sociedad',
                rep_name: 'Representación Legal - Nombre',
                rep_position: 'Representación Legal - Cargo',
                rep_doc_type: 'Representación Legal - Tipo de Documento',
                rep_doc: 'Representación Legal - Número de Documento',
                department: 'Departamento',
                city: 'Ciudad',
                address: 'Dirección',
                phone: 'Teléfono',
                website: 'Página Web',
            } as Record<string, string>)[key] || key,
        }));

    const isRequired = (field: string) => REQUIRED_FIELDS.includes(field);

    return (
        <AppLayout>
            <Head title="Información Básica" />

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Welcome Banner for New Users */}
                {!initialAssociate && (
                    <div className="rounded-2xl border border-slate-900 bg-slate-900 p-6 text-white shadow-xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Building2 size={120} />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-xl font-bold mb-2">¡Bienvenido a la red CAMEP!</h2>
                            <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                Estamos emocionados de tenerte. Para comenzar tu proceso de afiliación, por favor completa la información básica de tu empresa. 
                                Una vez guardes estos datos, el equipo de CAMEP iniciará la revisión oficial.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Paso 1: Identificación Corporativa
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                            Información Básica
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            Datos principales de tu organización en el directorio CAMEP.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {!isEditing ? (
                            <Button
                                onClick={() => { setIsEditing(true); setSaved(false); }}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-2 px-5"
                            >
                                <Pencil size={14} />
                                {initialAssociate ? 'Editar información' : 'Completar registro'}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    className="border-slate-200 text-slate-600 rounded-xl"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 px-5"
                                >
                                    <ShieldCheck size={15} />
                                    {processing ? 'Guardando...' : initialAssociate ? 'Enviar a revisión' : 'Crear mi empresa'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Completion bar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                                Completitud del perfil
                            </span>
                            <span className={cn(
                                "text-[11px] font-black",
                                score.pct === 100 ? "text-emerald-600" : score.pct >= 60 ? "text-amber-600" : "text-red-500"
                            )}>
                                {score.filled}/{score.total} campos requeridos
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    score.pct === 100 ? "bg-emerald-500" : score.pct >= 60 ? "bg-amber-400" : "bg-red-400"
                                )}
                                style={{ width: `${score.pct}%` }}
                            />
                        </div>
                    </div>
                    {score.pct === 100 ? (
                        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={18} className="text-emerald-600" />
                        </div>
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-[13px] font-black text-slate-600">
                            {score.pct}%
                        </div>
                    )}
                </div>

                {/* Success banner */}
                {saved && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-black text-emerald-800">¡Información enviada a revisión!</p>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">
                                CAMEP revisará los datos en los próximos días hábiles y recibirás una notificación con el resultado.
                            </p>
                        </div>
                        <button onClick={() => setSaved(false)} className="text-emerald-400 hover:text-emerald-600">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Rejected fields summary */}
                {rejectedFields.length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                                <AlertCircle size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-red-900 uppercase tracking-tight">
                                    {rejectedFields.length} campo{rejectedFields.length > 1 ? 's' : ''} rechazado{rejectedFields.length > 1 ? 's' : ''} por CAMEP
                                </h3>
                                <p className="text-xs text-red-600 font-medium mt-0.5">
                                    Corrígelos y vuelve a enviar a revisión.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {rejectedFields.map((rf, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-red-100">
                                    <MessageSquare size={13} className="text-red-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide">{rf.label}</p>
                                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 italic">"{rf.reason || 'Sin motivo especificado'}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Editing info banner */}
                {!isEditing && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2.5">
                        <Info size={14} className="text-slate-400 shrink-0" />
                        <p className="text-xs text-slate-500 font-medium flex-1">
                            Modo visualización · Haz clic en <strong>Editar información</strong> para modificar los campos.
                        </p>
                        <ChevronRight size={14} className="text-slate-300" />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Sección: Identificación Corporativa */}
                    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="flex items-center gap-2.5 px-6 py-4 bg-slate-50 border-b border-slate-100">
                            <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center">
                                <Building2 size={14} className="text-white" />
                            </div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Identificación Corporativa</h2>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Razón Social */}
                                <FieldWrapper
                                    label="Razón Social"
                                    required={isRequired('company_name')}
                                    status={fieldStatus('company_name')}
                                    error={errors.company_name}
                                    rejectedReason={auditLog.company_name?.status === 'rejected' ? auditLog.company_name.reason : undefined}
                                >
                                    <Input
                                        value={data.company_name}
                                        onChange={e => setData('company_name', e.target.value)}
                                        disabled={isLocked('company_name')}
                                        placeholder="Ej. Asociación de Constructores del Valle"
                                        className={cn("text-sm", isLocked('company_name') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                                    />
                                    {isLocked('company_name') && !isEditing && <LockIcon />}
                                </FieldWrapper>

                                {/* Sigla */}
                                <FieldWrapper label="Sigla" status={fieldStatus('initials')}>
                                    <Input
                                        value={data.initials}
                                        onChange={e => setData('initials', e.target.value)}
                                        disabled={isLocked('initials')}
                                        placeholder="Ej. ACVA"
                                        className={cn("text-sm uppercase", isLocked('initials') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                                    />
                                </FieldWrapper>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* NIT */}
                                <FieldWrapper
                                    label="NIT"
                                    required={isRequired('nit')}
                                    status={fieldStatus('nit')}
                                    error={errors.nit}
                                >
                                    <Input
                                        value={data.nit}
                                        onChange={e => setData('nit', e.target.value)}
                                        disabled={isLocked('nit')}
                                        placeholder="Ej. 900123456-7"
                                        className={cn("text-sm font-mono", isLocked('nit') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                                    />
                                </FieldWrapper>

                                {/* Fecha de constitución */}
                                <FieldWrapper label="Fecha de Constitución" status={fieldStatus('constitution_date')} error={errors.constitution_date}>
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        <Input
                                            type="date"
                                            value={data.constitution_date}
                                            onChange={e => setData('constitution_date', e.target.value)}
                                            disabled={isLocked('constitution_date')}
                                            className={cn("text-sm pl-9", isLocked('constitution_date') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                                        />
                                    </div>
                                </FieldWrapper>
                            </div>

                            {/* Tipo de Sociedad */}
                            <FieldWrapper
                                label="Tipo de Sociedad"
                                required={isRequired('legal_status')}
                                status={fieldStatus('legal_status')}
                            >
                                <div className="flex gap-2 flex-wrap">
                                    {LEGAL_STATUSES.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => !isLocked('legal_status') && setData('legal_status', t)}
                                            disabled={isLocked('legal_status')}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                                data.legal_status === t
                                                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700",
                                                isLocked('legal_status') && "opacity-40 cursor-not-allowed pointer-events-none"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </FieldWrapper>
                        </div>
                    </section>

                    {/* Sección: Representación Legal */}
                    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="flex items-center gap-2.5 px-6 py-4 bg-slate-50 border-b border-slate-100">
                            <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center">
                                <User size={14} className="text-white" />
                            </div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Representación Legal</h2>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FieldWrapper
                                    label="Nombre del Representante"
                                    required={isRequired('rep_name')}
                                    status={fieldStatus('rep_name')}
                                >
                                    <Input
                                        value={data.rep_name}
                                        onChange={e => setData('rep_name', e.target.value)}
                                        disabled={isLocked('rep_name')}
                                        placeholder="Nombre completo"
                                        className={cn("text-sm", isLocked('rep_name') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                                    />
                                </FieldWrapper>

                                <FieldWrapper label="Cargo" status={fieldStatus('rep_position')}>
                                    <Input
                                        value={data.rep_position}
                                        onChange={e => setData('rep_position', e.target.value)}
                                        disabled={isLocked('rep_position')}
                                        placeholder="Ej. Gerente General"
                                        className={cn("text-sm", isLocked('rep_position') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                                    />
                                </FieldWrapper>
                            </div>

                            {/* Tipo y número de documento */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <FieldWrapper label="Tipo de Documento" status={fieldStatus('rep_doc_type')}>
                                    <div className="flex gap-2 flex-wrap">
                                        {['CC', 'CE', 'NIT', 'Pasaporte'].map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => !isLocked('rep_doc_type') && setData('rep_doc_type', t)}
                                                disabled={isLocked('rep_doc_type')}
                                                className={cn(
                                                    "px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                                                    data.rep_doc_type === t
                                                        ? "bg-slate-900 text-white border-slate-900"
                                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400",
                                                    isLocked('rep_doc_type') && "opacity-40 cursor-not-allowed pointer-events-none"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </FieldWrapper>

                                <div className="md:col-span-2">
                                    <FieldWrapper label="Número de Documento" status={fieldStatus('rep_doc')}>
                                        <Input
                                            value={data.rep_doc}
                                            onChange={e => setData('rep_doc', e.target.value)}
                                            disabled={isLocked('rep_doc')}
                                            placeholder="Ej. 1234567890"
                                            className={cn("text-sm font-mono", isLocked('rep_doc') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                                        />
                                    </FieldWrapper>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sección: Ubicación y Contacto */}
                    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="flex items-center gap-2.5 px-6 py-4 bg-slate-50 border-b border-slate-100">
                            <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center">
                                <MapPin size={14} className="text-white" />
                            </div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Ubicación y Contacto</h2>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FieldWrapper
                                    label="Departamento"
                                    required={isRequired('department')}
                                    status={fieldStatus('department')}
                                >
                                    <SearchableSelect
                                        label=""
                                        value={data.department}
                                        disabled={isLocked('department')}
                                        onChange={(opt: any) =>
                                            setData((d: any) => ({ ...d, department: opt.name, department_id: opt.id, city: '', city_id: '' }))
                                        }
                                        options={departments}
                                        placeholder="Buscar departamento..."
                                        loading={loadingDeps}
                                    />
                                </FieldWrapper>

                                <FieldWrapper
                                    label="Ciudad"
                                    required={isRequired('city')}
                                    status={fieldStatus('city')}
                                    hint={!data.department_id ? 'Selecciona primero un departamento' : undefined}
                                >
                                    <SearchableSelect
                                        label=""
                                        value={data.city}
                                        disabled={isLocked('city') || !data.department_id}
                                        onChange={(opt: any) =>
                                            setData((d: any) => ({ ...d, city: opt.name, city_id: opt.id }))
                                        }
                                        options={cities}
                                        placeholder={!data.department_id ? 'Primero elige departamento' : 'Buscar ciudad...'}
                                        loading={loadingCities}
                                    />
                                </FieldWrapper>
                            </div>

                            <FieldWrapper label="Dirección" status={fieldStatus('address')}>
                                <Input
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    disabled={isLocked('address')}
                                    placeholder="Ej. Calle 15 # 8-42, Oficina 301"
                                    className={cn("text-sm", isLocked('address') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                                />
                            </FieldWrapper>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FieldWrapper
                                    label="Teléfono"
                                    required={isRequired('phone')}
                                    status={fieldStatus('phone')}
                                    icon={<Phone size={13} className="text-slate-400" />}
                                >
                                    <Input
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        disabled={isLocked('phone')}
                                        placeholder="Ej. +57 300 123 4567"
                                        className={cn("text-sm", isLocked('phone') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                                    />
                                </FieldWrapper>

                                <FieldWrapper
                                    label="Página Web"
                                    status={fieldStatus('website')}
                                    icon={<Globe size={13} className="text-slate-400" />}
                                >
                                    <Input
                                        value={data.website}
                                        onChange={e => setData('website', e.target.value)}
                                        disabled={isLocked('website')}
                                        placeholder="https://miempresa.com"
                                        className={cn("text-sm", isLocked('website') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                                    />
                                </FieldWrapper>
                            </div>
                        </div>
                    </section>

                    {/* Footer note */}
                    {isEditing && (
                        <div className="flex items-center justify-between pt-1">
                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                                <ShieldCheck size={12} />
                                Al guardar, los datos quedan en revisión. CAMEP te notificará el resultado.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl text-slate-600 border-slate-200">
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2"
                                >
                                    <ShieldCheck size={14} />
                                    {processing ? 'Guardando...' : 'Enviar a revisión'}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}

// ─── Field Wrapper helpers ─────────────────────────────────────────────────

function StatusDot({ status }: { status: string | null }) {
    if (!status) return null;
    if (status === 'approved') return (
        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
            <CheckCircle2 size={11} /> Aprobado
        </span>
    );
    if (status === 'rejected') return (
        <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase">
            <AlertCircle size={11} /> Rechazado
        </span>
    );
    return null;
}

function LockIcon() {
    return <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />;
}

interface FieldWrapperProps {
    label: string;
    required?: boolean;
    status?: string | null;
    error?: string;
    rejectedReason?: string;
    hint?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

function FieldWrapper({ label, required, status, error, rejectedReason, hint, icon, children }: FieldWrapperProps) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label className={cn("text-xs font-bold uppercase tracking-wide flex items-center gap-1.5", status === 'rejected' ? "text-red-600" : "text-slate-500")}>
                    {icon}
                    {label}
                    {required && <span className="text-red-400 text-[10px]">*</span>}
                </Label>
                <StatusDot status={status ?? null} />
            </div>
            <div className={cn("relative", status === 'rejected' && "[&_input]:border-red-300 [&_input]:bg-red-50/50")}>
                {children}
            </div>
            {hint && (
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Info size={10} /> {hint}
                </p>
            )}
            {error && <p className="text-[11px] text-red-500 font-bold">{error}</p>}
            {rejectedReason && (
                <div className="flex items-start gap-1.5 p-2 bg-red-50 border-l-2 border-red-400 rounded-r text-[11px] text-red-600 font-medium">
                    <MessageSquare size={11} className="mt-0.5 shrink-0" />
                    {rejectedReason}
                </div>
            )}
        </div>
    );
}
