import React from 'react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Users, Plus, Trash2 } from 'lucide-react';
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

export default function Directory({
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
    
    const addContact = () => setData('contacts', [...data.contacts, { area: '', name: '', position: '', email: '', phone: '' }]);
    
    const removeContact = (i: number) => { 
        if (data.contacts.length > 1) setData('contacts', data.contacts.filter((_: any, idx: number) => idx !== i)); 
    };
    
    const updateContact = (i: number, field: string, value: string) => {
        const next = [...data.contacts]; 
        next[i] = { ...next[i], [field]: value }; 
        setData('contacts', next);
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                        <Users size={14} className="text-white" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Directorio de Contactos</h2>
                </div>
                {isEditing && !isLocked('contacts') && (
                    <Button type="button" onClick={addContact}
                        className="h-8 rounded-xl px-4 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all active:scale-95">
                        <Plus size={12} /> Agregar Contacto
                    </Button>
                )}
            </div>

            <div className="p-6 bg-white space-y-6">
                <FieldWrapper
                    label="Lista de Contactos Clave"
                    fieldId="contacts"
                    auditLog={auditLog}
                    required={isRequired('contacts')}
                    status={fieldStatus('contacts')}
                    error={errors.contacts}
                    onRequestChange={isEditing && fieldStatus('contacts') === 'approved' ? () => setChangeRequestField('contacts') : undefined}
                >
                    <div className="space-y-6 pt-2">
                        {data.contacts.map((contact: any, idx: number) => (
                            <div key={idx} className={cn(
                                "p-5 rounded-2xl border bg-slate-50/50 space-y-4 relative",
                                isLocked('contacts') ? "border-slate-100" : "border-slate-200"
                            )}>
                                {isEditing && !isLocked('contacts') && data.contacts.length > 1 && (
                                    <button type="button" onClick={() => removeContact(idx)}
                                        className="absolute -top-2 -right-2 h-7 w-7 rounded-lg bg-white border border-red-100 text-red-400 hover:bg-red-500 hover:text-white shadow-sm transition-all flex items-center justify-center active:scale-90 flex items-center justify-center" 
                                        title="Eliminar contacto">
                                        <Trash2 size={12} />
                                    </button>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {[
                                        { key: 'name', label: 'Nombre', placeholder: 'Ej. Juan Pérez' },
                                        { key: 'position', label: 'Cargo', placeholder: 'Ej. Gerente' },
                                        { key: 'area', label: 'Área', placeholder: 'Ej. Comercial' },
                                        { key: 'email', label: 'Email', placeholder: 'correo@linkiu.co' },
                                        { key: 'phone', label: 'Teléfono', placeholder: '322...' },
                                    ].map(f => {
                                        const fieldError = errors[`contacts.${idx}.${f.key}` as any];
                                        return (
                                            <div key={f.key} className="space-y-1">
                                                <span className={cn("text-[9px] font-black uppercase ml-1", fieldError ? "text-red-500" : "text-slate-400")}>{f.label}</span>
                                                <Input
                                                    type={f.key === 'email' ? 'email' : 'text'}
                                                    value={contact[f.key]}
                                                    onChange={e => updateContact(idx, f.key, e.target.value)}
                                                    disabled={isLocked('contacts')}
                                                    placeholder={f.placeholder}
                                                    className={cn(
                                                        "rounded-xl text-[11px] h-9 bg-white transition-all",
                                                        fieldError ? "border-red-400 focus:border-red-500" : "border-slate-200",
                                                        isLocked('contacts') && "bg-slate-100 text-slate-500 cursor-not-allowed opacity-60"
                                                    )}
                                                />
                                                {fieldError && <p className="text-[10px] text-red-500 ml-1">{fieldError}</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </FieldWrapper>
            </div>
        </section>
    );
}
