import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Pencil, Save, Send, ChevronLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ChangeRequestModal } from '@/Components/ChangeRequestModal';

// Parts
import HumanTalent from './Parts/HumanTalent';
import SectorPEP from './Parts/SectorPEP';
import ClassificationIncome from './Parts/ClassificationIncome';
import TrainingGuilds from './Parts/TrainingGuilds';
import AlertsForms from './Parts/AlertsForms';

interface Props {
    auth: any;
    flash: any;
    initialAssociate?: any;
}

const FIELD_LABELS: Record<string, string> = {
    employees_tech:             'Personal Técnico',
    employees_prof:             'Personal Profesional',
    employees_admin:            'Personal Administrativo',
    employees_exec:             'Personal Directivo',
    employees_other:            'Otros Perfiles',
    employees_other_desc:       'Descripción Otros Perfiles',
    employees_direct_count:     'Total Empleados Directos',
    hydrocarbons_participation: 'Participación Hidrocarburos',
    hydrocarbons_level:         'Alcance Hidrocarburos',
    pep_declaration:            'Declaración PEP',
    pep_name:                   'Nombre del PEP',
    pep_doc_type:               'Tipo Documento PEP',
    pep_entity:                 'Entidad del PEP',
    other_guilds:               'Otros Gremios',
    capacitation_plan:          'Plan de Capacitación',
    capacitation_level:         'Prioridad Capacitación',
    capacitation_no_reason:     'Motivo Sin Plan',
    company_classification:     'Clasificación Empresa',
    public_income_pct:          '% Ingresos Públicos',
    private_income_pct:         '% Ingresos Privados',
};

const REQUIRED_FIELDS = [
    'employees_tech',
    'employees_prof',
    'employees_admin',
    'employees_exec',
    'employees_other',
    'employees_direct_count',
    'company_classification',
    'public_income_pct',
    'private_income_pct',
    'hydrocarbons_participation',
    'pep_declaration',
    'capacitation_plan',
];

