import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Pencil, Save, Send, ChevronLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ChangeRequestModal } from '@/Components/ChangeRequestModal';

// Parts
import Directory from './Parts/Directory';
import CommerceBilling from './Parts/CommerceBilling';
import SupportReferences from './Parts/SupportReferences';
import DigitalChannels from './Parts/DigitalChannels';
import AlertsForms from '../BasicInfo/Parts/AlertsForms';

interface Props {
    auth: any;
    flash: any;
    initialAssociate?: any;
}

const FIELD_LABELS: Record<string, string> = {
    contacts:         'Directorio de Contactos',
    main_ciiu:        'CIIU Principal',
    secondary_ciiu:   'CIIU Secundario',
    billing_email:    'Email de Facturación',
    company_type:     'Tipo de Empresa',
    references:       'Referencias de Respaldo',
    social_instagram: 'Instagram',
    social_facebook:  'Facebook',
    social_linkedin:  'LinkedIn',
    social_other:     'Otros / Portafolio',
};

const REQUIRED_FIELDS = ['contacts', 'main_ciiu', 'billing_email', 'company_type', 'references'];

export default function ContactsIndex({ auth, flash, initialAssociate }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'draft' | 'error'; msg: string } | null>(null);
    const [changeRequestField, setChangeRequestField] = useState<string | null>(null);
    const [changeRequesting, setChangeRequesting] = useState(false);

    const associateStatus = initialAssociate?.status || 'draft';
    const auditLog: Record<string, any> = initialAssociate?.audit_log || {};

    const { data, setData, post, processing, errors } = useForm({
        contacts:         initialAssociate?.contacts         || [{ area: 'Gerencia', name: '', position: '', email: '', phone: '' }],
        main_ciiu:        initialAssociate?.main_ciiu        || '',
        secondary_ciiu:   initialAssociate?.secondary_ciiu   || '',
        billing_email:    initialAssociate?.billing_email    || '',
        company_type:     initialAssociate?.company_type     || [],
        references:       initialAssociate?.references       || [{ type: 'commercial', name: '', contact_person: '', position: '', email: '', phone: '' }],
        social_instagram: initialAssociate?.social_instagram || '',
        social_facebook:  initialAssociate?.social_facebook  || '',
        social_linkedin:  initialAssociate?.social_linkedin  || '',
        social_other:     initialAssociate?.social_other     || '',
    });

    const hasRejectedFields = Object.values(auditLog).some((f: any) => f.status === 'rejected');

    // ── Field status & lock ──────────────────────────────────────────────────
    // Solo heredamos el status global si el admin ya revisó al menos un campo
    // de Contactos. Evita que el "pending" de Información Básica bleed aquí.
    const contactsWasEverReviewed = Object.keys(FIELD_LABELS).some(f => !!auditLog[f]);

    const fieldStatus = (field: string) => {
        const audit = auditLog[field];
        if (audit) {
            if (audit.status === 'approved' && audit.change_request) return 'change_requested';
            if (audit.status === 'approved') return 'approved';
            if (audit.status === 'rejected') return 'rejected';
            if (audit.status === 'editable') return 'editable';
            if (audit.status === 'pending') return 'pending';
        }

        if (contactsWasEverReviewed && ['pending', 'approved', 'verified', 'rejected'].includes(associateStatus)) {
            const saved = initialAssociate?.[field];
            const isUnsubmitted = saved === null ||
                                   saved === undefined ||
                                   (typeof saved === 'string' && saved.trim() === '') ||
                                   (Array.isArray(saved) && saved.length === 0);
            if (isUnsubmitted) return 'editable';
            return associateStatus;
        }

        return 'editable';
    };

    const isLocked = (field: string) => {
        if (!isEditing) return true;
        const status = fieldStatus(field);
        const isRejectedGlobal = status === 'rejected' && auditLog[field]?.status !== 'rejected';
        return status === 'approved' ||
               status === 'change_requested' ||
               status === 'pending' ||
               status === 'verified' ||
               isRejectedGlobal;
    };

    const isRequired = (field: string) => REQUIRED_FIELDS.includes(field);

    // ── Completion score ─────────────────────────────────────────────────────
    const score = (() => {
        const checks = [
            data.contacts?.some((c: any) => c.name?.trim()),
            !!data.main_ciiu?.trim(),
            !!data.billing_email?.trim(),
            data.company_type?.length > 0,
            data.references?.some((r: any) => r.name?.trim()),
        ];
        const filled = checks.filter(Boolean).length;
        return { filled, total: checks.length, pct: Math.round((filled / checks.length) * 100) };
    })();

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

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        post(route('associate.company.update.contacts'));
    };

    const handleSaveDraft = () => {
        post(route('associate.company.save.contacts.draft'));
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
            <Head title="Contactos y Referencias" />

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
                            <span className="text-slate-900 font-bold">Contactos</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Contactos y Referencias</h1>
                        <p className="text-slate-500 text-sm font-medium">Directorio, facturación, referencias y canales digitales.</p>
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
                    <Directory
                        data={data} setData={setData} errors={errors} isEditing={isEditing}
                        isLocked={isLocked} fieldStatus={fieldStatus} auditLog={auditLog}
                        isRequired={isRequired} setChangeRequestField={setChangeRequestField}
                    />

                    <CommerceBilling
                        data={data} setData={setData} errors={errors} isEditing={isEditing}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={auditLog} setChangeRequestField={setChangeRequestField}
                    />

                    <SupportReferences
                        data={data} setData={setData} errors={errors} isEditing={isEditing}
                        isLocked={isLocked} fieldStatus={fieldStatus} auditLog={auditLog}
                        isRequired={isRequired} setChangeRequestField={setChangeRequestField}
                    />

                    <DigitalChannels
                        data={data} setData={setData} errors={errors} isEditing={isEditing}
                        isLocked={isLocked} fieldStatus={fieldStatus} auditLog={auditLog}
                        setChangeRequestField={setChangeRequestField}
                    />

                    {isEditing && (
                        <div className="sticky bottom-6 left-0 right-0 flex justify-end gap-3 z-30">
                            <Button type="button" onClick={handleSaveDraft} disabled={processing} className="bg-white border-slate-200 text-slate-700 rounded-xl px-6 shadow-lg hover:bg-slate-50">
                                <Save size={16} className="mr-2" /> Guardar Borrador
                            </Button>
                            <Button type="button" onClick={handleSubmit} disabled={processing} className="bg-slate-900 text-white rounded-xl px-8 shadow-xl hover:bg-slate-800">
                                <Send size={16} className="mr-2" /> {processing ? 'Enviando...' : 'Enviar a Revisión'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
