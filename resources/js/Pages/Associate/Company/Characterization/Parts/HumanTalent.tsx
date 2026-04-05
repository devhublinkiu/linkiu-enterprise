import React, { useEffect } from 'react';
import { Input } from '@/Components/ui/Input';
import { FieldWrapper } from '@/Components/FieldWrapper';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    data: any;
    setData: (key: string | any, value?: any) => void;
    errors: any;
    isEditing: boolean;
    isLocked: (field: string) => boolean;
    fieldStatus: (field: string) => any;
    auditLog: any;
    isRequired: (field: string) => boolean;
    setChangeRequestField: (field: string) => void;
}

const EMPLOYEE_CATS = [
    { id: 'employees_tech',  label: 'Técnico' },
    { id: 'employees_prof',  label: 'Profesional' },
    { id: 'employees_admin', label: 'Administrativo' },
    { id: 'employees_exec',  label: 'Directivo' },
    { id: 'employees_other', label: 'Otros' },
];

export default function HumanTalent({
    data,
    setData,
    errors,
    isEditing,
    isLocked,
    fieldStatus,
    auditLog,
    isRequired,
    setChangeRequestField,
}: Props) {
    // Auto-sum employees
    useEffect(() => {
        const total = (data.employees_tech || 0)
            + (data.employees_prof || 0)
            + (data.employees_admin || 0)
            + (data.employees_exec || 0)
            + (data.employees_other || 0);
        if (total !== data.employees_direct_count) {
            setData('employees_direct_count', total);
        }
    }, [data.employees_tech, data.employees_prof, data.employees_admin, data.employees_exec, data.employees_other]);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden ">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                        <Users size={14} className="text-white" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Talento Humano</h2>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 text-white rounded-xl px-4 py-1.5 ">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total</span>
                    <span className="text-lg font-black">{data.employees_direct_count}</span>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {EMPLOYEE_CATS.map(cat => (
                        <FieldWrapper
                            key={cat.id}
                            label={cat.label}
                            fieldId={cat.id}
                            auditLog={auditLog}
                            status={fieldStatus(cat.id)}
                            error={errors[cat.id]}
                            required={isRequired(cat.id)}
                            compact
                            onRequestChange={isEditing && fieldStatus(cat.id) === 'approved' ? () => setChangeRequestField(cat.id) : undefined}
                        >
                            <Input
                                type="number"
                                min="0"
                                value={data[cat.id] > 0 ? data[cat.id] : ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    setData(cat.id, val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                                }}
                                disabled={isLocked(cat.id)}
                                placeholder="0"
                                className={cn(
                                    "text-center text-sm font-black py-5 rounded-xl border-2 transition-all",
                                    isLocked(cat.id) ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed" : "border-slate-200 focus:border-slate-900"
                                )}
                            />
                        </FieldWrapper>
                    ))}
                </div>

                {data.employees_other > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                        <FieldWrapper
                            label='Descripción de "Otros" perfiles'
                            fieldId="employees_other_desc"
                            auditLog={auditLog}
                            status={fieldStatus('employees_other_desc')}
                            error={errors.employees_other_desc}
                            required={isRequired('employees_other_desc')}
                            onRequestChange={isEditing && fieldStatus('employees_other_desc') === 'approved' ? () => setChangeRequestField('employees_other_desc') : undefined}
                        >
                            <Input
                                value={data.employees_other_desc}
                                onChange={e => setData('employees_other_desc', e.target.value)}
                                disabled={isLocked('employees_other_desc')}
                                placeholder="Especifique los cargos adicionales..."
                                className={cn("text-sm rounded-xl py-5", isLocked('employees_other_desc') && "bg-slate-50 text-slate-400 cursor-not-allowed")}
                            />
                        </FieldWrapper>
                    </div>
                )}
            </div>
        </section>
    );
}
