import React from 'react';
import { Input } from '@/Components/ui/Input';
import { FieldWrapper } from '@/Components/FieldWrapper';
import { Building2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    data: any;
    setData: (key: string | any, value?: any) => void;
    errors: any;
    isEditing: boolean;
    isLocked: (field: string) => boolean;
    fieldStatus: (field: string) => any;
    isRequired: (field: string) => boolean;
    auditLog: any;
    setChangeRequestField: (field: string) => void;
    LEGAL_STATUSES: string[];
}

export default function IdentityCorporate({
    data,
    setData,
    errors,
    isEditing,
    isLocked,
    fieldStatus,
    isRequired,
    auditLog,
    setChangeRequestField,
    LEGAL_STATUSES
}: Props) {
    const isCustomLegalStatus = data.legal_status && !LEGAL_STATUSES.includes(data.legal_status);
    return (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center">
                    <Building2 size={14} className="text-white" />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Identificación Corporativa</h2>
            </div>

            <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldWrapper
                        label="Razón Social"
                        fieldId="company_name"
                        auditLog={auditLog}
                        required={isRequired('company_name')}
                        status={fieldStatus('company_name')}
                        error={errors.company_name}
                        onRequestChange={isEditing && fieldStatus('company_name') === 'approved' ? () => setChangeRequestField('company_name') : undefined}
                    >
                        <Input
                            value={data.company_name}
                            onChange={e => setData('company_name', e.target.value)}
                            disabled={isLocked('company_name')}
                            placeholder="Ej. Asociación de Constructores del Valle"
                            className={cn("text-sm", isLocked('company_name') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                        />
                    </FieldWrapper>

                    <FieldWrapper label="Sigla" 
                        fieldId="initials"
                        auditLog={auditLog}
                        status={fieldStatus('initials')}
                        required={isRequired('initials')}
                        error={errors.initials}
                        onRequestChange={isEditing && fieldStatus('initials') === 'approved' ? () => setChangeRequestField('initials') : undefined}
                    >
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
                    <FieldWrapper
                        label="NIT"
                        fieldId="nit"
                        auditLog={auditLog}
                        required={isRequired('nit')}
                        status={fieldStatus('nit')}
                        error={errors.nit}
                        onRequestChange={isEditing && fieldStatus('nit') === 'approved' ? () => setChangeRequestField('nit') : undefined}
                    >
                        <Input
                            value={data.nit}
                            onChange={e => setData('nit', e.target.value)}
                            disabled={isLocked('nit')}
                            readOnly={isLocked('nit')}
                            placeholder="Ej. 900123456-7"
                            className={cn("text-sm font-mono", isLocked('nit') && "bg-slate-50 text-slate-500 cursor-not-allowed pointer-events-none opacity-60")}
                        />
                    </FieldWrapper>

                    <FieldWrapper
                        label="Fecha de Constitución" 
                        fieldId="constitution_date"
                        auditLog={auditLog}
                        status={fieldStatus('constitution_date')} 
                        required={isRequired('constitution_date')}
                        error={errors.constitution_date}
                        hint={!isLocked('constitution_date') ? "Formato: Año-Mes-Día" : undefined}
                        onRequestChange={isEditing && fieldStatus('constitution_date') === 'approved' ? () => setChangeRequestField('constitution_date') : undefined}
                    >
                        <div className={cn("relative", isLocked('constitution_date') && "pointer-events-none")}>
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <Input
                                type={isLocked('constitution_date') ? "text" : "date"}
                                value={data.constitution_date}
                                onChange={e => setData('constitution_date', e.target.value)}
                                disabled={isLocked('constitution_date')}
                                readOnly={isLocked('constitution_date')}
                                placeholder={isLocked('constitution_date') ? "AAAA/MM/DD" : undefined}
                                className={cn("text-sm pl-9", isLocked('constitution_date') && "bg-slate-50 text-slate-500 cursor-not-allowed opacity-80")}
                            />
                        </div>
                    </FieldWrapper>

                    <FieldWrapper
                        label="País de Origen"
                        fieldId="country_origin"
                        auditLog={auditLog}
                        required={isRequired('country_origin')}
                        status={fieldStatus('country_origin')}
                        error={errors.country_origin}
                        onRequestChange={isEditing && fieldStatus('country_origin') === 'approved' ? () => setChangeRequestField('country_origin') : undefined}
                    >
                        <Input
                            value={data.country_origin}
                            onChange={e => setData('country_origin', e.target.value)}
                            disabled={isLocked('country_origin')}
                            placeholder="Ej. Colombia"
                            className={cn("text-sm", isLocked('country_origin') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                        />
                    </FieldWrapper>
                </div>

                <FieldWrapper
                    label="Tipo de Sociedad"
                    fieldId="legal_status"
                    auditLog={auditLog}
                    required={isRequired('legal_status')}
                    status={fieldStatus('legal_status')}
                    error={errors.legal_status}
                    onRequestChange={isEditing && fieldStatus('legal_status') === 'approved' ? () => setChangeRequestField('legal_status') : undefined}
                >
                    <div className="space-y-3">
                        <div className="flex gap-2 flex-wrap">
                            {LEGAL_STATUSES.map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => {
                                        if (isLocked('legal_status')) return;
                                        setData((d: any) => ({
                                            ...d,
                                            legal_status: t,
                                            legal_status_other: t !== 'Otro' ? '' : d.legal_status_other,
                                        }));
                                    }}
                                    disabled={isLocked('legal_status')}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                        (data.legal_status === t || (t === 'Otro' && isCustomLegalStatus))
                                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700",
                                        isLocked('legal_status') && "opacity-40 cursor-not-allowed pointer-events-none"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        {(data.legal_status === 'Otro' || isCustomLegalStatus) && !isLocked('legal_status') && (
                            <Input
                                value={data.legal_status_other || (isCustomLegalStatus ? data.legal_status : '')}
                                onChange={e => setData((d: any) => ({
                                    ...d,
                                    legal_status: 'Otro',
                                    legal_status_other: e.target.value,
                                }))}
                                placeholder="Especifica el tipo de sociedad"
                                className="text-sm"
                                autoFocus={data.legal_status === 'Otro' && !isCustomLegalStatus}
                            />
                        )}
                    </div>
                </FieldWrapper>
            </div>
        </section>
    );
}
