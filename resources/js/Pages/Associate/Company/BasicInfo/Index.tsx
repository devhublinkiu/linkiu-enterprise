import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Save, Send } from 'lucide-react';
import SectionReviewBanner, { SectionReview } from '@/Components/SectionReviewBanner';

import IdentityCorporate from './Parts/IdentityCorporate';
import LegalRepresentative from './Parts/LegalRepresentative';
import LocationContact from './Parts/LocationContact';

interface Props {
    auth: any;
    initialAssociate?: any;
    flash?: { success?: string; error?: string; draft_saved?: string };
}

const LEGAL_STATUSES = ['SAS', 'Ltda.', 'Anónima', 'ESAL', 'Cooperativa', 'Otro'];

const REQUIRED_FIELDS = [
    'company_name', 'nit', 'legal_status', 'department', 'city',
    'address', 'phone', 'rep_name', 'rep_doc', 'rep_doc_type', 'rep_position', 'country_origin',
];

function completionScore(data: any) {
    const filled = REQUIRED_FIELDS.filter(f => data[f] && String(data[f]).trim() !== '').length;
    return { filled, total: REQUIRED_FIELDS.length, pct: Math.round((filled / REQUIRED_FIELDS.length) * 100) };
}

export default function BasicInfo({ auth, initialAssociate, flash }: Props) {
    const sectionReview: SectionReview = initialAssociate?.section_reviews?.basicinfo ?? { status: 'draft' };
    const sectionStatus = sectionReview.status;
    const canEdit = ['draft', 'rejected'].includes(sectionStatus);
    const isNew = !initialAssociate;

    const [departments, setDepartments] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingDeps, setLoadingDeps] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'draft' | 'error'; msg: string } | null>(null);

    // Flash messages
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
        company_name:       initialAssociate?.company_name      || '',
        initials:           initialAssociate?.initials          || '',
        nit:                initialAssociate?.nit               || '',
        legal_status:       initialAssociate?.legal_status      || '',
        legal_status_other: '',
        constitution_date:  initialAssociate?.constitution_date ? initialAssociate.constitution_date.split('T')[0] : '',
        country_origin:     initialAssociate?.country_origin    || 'Colombia',
        phone:              initialAssociate?.phone             || '',
        website:            initialAssociate?.website           || '',
        department:         initialAssociate?.department        || '',
        department_id:      initialAssociate?.department_id     || null,
        city:               initialAssociate?.city              || '',
        city_id:            initialAssociate?.city_id           || null,
        address:            initialAssociate?.address           || '',
        rep_name:           initialAssociate?.rep_name          || '',
        rep_position:       initialAssociate?.rep_position      || '',
        rep_doc_type:       initialAssociate?.rep_doc_type      || '',
        rep_doc:            initialAssociate?.rep_doc           || '',
    });

    const score = completionScore(data);

    // Departments & cities
    useEffect(() => {
        const fetchDeps = async () => {
            setLoadingDeps(true);
            try {
                const res    = await fetch('https://api-colombia.com/api/v1/Department');
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
                    const res    = await fetch(`https://api-colombia.com/api/v1/Department/${data.department_id}/cities`);
                    const result = await res.json();
                    setCities(result.sort((a: any, b: any) => a.name.localeCompare(b.name)));
                } catch (e) { console.error('Error cities', e); }
                finally { setLoadingCities(false); }
            };
            fetchCities();
        }
    }, [data.department_id]);

    const isRequired = (field: string) => REQUIRED_FIELDS.includes(field);
    // Section-level lock: all fields locked when section is not editable
    const isLocked  = (_field: string) => !canEdit;
    const fieldStatus = (_field: string) => canEdit ? 'editable' : sectionStatus;

    const handleSubmit = () => {
        clearErrors();
        const missing = REQUIRED_FIELDS.filter(f => {
            const val = data[f as keyof typeof data];
            return !val || (typeof val === 'string' && val.trim() === '');
        });
        if (missing.length > 0) {
            missing.forEach(f => setError(f as any, 'Campo obligatorio'));
            document.querySelector('.text-red-500')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        post(route('associate.company.update.basic'));
    };

    const handleSaveDraft = () => {
        post(route('associate.company.save.draft'));
    };

    return (
        <AppLayout>
            <Head title="Información Básica" />
            <div className="max-w-4xl mx-auto space-y-5">
                <SectionReviewBanner
                    section="basicinfo"
                    review={sectionReview}
                    isNew={isNew}
                    notification={notification}
                    onCloseNotification={() => setNotification(null)}
                />

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Información Básica</h1>
                        <p className="text-slate-500 text-sm">Datos principales de tu organización.</p>
                    </div>
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
                    <IdentityCorporate
                        data={data} setData={setData} errors={errors} isEditing={canEdit}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={{}} setChangeRequestField={() => {}}
                        LEGAL_STATUSES={LEGAL_STATUSES}
                    />
                    <LegalRepresentative
                        data={data} setData={setData} errors={errors} isEditing={canEdit}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={{}} setChangeRequestField={() => {}}
                    />
                    <LocationContact
                        data={data} setData={setData} errors={errors} isEditing={canEdit}
                        isLocked={isLocked} fieldStatus={fieldStatus} isRequired={isRequired}
                        auditLog={{}} setChangeRequestField={() => {}}
                        departments={departments} cities={cities}
                        loadingDeps={loadingDeps} loadingCities={loadingCities}
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
