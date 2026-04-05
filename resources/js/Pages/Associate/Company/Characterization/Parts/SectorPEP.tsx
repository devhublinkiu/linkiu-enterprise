import React from 'react';
import { Input } from '@/Components/ui/Input';
import { FieldWrapper } from '@/Components/FieldWrapper';
import { YesNoToggle } from '@/Components/ui/YesNoToggle';
import { Target, UserCircle } from 'lucide-react';
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

export default function SectorPEP({
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
            {/* Hidrocarburos */}
            <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden ">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                            <Target size={14} className="text-white" />
                        </div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Hidrocarburos</h2>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <FieldWrapper
                        label="¿Participa en licitaciones del sector?"
                        fieldId="hydrocarbons_participation"
                        auditLog={auditLog}
                        status={fieldStatus('hydrocarbons_participation')}
                        error={errors.hydrocarbons_participation}
                        required={isRequired('hydrocarbons_participation')}
                        onRequestChange={isEditing && fieldStatus('hydrocarbons_participation') === 'approved' ? () => setChangeRequestField('hydrocarbons_participation') : undefined}
                    >
                        <YesNoToggle
                            value={data.hydrocarbons_participation}
                            onChange={(v: boolean) => setData('hydrocarbons_participation', v)}
                            disabled={isLocked('hydrocarbons_participation')}
                            yesLabel="SÍ PARTICIPA"
                            noLabel="NO PARTICIPA"
                        />
                    </FieldWrapper>

                    {data.hydrocarbons_participation && (
                        <div className="animate-in fade-in slide-in-from-top-1 duration-300 pt-2">
                            <FieldWrapper
                                label="Nivel de alcance"
                                fieldId="hydrocarbons_level"
                                auditLog={auditLog}
                                status={fieldStatus('hydrocarbons_level')}
                                error={errors.hydrocarbons_level}
                                required={isRequired('hydrocarbons_level')}
                                compact
                                onRequestChange={isEditing && fieldStatus('hydrocarbons_level') === 'approved' ? () => setChangeRequestField('hydrocarbons_level') : undefined}
                            >
                                <div className="grid grid-cols-3 gap-2">
                                    {['Nacional', 'Departamental', 'Municipal'].map(lvl => (
                                        <button key={lvl} type="button"
                                            onClick={() => !isLocked('hydrocarbons_level') && setData('hydrocarbons_level', lvl)}
                                            disabled={isLocked('hydrocarbons_level')}
                                            className={cn(
                                                "py-2.5 rounded-xl text-[10px] font-black border transition-all uppercase tracking-wider",
                                                data.hydrocarbons_level === lvl ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400",
                                                isLocked('hydrocarbons_level') && "opacity-40 cursor-not-allowed pointer-events-none"
                                            )}
                                        >{lvl}</button>
                                    ))}
                                </div>
                            </FieldWrapper>
                        </div>
                    )}
                </div>
            </section>

            {/* PEP */}
            <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden ">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                            <UserCircle size={14} className="text-white" />
                        </div>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Persona PEP</h2>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <FieldWrapper
                        label="¿Persona políticamente expuesta?"
                        fieldId="pep_declaration"
                        auditLog={auditLog}
                        status={fieldStatus('pep_declaration')}
                        error={errors.pep_declaration}
                        required={isRequired('pep_declaration')}
                        onRequestChange={isEditing && fieldStatus('pep_declaration') === 'approved' ? () => setChangeRequestField('pep_declaration') : undefined}
                    >
                        <YesNoToggle
                            value={data.pep_declaration}
                            onChange={(v: boolean) => setData('pep_declaration', v)}
                            disabled={isLocked('pep_declaration')}
                            yesLabel="SÍ DECLARA"
                            noLabel="NO DECLARA"
                        />
                    </FieldWrapper>

                    {data.pep_declaration && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300 pt-2">
                            <FieldWrapper
                                label="Nombre del PEP"
                                fieldId="pep_name"
                                auditLog={auditLog}
                                status={fieldStatus('pep_name')}
                                error={errors.pep_name}
                                required={isRequired('pep_name')}
                                onRequestChange={isEditing && fieldStatus('pep_name') === 'approved' ? () => setChangeRequestField('pep_name') : undefined}
                            >
                                <Input
                                    value={data.pep_name}
                                    onChange={e => setData('pep_name', e.target.value)}
                                    disabled={isLocked('pep_name')}
                                    placeholder="Nombre completo"
                                    className={cn("text-sm rounded-xl py-5", isLocked('pep_name') && "bg-slate-50 text-slate-400 cursor-not-allowed")}
                                />
                            </FieldWrapper>

                            <div className="grid grid-cols-2 gap-4">
                                <FieldWrapper
                                    label="Tipo documento"
                                    fieldId="pep_doc_type"
                                    auditLog={auditLog}
                                    status={fieldStatus('pep_doc_type')}
                                    error={errors.pep_doc_type}
                                    required={isRequired('pep_doc_type')}
                                    compact
                                    onRequestChange={isEditing && fieldStatus('pep_doc_type') === 'approved' ? () => setChangeRequestField('pep_doc_type') : undefined}
                                >
                                    <Input
                                        value={data.pep_doc_type}
                                        onChange={e => setData('pep_doc_type', e.target.value)}
                                        disabled={isLocked('pep_doc_type')}
                                        placeholder="C.C., Pasaporte, etc."
                                        className={cn("text-sm rounded-xl py-5", isLocked('pep_doc_type') && "bg-slate-50 text-slate-400 cursor-not-allowed")}
                                    />
                                </FieldWrapper>

                                <FieldWrapper
                                    label="Entidad"
                                    fieldId="pep_entity"
                                    auditLog={auditLog}
                                    status={fieldStatus('pep_entity')}
                                    error={errors.pep_entity}
                                    required={isRequired('pep_entity')}
                                    compact
                                    onRequestChange={isEditing && fieldStatus('pep_entity') === 'approved' ? () => setChangeRequestField('pep_entity') : undefined}
                                >
                                    <Input
                                        value={data.pep_entity}
                                        onChange={e => setData('pep_entity', e.target.value)}
                                        disabled={isLocked('pep_entity')}
                                        placeholder="Entidad vinculada"
                                        className={cn("text-sm rounded-xl py-5", isLocked('pep_entity') && "bg-slate-50 text-slate-400 cursor-not-allowed")}
                                    />
                                </FieldWrapper>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
