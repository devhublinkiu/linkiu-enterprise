import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Save, Send } from 'lucide-react';
import SectionReviewBanner, { SectionReview } from '@/Components/SectionReviewBanner';

import HumanTalent from './Parts/HumanTalent';
import SectorPEP from './Parts/SectorPEP';
import ClassificationIncome from './Parts/ClassificationIncome';
import TrainingGuilds from './Parts/TrainingGuilds';

interface Props {
    auth: any;
    flash: any;
    initialAssociate?: any;
}

const REQUIRED_FIELDS = [
    'employees_tech', 'employees_prof', 'employees_admin', 'employees_exec',
    'employees_other', 'employees_direct_count', 'company_classification',
    'public_income_pct', 'private_income_pct', 'hydrocarbons_participation',
    'pep_declaration', 'capacitation_plan',
];

export default function CharacterizationIndex({ auth, flash, initialAssociate }: Props) {
    const sectionReview: SectionReview = initialAssociate?.section_reviews?.characterization ?? { status: 'draft' };
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

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        employees_tech:             initialAssociate?.employees_tech             ?? 0,
        employees_prof:             initialAssociate?.employees_prof             ?? 0,
        employees_admin:            initialAssociate?.employees_admin            ?? 0,
        employees_exec:             initialAssociate?.employees_exec             ?? 0,
        employees_other:            initialAssociate?.employees_other            ?? 0,
        employees_other_desc:       initialAssociate?.employees_other_desc       || '',
        employees_direct_count:     initialAssociate?.employees_direct_count     ?? 0,
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
        public_income_pct:          initialAssociate?.public_income_pct         ?? 0,
        private_income_pct:         initialAssociate?.private_income_pct        ?? 0,
    });

    const totalIncome = Number(data.public_income_pct) + Number(data.private_income_pct);

    const score = (() => {
        const filled = REQUIRED_FIELDS.filter(f => {
            const val = data[f as keyof typeof data];
            if (val === null || val === undefined) return false;
            if (typeof val === 'boolean') return true;
            if (typeof val === 'number') return val >= 0;
            return String(val).trim() !== '';
        }).length;
        return { filled, total: REQUIRED_FIELDS.length, pct: Math.round((filled / REQUIRED_FIELDS.length) * 100) };
    })();

    const isRequired  = (field: string) => REQUIRED_FIELDS.includes(field);
    const isLocked    = (_field: string) => !canEdit;
    const fieldStatus = (_field: string) => canEdit ? 'editable' : sectionStatus;

    const handleSubmit = () => {
        clearErrors();
        if (totalIncome !== 100) {
            setError('public_income_pct' as any, 'La suma de ingresos debe ser exactamente 100%');
            setError('private_income_pct' as any, 'La suma de ingresos debe ser exactamente 100%');
            return;
        }
        post(route('associate.company.update.characterization'));
    };

    const handleSaveDraft = () => {
        post(route('associate.company.save.characterization.draft'));
    };

    return (
        <AppLayout>
            <Head title="Caracterización" />
            <div className="max-w-4xl mx-auto space-y-5 pb-20">
                <SectionReviewBanner
                    section="characterization"
                    review={sectionReview}
                    notification={notification}
                    onCloseNotification={() => setNotification(null)}
                />

                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Caracterización</h1>
                    <p className="text-slate-500 text-sm">Talento humano, participación sectorial e ingresos.</p>
                </div>

                {/* Progress bar */}
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
                    <HumanTalent
                        data={data} setData={setData} errors={errors} isEditing={canEdit}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={{}} setChangeRequestField={() => {}}
                    />
                    <SectorPEP
                        data={data} setData={setData} errors={errors} isEditing={canEdit}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={{}} setChangeRequestField={() => {}}
                    />
                    <ClassificationIncome
                        data={data} setData={setData} errors={errors} isEditing={canEdit}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={{}} setChangeRequestField={() => {}}
                    />
                    <TrainingGuilds
                        data={data} setData={setData} errors={errors} isEditing={canEdit}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={{}} setChangeRequestField={() => {}}
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