export default function CharacterizationIndex({ auth, flash, initialAssociate }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'draft' | 'error'; msg: string } | null>(null);
    const [changeRequestField, setChangeRequestField] = useState<string | null>(null);
    const [changeRequesting, setChangeRequesting] = useState(false);

    const associateStatus = initialAssociate?.status || 'draft';
    const auditLog = initialAssociate?.audit_log || {};

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        employees_tech:             initialAssociate?.employees_tech             || 0,
        employees_prof:             initialAssociate?.employees_prof             || 0,
        employees_admin:            initialAssociate?.employees_admin            || 0,
        employees_exec:             initialAssociate?.employees_exec             || 0,
        employees_other:            initialAssociate?.employees_other            || 0,
        employees_other_desc:       initialAssociate?.employees_other_desc       || '',
        employees_direct_count:     initialAssociate?.employees_direct_count     || 0,
        hydrocarbons_participation: initialAssociate?.hydrocarbons_participation ?? null,
        hydrocarbons_level:         initialAssociate?.hydrocarbons_level         || '',
        pep_declaration:            initialAssociate?.pep_declaration            ?? null,
        pep_name:                   initialAssociate?.pep_name                   || '',
        pep_doc_type:               initialAssociate?.pep_doc_type               || '',
        pep_entity:                 initialAssociate?.pep_entity                 || '',
        other_guilds:               initialAssociate?.other_guilds               || '',
        capacitation_plan:          initialAssociate?.capacitation_plan          ?? null,
        capacitation_level:         initialAssociate?.capacitation_level         || '',
        capacitation_no_reason:     initialAssociate?.capacitation_no_reason     || '',
        company_classification:     initialAssociate?.company_classification     || '',
        public_income_pct:          initialAssociate?.public_income_pct         || 0,
        private_income_pct:         initialAssociate?.private_income_pct        || 0,
    });

    const totalIncome = Number(data.public_income_pct) + Number(data.private_income_pct);
    const hasRejectedFields = Object.values(auditLog).some((f: any) => f.status === 'rejected');

    // ── Field status & lock ──────────────────────────────────────────────────
    // Solo heredamos el status global si el admin ya revisó al menos un campo
    // de Caracterización. Si no hay ninguna entrada, la sección nunca fue auditada
    // y todos los campos deben quedar editables (evita "En revisión" tras un draft save).
    const charWasEverReviewed = Object.keys(FIELD_LABELS).some(f => !!auditLog[f]);

    const fieldStatus = (field: string) => {
        const audit = auditLog[field];
        if (audit) {
            if (audit.status === 'approved' && audit.change_request) return 'change_requested';
            if (audit.status === 'approved') return 'approved';
            if (audit.status === 'rejected') return 'rejected';
            if (audit.status === 'editable') return 'editable';
            if (audit.status === 'pending') return 'pending';
        }

        if (charWasEverReviewed && ['pending', 'approved', 'verified', 'rejected'].includes(associateStatus)) {
            const saved = initialAssociate?.[field];
            const isUnsubmitted = saved === null ||
                                   saved === undefined ||
                                   (typeof saved === 'number' && saved === 0) ||
                                   (typeof saved === 'string' && saved.trim() === '') ||
                                   (saved === false && !auditLog[field]);
            if (isUnsubmitted) return 'editable';
            return associateStatus;
        }

        return 'editable';
    };

    // Campos hijos que heredan el desbloqueo del padre cuando el padre está editable
    const CHILD_PARENT_MAP: Record<string, string> = {
        hydrocarbons_level:    'hydrocarbons_participation',
        pep_name:              'pep_declaration',
        pep_doc_type:          'pep_declaration',
        pep_entity:            'pep_declaration',
        capacitation_level:    'capacitation_plan',
        capacitation_no_reason:'capacitation_plan',
    };

    const isLocked = (field: string) => {
        if (!isEditing) return true;
        const status = fieldStatus(field);

        // Si el campo padre fue desbloqueado por el admin, el hijo también se desbloquea
        const parentField = CHILD_PARENT_MAP[field];
        if (parentField && fieldStatus(parentField) === 'editable') return false;

        const isRejectedGlobal = status === 'rejected' && auditLog[field]?.status !== 'rejected';
        return status === 'approved' ||
               status === 'change_requested' ||
               status === 'pending' ||
               status === 'verified' ||
               isRejectedGlobal;
    };

    const isRequired = (field: string) => REQUIRED_FIELDS.includes(field);

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

    // ── Completion score ─────────────────────────────────────────────────────
    const score = (() => {
        const filled = REQUIRED_FIELDS.filter(f => {
            const val = data[f as keyof typeof data];
            if (val === null || val === undefined) return false;
            if (typeof val === 'boolean') return true;
            if (typeof val === 'number') return val > 0;
            return String(val).trim() !== '';
        }).length;
        return { filled, total: REQUIRED_FIELDS.length, pct: Math.round((filled / REQUIRED_FIELDS.length) * 100) };
    })();

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        clearErrors();

        const missing = REQUIRED_FIELDS.filter(f => {
            const val = data[f as keyof typeof data];
            if (val === null || val === undefined) return true;
            if (typeof val === 'boolean') return false;
            if (typeof val === 'number') return false;
            return String(val).trim() === '';
        });

        if (totalIncome !== 100) {
            setError('public_income_pct' as any, 'La suma de ingresos debe ser exactamente 100%');
            setError('private_income_pct' as any, 'La suma de ingresos debe ser exactamente 100%');
            return;
        }

        if (missing.length > 0) {
            missing.forEach(f => setError(f as any, 'Este campo es obligatorio para enviar a revisión'));
            return;
        }

        post(route('associate.company.update.characterization'));
    };

    const handleSaveDraft = () => {
        post(route('associate.company.save.characterization.draft'));
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

    return (
        <AppLayout>
            <Head title="Caracterización" />

            {changeRequestField && (
                <ChangeRequestModal
                    field={changeRequestField}
                    fieldLabel={FIELD_LABELS[changeRequestField]}
                    onClose={() => setChangeRequestField(null)}
                    onSubmit={handleRequestChange}
                    isSubmitting={changeRequesting}
                />
            )}

            <div className="max-w-5xl mx-auto space-y-8 pb-20 font-sans">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Link href={route('dashboard')} className="hover:text-slate-900 transition-colors">Dashboard</Link>
                            <ChevronLeft size={14} className="rotate-180" />
                            <span className="text-slate-900 font-bold">Caracterización</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Caracterización</h1>
                        <p className="text-slate-500 text-sm font-medium">Perfil operativo, talento humano y distribución de ingresos.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isEditing ? (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-2 px-6 h-12 shadow-lg shadow-slate-200 transition-all active:scale-95"
                            >
                                <Pencil size={16} /> Editar Información
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                className="border-slate-200 text-slate-600 rounded-xl h-12 px-6 hover:bg-slate-50 transition-all font-bold"
                            >
                                Cancelar
                            </Button>
                        )}
                    </div>
                </div>

                <AlertsForms
                    isNew={false}
                    associateStatus={associateStatus}
                    notification={notification}
                    onCloseNotification={() => setNotification(null)}
                    hasRejectedFields={hasRejectedFields}
                />

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

                <div className="space-y-8 animate-in fade-in duration-500">
                    <HumanTalent
                        data={data} setData={setData} errors={errors} isEditing={isEditing}
                        isLocked={isLocked} fieldStatus={fieldStatus}
                        auditLog={auditLog} isRequired={isRequired}
                        setChangeRequestField={setChangeRequestField}
                    />

                    <SectorPEP
                        data={data} setData={setData} errors={errors} isEditing={isEditing}
                        isLocked={isLocked} fieldStatus={fieldStatus}
                        auditLog={auditLog} isRequired={isRequired}
                        setChangeRequestField={setChangeRequestField}
                    />

                    <ClassificationIncome
                        data={data} setData={setData} errors={errors} isEditing={isEditing}
                        isLocked={isLocked} fieldStatus={fieldStatus}
                        auditLog={auditLog} isRequired={isRequired}
                        setChangeRequestField={setChangeRequestField}
                    />

                    <TrainingGuilds
                        data={data} setData={setData} errors={errors} isEditing={isEditing}
                        isLocked={isLocked} fieldStatus={fieldStatus}
                        auditLog={auditLog} isRequired={isRequired}
                        setChangeRequestField={setChangeRequestField}
                    />

                    {isEditing && (
                        <div className="sticky bottom-6 left-0 right-0 flex justify-end gap-3 z-30">
                            <Button type="button" onClick={handleSaveDraft} disabled={processing} className="bg-white border-slate-200 text-slate-700 rounded-xl px-6 shadow-lg hover:bg-slate-50">
                                <Save size={16} className="mr-2" /> Guardar Borrador
                            </Button>
                            <Button type="button" onClick={() => handleSubmit()} disabled={processing || totalIncome !== 100} className="bg-slate-900 text-white rounded-xl px-8 shadow-xl hover:bg-slate-800">
                                <Send size={16} className="mr-2" /> {processing ? 'Enviando...' : 'Enviar a Revisión'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
