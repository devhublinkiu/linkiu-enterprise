import React from 'react';
import { FieldWrapper } from '@/Components/FieldWrapper';
import { YesNoToggle } from '@/Components/ui/YesNoToggle';
import { BarChart3 } from 'lucide-react';
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

export default function TrainingGuilds({
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
    return (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden  font-sans">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                        <BarChart3 size={14} className="text-white" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Capacitación y Gremios</h2>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* Capacitación */}
                    <div className="space-y-6">
                        <FieldWrapper
                            label="¿Cuenta con plan de capacitación?"
                            fieldId="capacitation_plan"
                            auditLog={auditLog}
                            status={fieldStatus('capacitation_plan')}
                            error={errors.capacitation_plan}
                            required={isRequired('capacitation_plan')}
                            onRequestChange={isEditing && fieldStatus('capacitation_plan') === 'approved' ? () => setChangeRequestField('capacitation_plan') : undefined}
                        >
                            <YesNoToggle
                                value={data.capacitation_plan}
                                onChange={(v: boolean) => setData((prev: any) => ({
                                    ...prev,
                                    capacitation_plan: v,
                                    capacitation_level: v ? prev.capacitation_level : '',
                                    capacitation_no_reason: v ? '' : prev.capacitation_no_reason,
                                }))}
                                disabled={isLocked('capacitation_plan')}
                                yesLabel="SÍ TIENE PLAN"
                                noLabel="NO TIENE PLAN"
                            />
                        </FieldWrapper>

                        {data.capacitation_plan === true && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <FieldWrapper
                                    label="Nivel educativo que prioriza"
                                    fieldId="capacitation_level"
                                    auditLog={auditLog}
                                    status={fieldStatus('capacitation_level')}
                                    error={errors.capacitation_level}
                                    required={isRequired('capacitation_level')}
                                    onRequestChange={isEditing && fieldStatus('capacitation_level') === 'approved' ? () => setChangeRequestField('capacitation_level') : undefined}
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {['Alta Gerencia', 'Media', 'Profesionales', 'Técnicos', 'Todos'].map(lvl => (
                                            <button key={lvl} type="button"
                                                onClick={() => !isLocked('capacitation_level') && setData('capacitation_level', lvl)}
                                                disabled={isLocked('capacitation_level')}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black border transition-all uppercase tracking-widest",
                                                    data.capacitation_level === lvl ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400",
                                                    isLocked('capacitation_level') && "opacity-40 cursor-not-allowed pointer-events-none"
                                                )}
                                            >{lvl}</button>
                                        ))}
                                    </div>
                                </FieldWrapper>
                            </div>
                        )}

                        {data.capacitation_plan === false && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <FieldWrapper
                                    label="Principal motivo de no contar con plan"
                                    fieldId="capacitation_no_reason"
                                    auditLog={auditLog}
                                    status={fieldStatus('capacitation_no_reason')}
                                    error={errors.capacitation_no_reason}
                                    required={isRequired('capacitation_no_reason')}
                                    onRequestChange={isEditing && fieldStatus('capacitation_no_reason') === 'approved' ? () => setChangeRequestField('capacitation_no_reason') : undefined}
                                >
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Falta recursos', 'Desconocimiento', 'Falta oferta', 'Otro'].map(opt => (
                                            <button key={opt} type="button"
                                                onClick={() => !isLocked('capacitation_no_reason') && setData('capacitation_no_reason', opt)}
                                                disabled={isLocked('capacitation_no_reason')}
                                                className={cn(
                                                    "p-3 rounded-xl text-[10px] font-black border text-left transition-all uppercase tracking-wide",
                                                    data.capacitation_no_reason === opt ? "bg-slate-100 border-slate-400 text-slate-900 " : "bg-white border-slate-100 text-slate-400 hover:border-slate-300",
                                                    isLocked('capacitation_no_reason') && "opacity-40 cursor-not-allowed pointer-events-none"
                                                )}
                                            >
                                                <div className={cn("h-1.5 w-1.5 rounded-full mb-1", data.capacitation_no_reason === opt ? "bg-slate-900" : "bg-slate-200")} />
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </FieldWrapper>
                            </div>
                        )}
                    </div>

                    {/* Gremios */}
                    <div className="space-y-4">
                        <FieldWrapper
                            label="Afiliación a otros gremios o asociaciones"
                            fieldId="other_guilds"
                            auditLog={auditLog}
                            status={fieldStatus('other_guilds')}
                            error={errors.other_guilds}
                            required={isRequired('other_guilds')}
                            hint="Mencione ANDI, Camacol, ACOPI, etc."
                            onRequestChange={isEditing && fieldStatus('other_guilds') === 'approved' ? () => setChangeRequestField('other_guilds') : undefined}
                        >
                            <textarea
                                value={data.other_guilds || ''}
                                onChange={e => setData('other_guilds', e.target.value)}
                                disabled={isLocked('other_guilds')}
                                placeholder="Describa brevemente..."
                                className={cn(
                                    "w-full border-2 border-slate-100 rounded-2xl p-5 text-sm min-h-[160px] resize-none transition-all focus:outline-none focus:border-slate-900 focus:bg-white shadow-inner",
                                    isLocked('other_guilds') ? "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-50" : "bg-white"
                                )}
                            />
                        </FieldWrapper>
                    </div>
                </div>
            </div>
        </section>
    );
}
