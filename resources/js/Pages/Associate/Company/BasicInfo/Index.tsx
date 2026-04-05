import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Save, Pencil, Send } from 'lucide-react';
import { ChangeRequestModal } from '@/Components/ChangeRequestModal';

// Sub-components
import IdentityCorporate from './Parts/IdentityCorporate';
import LegalRepresentative from './Parts/LegalRepresentative';
import LocationContact from './Parts/LocationContact';
import AlertsForms from './Parts/AlertsForms';

interface Props {
    auth: any;
    initialAssociate?: any;
    flash?: {
        success?: string;
        error?: string;
        draft_saved?: string;
    };
}

const LEGAL_STATUSES = ['SAS', 'Ltda.', 'Anónima', 'ESAL', 'Cooperativa', 'Otro'];

const REQUIRED_FIELDS = [
    'company_name',
    'nit',
    'legal_status',
    'department',
    'city',
    'address',
    'phone',
    'rep_name',
    'rep_doc',
    'rep_doc_type',
    'rep_position',
    'country_origin'
];

const FIELD_LABELS: Record<string, string> = {
    company_name:     'Razón Social',
    initials:         'Sigla',
    nit:              'NIT',
    legal_status:     'Tipo de Sociedad',
    constitution_date:'Fecha de Constitución',
    country_origin:   'País de Origen',
    department:       'Departamento',
    city:             'Ciudad',
    address:          'Dirección',
    phone:            'Teléfono',
    website:          'Página Web',
    rep_name:         'Nombre del Representante',
    rep_position:     'Cargo',
    rep_doc_type:     'Tipo de Documento',
    rep_doc:          'Número de Documento',
};

