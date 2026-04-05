import React from 'react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { ShieldCheck, Plus, Trash2, Building2, Landmark, User, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldWrapper } from '@/Components/FieldWrapper';

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

export default function SupportReferences({
    data,
    setData,
    errors,
    isEditing,
    isLocked,
    fieldStatus,
    auditLog,
    isRequired,
    setChangeRequestField
}: Props) {
    
    const addReference = (type: 'commercial' | 'bank') => {
        setData('references', [...data.references, { type, name: '', contact_person: '', position: '', email: '', phone: '' }]);
    };
    
    const removeReference = (i: number) => { 
        if (data.references.length > 1) setData('references', data.references.filter((_: any, idx: number) => idx !== i)); 
    };
    
    const updateReference = (i: number, field: string, value: string) => {
        const next = [...data.references]; 
        next[i] = { ...next[i], [field]: value }; 
        setData('references', next);
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                        <ShieldCheck size={14} className="text-white" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Referencias de Respaldo</h2>
                </div>
                {isEditing && !isLocked('references') && (
                    <div className="flex gap-2">
                        <Button type="button" onClick={() => addReference('commercial')}
                            className="h-8 rounded-xl px-3 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 bg-slate-900 text-white shadow-sm transition-all active:scale-95">
                            <Plus size={11} /> Comercial
                        </Button>
                        <Button type="button" onClick={() => addReference('bank')}
                            className="h-8 rounded-xl px-3 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-sm transition-all active:scale-95">
                            <Plus size={11} /> Bancaria
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-6 space-y-6 bg-white">
                <FieldWrapper
                    label="Lista de Referencias Registradas"
                    fieldId="references"
                    auditLog={auditLog}
                    required={isRequired('references')}
                    status={fieldStatus('references')}
                    error={errors.references}
                    onRequestChange={isEditing && fieldStatus('references') === 'approved' ? () => setChangeRequestField('references') : undefined}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        {data.references.map((ref: any, idx: number) => (
                            <div key={idx} className="relative rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-2 py-0.5 border border-slate-200 rounded-lg bg-white">
                                        {ref.type === 'bank' ? <Landmark size={11} /> : <Building2 size={11} />}
                                        {ref.type === 'bank' ? 'Bancaria' : 'Comercial'}
                                    </span>
                                    
                                    {isEditing && !isLocked('references') && data.references.length > 1 && (
                                        <button type="button" onClick={() => removeReference(idx)}
                                            className="h-7 w-7 rounded-lg bg-white border border-red-100 text-red-400 hover:bg-red-500 hover:text-white shadow-sm transition-all flex items-center justify-center active:scale-90">
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <Input
                                        value={ref.name}
                                        onChange={e => updateReference(idx, 'name', e.target.value)}
                                        disabled={isLocked('references')}
                                        placeholder={ref.type === 'bank' ? 'Nombre del banco' : 'Nombre de la empresa'}
                                        className={cn(
                                            "rounded-xl text-xs h-10 transition-all font-bold",
                                            errors[`references.${idx}.name` as any] ? "border-red-400" : "border-slate-200",
                                            isLocked('references') && "bg-slate-100 text-slate-500 opacity-60 cursor-not-allowed"
                                        )}
                                    />
                                    {errors[`references.${idx}.name` as any] && <p className="text-[10px] text-red-500 ml-1">{errors[`references.${idx}.name` as any]}</p>}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase text-slate-400 ml-1">Contacto</span>
                                            <Input value={ref.contact_person} onChange={e => updateReference(idx, 'contact_person', e.target.value)}
                                                disabled={isLocked('references')} placeholder="Nombre"
                                                className={cn("rounded-xl text-[11px] h-9 border-slate-200 bg-white", isLocked('references') && "opacity-60")} />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase text-slate-400 ml-1">Teléfono</span>
                                            <Input value={ref.phone} onChange={e => updateReference(idx, 'phone', e.target.value)}
                                                disabled={isLocked('references')} placeholder="Número"
                                                className={cn("rounded-xl text-[11px] h-9 border-slate-200 bg-white", isLocked('references') && "opacity-60")} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className={cn("text-[9px] font-black uppercase ml-1", errors[`references.${idx}.email` as any] ? "text-red-500" : "text-slate-400")}>Email</span>
                                        <Input type="email" value={ref.email} onChange={e => updateReference(idx, 'email', e.target.value)}
                                            disabled={isLocked('references')} placeholder="correo@ejemplo.com"
                                            className={cn(
                                                "rounded-xl text-[11px] h-9 bg-white",
                                                errors[`references.${idx}.email` as any] ? "border-red-400" : "border-slate-200",
                                                isLocked('references') && "opacity-60"
                                            )} />
                                        {errors[`references.${idx}.email` as any] && <p className="text-[10px] text-red-500 ml-1">{errors[`references.${idx}.email` as any]}</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </FieldWrapper>
            </div>
        </section>
    );
}
