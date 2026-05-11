import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Save, Send } from 'lucide-react';
import SectionReviewBanner, { SectionReview } from '@/Components/SectionReviewBanner';

import Directory from './Parts/Directory';
import CommerceBilling from './Parts/CommerceBilling';
import SupportReferences from './Parts/SupportReferences';
import DigitalChannels from './Parts/DigitalChannels';

interface Props {
    auth: any;
    flash: any;
    initialAssociate?: any;
}

const REQUIRED_FIELDS = ['contacts', 'main_ciiu', 'billing_email', 'company_type', 'references'];

export default function ContactsIndex({ auth, flash, initialAssociate }: Props) {
    const sectionReview: SectionReview = initialAssociate?.section_reviews?.contacts ?? { status: 'draft' };
    const sectionStatus = sectionReview.status;
    const canEdit = ['draft', 'rejected'].includes(sectionStatus);

    const [notification, setNotification] = useState<{ type: 'success' | 'draft' | 'error'; msg: string } | null>(null);

    useEffect(() => {
        if (flash?.draft_saved) setNotification({ type: 'draft', msg: `Borrador guardado · ${flash.draft_saved}` });
        if (flash?.success)     setNotification({ type: 'success', msg: flash.success });
        if (flash?.error)       setNotification({ type: 'error', msg: flash.error });
        if (flash) {
            const t = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(t);
        }
    }, [flash]);

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

    const isRequired  = (field: string) => REQUIRED_FIELDS.includes(field);
    const isLocked    = (_field: string) => !canEdit;
    const fieldStatus = (_field: string) => canEdit ? 'editable' : sectionStatus;

    const handleSubmit  = () => post(route('associate.company.update.contacts'));
    const handleSaveDraft = () => post(route('associate.company.save.contacts.draft'));

    return (
        <AppLayout>
            <Head title="Contactos y Referencias" />
            <div className="max-w-5xl mx-auto space-y-5 pb-20">
                <SectionReviewBanner
                    section="contacts"
                    review={sectionReview}
                    notification={notification}
                    onCloseNotification={() => setNotification(null)}
                />

                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Contactos y Referencias</h1>
                    <p className="text-slate-500 text-sm">Directorio, facturación, referencias y canales digitales.</p>
                </div>

                {/* Progress bar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-600">
                        <span>Progreso</span>
                        <span>{score.filled}/{score.total} secciones</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 transition-all duration-500" style={{ width: `${score.pct}%` }} />
                    </div>
                </div>

                <div className="space-y-8">
                    <Directory
                        data={data} setData={setData} errors={errors} isEditing={canEdit}
                        isLocked={isLocked} fieldStatus={fieldStatus} auditLog={{}}
                        isRequired={isRequired} setChangeRequestField={() => {}}
                    />
                    <CommerceBilling
                        data={data} setData={setData} errors={errors} isEditing={canEdit}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={{}} setChangeRequestField={() => {}}
                    />
                    <SupportReferences
                        data={data} setData={setData} errors={errors} isEditing={canEdit}
                        isLocked={isLocked} fieldStatus={fieldStatus} auditLog={{}}
                        isRequired={isRequired} setChangeRequestField={() => {}}
                    />
                    <DigitalChannels
                        data={data} setData={setData} errors={errors} isEditing={canEdit}
                        isLocked={isLocked} fieldStatus={fieldStatus} auditLog={{}}
                        setChangeRequestField={() => {}}
                    />

                    {canEdit && (
                        <div className="sticky bottom-6 flex justify-end gap-3 z-30">
                            <Button type="button" onClick={handleSaveDraft} disabled={processing} className="bg-white border border-slate-200 text-slate-700 rounded-xl px-6 shadow-lg hover:bg-slate-50">
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
