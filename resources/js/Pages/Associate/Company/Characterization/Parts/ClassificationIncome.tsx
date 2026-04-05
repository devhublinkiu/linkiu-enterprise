import React from 'react';
import { Input } from '@/Components/ui/Input';
import { FieldWrapper } from '@/Components/FieldWrapper';
import { Label } from '@/Components/ui/Label';
import { Building } from 'lucide-react';
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

const INCOME_SECTORS = [
    { key: 'public_income_pct',  label: 'Sector Público',  color: 'bg-emerald-500' },
    { key: 'private_income_pct', label: 'Sector Privado',  color: 'bg-slate-900' },
] as const;

export default function ClassificationIncome({
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
    const totalIncome = Number(data.public_income_pct) + Number(data.private_income_pct);

    return (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden  font-sans">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                        <Building size={14} className="text-white" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Clasificación e Ingresos</h2>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Tamaño */}
                <FieldWrapper
                    label="Tamaño de la organización"
                    fieldId="company_classification"
                    auditLog={auditLog}
                    status={fieldStatus('company_classification')}
                    error={errors.company_classification}
                    required={isRequired('company_classification')}
                    onRequestChange={isEditing && fieldStatus('company_classification') === 'approved' ? () => setChangeRequestField('company_classification') : undefined}
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                        {['Grande', 'Mediana', 'Pequeña', 'Micro'].map(size => (
                            <button key={size} type="button"
                                onClick={() => !isLocked('company_classification') && setData('company_classification', size)}
                                disabled={isLocked('company_classification')}
                                className={cn(
                                    "p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center gap-2",
                                    data.company_classification === size
                                        ? "bg-slate-900 border-slate-900 shadow-md transform scale-[1.02]"
                                        : "bg-white border-slate-100 hover:border-slate-300",
                                    isLocked('company_classification') && "opacity-40 cursor-not-allowed pointer-events-none"
                                )}
                            >
                                <div className={cn("h-2.5 w-2.5 rounded-full", data.company_classification === size ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-slate-200")} />
                                <span className={cn("text-[10px] font-black uppercase tracking-wider", data.company_classification === size ? "text-white" : "text-slate-500")}>
                                    {size}
                                </span>
                            </button>
                        ))}
                    </div>
                </FieldWrapper>

                {/* Distribución de ingresos */}
                <div className="pt-6 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            Distribución de ingresos anual (%)
                        </Label>
                        <div className={cn(
                            "text-[11px] font-black px-4 py-1.5 rounded-full border  transition-all animate-in zoom-in-95",
                            totalIncome === 100
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                        )}>
                            Suma Total: <span className="text-sm ml-1">{totalIncome}%</span>
                            {totalIncome !== 100 && <span className="ml-1 opacity-70 underline decoration-2 underline-offset-4">Debe sumar 100%</span>}
                            {totalIncome === 100 && <span className="ml-1 text-emerald-500">✓</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {INCOME_SECTORS.map(s => (
                            <FieldWrapper
                                key={s.key}
                                label={s.label}
                                fieldId={s.key}
                                auditLog={auditLog}
                                status={fieldStatus(s.key)}
                                error={errors[s.key]}
                                required={isRequired(s.key)}
                                onRequestChange={isEditing && fieldStatus(s.key) === 'approved' ? () => setChangeRequestField(s.key) : undefined}
                            >
                                <div className="relative">
                                    <Input
                                        type="number" min="0" max="100"
                                        value={data[s.key] > 0 ? data[s.key] : ''}
                                        placeholder="0"
                                        onChange={e => {
                                            const val = e.target.value === '' ? 0 : Math.min(100, parseInt(e.target.value) || 0);
                                            const other = s.key === 'public_income_pct' ? 'private_income_pct' : 'public_income_pct';
                                            setData((prev: any) => ({ ...prev, [s.key]: val, [other]: Math.max(0, 100 - val) }));
                                        }}
                                        disabled={isLocked(s.key)}
                                        className={cn(
                                            "rounded-xl text-lg font-black py-7 pl-6 border-2 transition-all",
                                            isLocked(s.key) ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed" : "border-slate-200 focus:border-slate-900 focus:shadow-md"
                                        )}
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl italic pointer-events-none">%</div>
                                    <div
                                        className={cn("absolute bottom-0 left-0 h-[3px] rounded-b-xl transition-all duration-700 ease-out", s.color)}
                                        style={{ width: `${data[s.key]}%` }}
                                    />
                                </div>
                            </FieldWrapper>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
