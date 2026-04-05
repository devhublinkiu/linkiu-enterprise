import React from 'react';
import { Input } from '@/Components/ui/Input';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldWrapper } from '@/Components/FieldWrapper';

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
}

export default function CommerceBilling({
    data,
    setData,
    errors,
    isEditing,
    isLocked,
    fieldStatus,
    isRequired,
    auditLog,
    setChangeRequestField
}: Props) {
    
    const toggleCompanyType = (type: string) => {
        const current = data.company_type || [];
        setData('company_type', current.includes(type) ? current.filter((t: string) => t !== type) : [...current, type]);
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                    <Briefcase size={14} className="text-white" />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Información Comercial y Facturación</h2>
            </div>

            <div className="p-6 space-y-7 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldWrapper
                        label="CIIU Principal"
                        fieldId="main_ciiu"
                        auditLog={auditLog}
                        required={isRequired('main_ciiu')}
                        status={fieldStatus('main_ciiu')}
                        error={errors.main_ciiu}
                        onRequestChange={isEditing && fieldStatus('main_ciiu') === 'approved' ? () => setChangeRequestField('main_ciiu') : undefined}
                    >
                        <Input
                            value={data.main_ciiu}
                            onChange={e => setData('main_ciiu', e.target.value)}
                            disabled={isLocked('main_ciiu')}
                            placeholder="Ej. 4111"
                            className={cn("text-sm h-10 transition-all", isLocked('main_ciiu') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                        />
                    </FieldWrapper>

                    <FieldWrapper
                        label="CIIU Secundario"
                        fieldId="secondary_ciiu"
                        auditLog={auditLog}
                        required={isRequired('secondary_ciiu')}
                        status={fieldStatus('secondary_ciiu')}
                        error={errors.secondary_ciiu}
                        onRequestChange={isEditing && fieldStatus('secondary_ciiu') === 'approved' ? () => setChangeRequestField('secondary_ciiu') : undefined}
                    >
                        <Input
                            value={data.secondary_ciiu}
                            onChange={e => setData('secondary_ciiu', e.target.value)}
                            disabled={isLocked('secondary_ciiu')}
                            placeholder="Opcional"
                            className={cn("text-sm h-10 transition-all", isLocked('secondary_ciiu') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                        />
                    </FieldWrapper>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldWrapper
                        label="Email para Facturación Electrónica"
                        fieldId="billing_email"
                        auditLog={auditLog}
                        required={isRequired('billing_email')}
                        status={fieldStatus('billing_email')}
                        error={errors.billing_email}
                        onRequestChange={isEditing && fieldStatus('billing_email') === 'approved' ? () => setChangeRequestField('billing_email') : undefined}
                    >
                        <Input
                            type="email"
                            value={data.billing_email}
                            onChange={e => setData('billing_email', e.target.value)}
                            disabled={isLocked('billing_email')}
                            placeholder="facturacion@empresa.com"
                            className={cn("h-10 text-sm transition-all", isLocked('billing_email') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                        />
                    </FieldWrapper>

                    <FieldWrapper
                        label="Perfil de Operación"
                        fieldId="company_type"
                        auditLog={auditLog}
                        required={isRequired('company_type')}
                        status={fieldStatus('company_type')}
                        error={errors.company_type}
                        onRequestChange={isEditing && fieldStatus('company_type') === 'approved' ? () => setChangeRequestField('company_type') : undefined}
                    >
                        <div className="flex flex-wrap gap-2 pt-1">
                            {['Suministros', 'Constructor', 'Consultor', 'Proveedor', 'Otros'].map(type => (
                                <button key={type} type="button"
                                    onClick={() => !isLocked('company_type') && toggleCompanyType(type)}
                                    disabled={isLocked('company_type')}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[11px] font-bold transition-all border uppercase",
                                        data.company_type?.includes(type)
                                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700",
                                        isLocked('company_type') && "opacity-40 cursor-not-allowed pointer-events-none"
                                    )}
                                >{type}</button>
                            ))}
                        </div>
                    </FieldWrapper>
                </div>
            </div>
        </section>
    );
}