function completionScore(data: any) {
    const filled = REQUIRED_FIELDS.filter(f => data[f] && String(data[f]).trim() !== '').length;
    return { filled, total: REQUIRED_FIELDS.length, pct: Math.round((filled / REQUIRED_FIELDS.length) * 100) };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BasicInfo({ auth, initialAssociate, flash }: Props) {
    const associateStatus = initialAssociate?.status ?? null;
    const [isEditing, setIsEditing] = useState(!initialAssociate || associateStatus === 'draft');
    const [departments, setDepartments] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingDeps, setLoadingDeps] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [changeRequestField, setChangeRequestField] = useState<string | null>(null);
    const [changeRequesting, setChangeRequesting] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'draft' | 'error'; msg: string } | null>(null);


    const auditLog: Record<string, any> = initialAssociate?.audit_log || {};
    const isNew = !initialAssociate;

    // ── Flash messages ───────────────────────────────────────────────────────
    useEffect(() => {
        if (flash?.draft_saved) setNotification({ type: 'draft', msg: `Borrador guardado · ${flash.draft_saved}` });
        if (flash?.success) {
            setNotification({ type: 'success', msg: flash.success });
            setIsEditing(false);
        }
        if (flash?.error) setNotification({ type: 'error', msg: flash.error });
        if (flash) {
            const t = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    // ── Form ────────────────────────────────────────────────────────────────
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        company_name:      initialAssociate?.company_name      || '',
        initials:          initialAssociate?.initials          || '',
        nit:               initialAssociate?.nit               || '',
        legal_status:      initialAssociate?.legal_status      || '',
        legal_status_other:'',
        constitution_date: initialAssociate?.constitution_date ? initialAssociate.constitution_date.split('T')[0] : '',
        country_origin:    initialAssociate?.country_origin    || 'Colombia',
        phone:             initialAssociate?.phone             || '',
        website:           initialAssociate?.website           || '',
        department:        initialAssociate?.department        || '',
        department_id:     initialAssociate?.department_id     || null,
        city:              initialAssociate?.city              || '',
        city_id:           initialAssociate?.city_id           || null,
        address:           initialAssociate?.address           || '',
        rep_name:          initialAssociate?.rep_name          || '',
        rep_position:      initialAssociate?.rep_position      || '',
        rep_doc_type:      initialAssociate?.rep_doc_type      || '',
        rep_doc:           initialAssociate?.rep_doc           || '',
    });

    const score = completionScore(data);

    // ── Data Fetching ───────────────────────────────────────────────────────
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
                    if (match) setData('department_id', match.id);
                }
            } catch (e) { console.error('Error departments', e); }
            finally { setLoadingDeps(false); }
        };
        fetchDeps();
    }, []);

    useEffect(() => {
        if (data.department_id) {
            const fetchCities = async () => {
                setLoadingCities(true);
                try {
                    const res = await fetch(`https://api-colombia.com/api/v1/Department/${data.department_id}/cities`);
                    const result = await res.json();
                    setCities(result.sort((a: any, b: any) => a.name.localeCompare(b.name)));
                } catch (e) { console.error('Error cities', e); }
                finally { setLoadingCities(false); }
            };
            fetchCities();
        }
    }, [data.department_id]);

    // ── Helpers ─────────────────────────────────────────────────────────────
    const isRequired = (field: string) => REQUIRED_FIELDS.includes(field);

    const fieldStatus = (field: string) => {
        const audit = auditLog[field];
        if (audit) {
            if (audit.status === 'approved' && audit.change_request) return 'change_requested';
            if (audit.status === 'approved') return 'approved';
            if (audit.status === 'rejected') return 'rejected';
            if (audit.status === 'editable') return 'editable';
        }

        // Si el estado global es pendiente, aprobado o rechazado, y no hay auditoría específica, 
        // el campo hereda el estado global (lo que resultará en bloqueo si no es 'rejected' específico)
        if (['pending', 'approved', 'verified', 'rejected'].includes(associateStatus)) {
            const val = data[field as keyof typeof data];
            const isEmpty = !val || (typeof val === 'string' && val.trim() === '');
            
            if (isEmpty && associateStatus === 'draft') return 'editable';
            
            return associateStatus; 
        }

        return 'editable';
    };

    const isLocked = (field: string) => {
        if (!isEditing) return true;
        const status = fieldStatus(field);
        
        // El campo se bloquea si:
        // 1. Está aprobado, pendiente o verificado.
        // 2. Hereda el estado 'rejected' global pero no tiene un rechazo específico en el auditLog.
        const isRejectedGlobal = status === 'rejected' && auditLog[field]?.status !== 'rejected';
        
        return status === 'approved' || 
               status === 'change_requested' || 
               status === 'pending' || 
               status === 'verified' || 
               isRejectedGlobal;
    };


    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        clearErrors();
        
        const missing = REQUIRED_FIELDS.filter(f => {
            const val = data[f as keyof typeof data];
            return !val || (typeof val === 'string' && val.trim() === '');
        });

        if (missing.length > 0) {
            missing.forEach(f => setError(f as any, 'Este campo es obligatorio para enviar a revisión'));
            const firstError = document.querySelector('.text-red-500');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        post(route('associate.company.update.basic'), {
            onSuccess: () => {
                setIsEditing(false);
                setNotification({ type: 'success', msg: 'Información enviada a revisión correctamente.' });
            },
            onError: (err) => {
                console.error('Submission Error:', err);
                setNotification({ type: 'error', msg: 'Error de validación. Revisa los campos marcados.' });
            }
        });
    };

    const handleSaveDraft = (e: React.MouseEvent) => {
        e.preventDefault();
        post(route('associate.company.save.draft'));
    };

    const handleRequestChange = useCallback((reason: string) => {
        if (!changeRequestField) return;
        setChangeRequesting(true);
        router.post(route('associate.company.request.field.change'), { field: changeRequestField, reason }, {
            onFinish: () => {
                setChangeRequesting(false);
                setChangeRequestField(null);
            },
        });
    }, [changeRequestField]);

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <AppLayout>
            <Head title="Información Básica" />
            {changeRequestField && (
                <ChangeRequestModal
                    field={changeRequestField}
                    fieldLabel={FIELD_LABELS[changeRequestField]}
                    onClose={() => setChangeRequestField(null)}
                    onSubmit={handleRequestChange}
                    isSubmitting={changeRequesting}
                />
            )}

            <div className="max-w-4xl mx-auto space-y-5">
                <AlertsForms
                    isNew={isNew}
                    associateStatus={associateStatus}
                    notification={notification}
                    onCloseNotification={() => setNotification(null)}
                    hasRejectedFields={Object.values(auditLog).some(a => a.status === 'rejected')}
                />

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Información Básica</h1>
                        <p className="text-slate-500 text-sm">Datos principales de tu organización.</p>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white rounded-xl flex items-center gap-2 px-5"><Pencil size={14} /> Editar</Button>
                    ) : (
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl" disabled={isNew}>Cancelar</Button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-600">
                        <span>Progreso</span>
                        <span>{score.filled}/{score.total} campos</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 transition-all duration-500" style={{ width: `${score.pct}%` }} />
                    </div>
                </div>

                <div className="space-y-6">
                    <IdentityCorporate
                        data={data} setData={setData} errors={errors} isEditing={isEditing}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={auditLog} setChangeRequestField={setChangeRequestField}
                        LEGAL_STATUSES={LEGAL_STATUSES}
                    />

                    <LegalRepresentative
                        data={data} setData={setData} errors={errors} isEditing={isEditing}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={auditLog} setChangeRequestField={setChangeRequestField}
                    />

                    <LocationContact
                        data={data} setData={setData} errors={errors} isEditing={isEditing}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={auditLog} setChangeRequestField={setChangeRequestField}
                        departments={departments} cities={cities}
                        loadingDeps={loadingDeps} loadingCities={loadingCities}
                    />

                    {isEditing && (
                        <div className="sticky bottom-6 left-0 right-0 flex justify-end gap-3 z-30">
                            <Button type="button" onClick={handleSaveDraft} disabled={processing} className="bg-white border-slate-200 text-slate-700 rounded-xl px-6 shadow-lg hover:bg-slate-50"><Save size={16} className="mr-2" /> Guardar Borrador</Button>
                            <Button type="button" onClick={() => handleSubmit()} disabled={processing} className="bg-slate-900 text-white rounded-xl px-8 shadow-xl hover:bg-slate-800"><Send size={16} className="mr-2" /> {processing ? 'Enviando...' : 'Enviar a Revisión'}</Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

