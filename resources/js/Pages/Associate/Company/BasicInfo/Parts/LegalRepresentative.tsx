import React from 'react';
import { Input } from '@/Components/ui/Input';
import { FieldWrapper } from '@/Components/FieldWrapper';
import { User } from 'lucide-react';
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
}

export default function LegalRepresentative({
    data,
    setData,
    errors,
    isEditing,
    isLocked,
    fieldStatus,
    isRequired,
    auditLog,
    setChangeRequestField,
}: Props) {
    return (
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
                        fieldId="rep_name"
                        auditLog={auditLog}
                        required={isRequired('rep_name')}
                        status={fieldStatus('rep_name')}
                        error={errors.rep_name}
                        onRequestChange={isEditing && fieldStatus('rep_name') === 'approved' ? () => setChangeRequestField('rep_name') : undefined}
                    >
                        <Input
                            value={data.rep_name}
                            onChange={e => setData('rep_name', e.target.value)}
                            disabled={isLocked('rep_name')}
                            placeholder="Nombre completo"
                            className={cn("text-sm", isLocked('rep_name') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                        />
                    </FieldWrapper>

                    <FieldWrapper label="Cargo" 
                        fieldId="rep_position"
                        auditLog={auditLog}
                        required={isRequired('rep_position')}
                        status={fieldStatus('rep_position')} 
                        error={errors.rep_position}
                        onRequestChange={isEditing && fieldStatus('rep_position') === 'approved' ? () => setChangeRequestField('rep_position') : undefined}
                    >
                        <Input
                            value={data.rep_position}
                            onChange={e => setData('rep_position', e.target.value)}
                            disabled={isLocked('rep_position')}
                            placeholder="Ej. Gerente General"
                            className={cn("text-sm", isLocked('rep_position') && "bg-slate-50 text-slate-500 cursor-not-allowed")}
                        />
                    </FieldWrapper>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FieldWrapper label="Tipo de Documento" 
                        fieldId="rep_doc_type"
                        auditLog={auditLog}
                        required={isRequired('rep_doc_type')}
                        status={fieldStatus('rep_doc_type')} 
                        error={errors.rep_doc_type}
                        onRequestChange={isEditing && fieldStatus('rep_doc_type') === 'approved' ? () => setChangeRequestField('rep_doc_type') : undefined}
                    >
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
                        <FieldWrapper label="Número de Documento" 
                            fieldId="rep_doc"
                            auditLog={auditLog}
                            required={isRequired('rep_doc')}
                            status={fieldStatus('rep_doc')} 
                            error={errors.rep_doc}
                            onRequestChange={isEditing && fieldStatus('rep_doc') === 'approved' ? () => setChangeRequestField('rep_doc') : undefined}
                        >
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
    );
}
