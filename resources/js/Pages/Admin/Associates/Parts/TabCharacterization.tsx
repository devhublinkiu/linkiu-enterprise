import React, { useState } from 'react';
import { Briefcase, Layers, ShieldAlert, Pencil, Save, X } from 'lucide-react';
import { TabsContent } from '@/Components/ui/Tabs';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { useForm } from '@inertiajs/react';
import { SectionAuditPanel, SectionReviewData } from './SectionAuditPanel';

interface TabCharacterizationProps {
    associate: any;
    sectionReview: SectionReviewData;
    onAuditSection: (section: string, status: 'approved' | 'rejected', reason?: string) => void;
    onAuditChangeRequest: (section: string, action: 'approve' | 'reject', reason?: string) => void;
}

function Field({ label, value }: { label: string; value: any }) {
    return (
        <div className="px-5 py-3">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block leading-none mb-0.5">{label}</span>
            <p className="text-sm font-bold text-slate-900">
                {value ?? <span className="text-slate-300 font-normal italic text-xs">Sin registrar</span>}
            </p>
        </div>
    );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</Label>
            <Input type="number" min={0} value={value} onChange={e => onChange(Number(e.target.value))}
                className="h-8 text-sm border-slate-200 rounded-lg" />
        </div>
    );
}

function TxtField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</Label>
            <Input value={value} onChange={e => onChange(e.target.value)} className="h-8 text-sm border-slate-200 rounded-lg" />
        </div>
    );
}

function BoolField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</Label>
            <div className="flex gap-2">
                <button type="button" onClick={() => onChange(true)}
                    className={`h-8 px-4 rounded-lg text-[10px] font-black uppercase border transition-colors ${value ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                    Sí
                </button>
                <button type="button" onClick={() => onChange(false)}
                    className={`h-8 px-4 rounded-lg text-[10px] font-black uppercase border transition-colors ${!value ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                    No
                </button>
            </div>
        </div>
    );
}

export function TabCharacterization({ associate, sectionReview, onAuditSection, onAuditChangeRequest }: TabCharacterizationProps) {
    const [isEditing, setIsEditing] = useState(false);
    const bool = (v: boolean | null) => v === null ? null : (v ? 'SÍ' : 'NO');

    const { data, setData, put, processing, reset } = useForm({
        employees_direct_count:     associate.employees_direct_count     ?? 0,
        employees_tech:             associate.employees_tech             ?? 0,
        employees_prof:             associate.employees_prof             ?? 0,
        employees_admin:            associate.employees_admin            ?? 0,
        employees_exec:             associate.employees_exec             ?? 0,
        employees_other:            associate.employees_other            ?? 0,
        employees_other_desc:       associate.employees_other_desc       || '',
        company_classification:     associate.company_classification     || '',
        hydrocarbons_participation: associate.hydrocarbons_participation ?? false,
        hydrocarbons_level:         associate.hydrocarbons_level         || '',
        private_income_pct:         associate.private_income_pct         ?? 0,
        public_income_pct:          associate.public_income_pct          ?? 0,
        pep_declaration:            associate.pep_declaration            ?? false,
        pep_name:                   associate.pep_name                   || '',
        pep_doc_type:               associate.pep_doc_type               || '',
        pep_entity:                 associate.pep_entity                 || '',
        capacitation_plan:          associate.capacitation_plan          ?? false,
        capacitation_level:         associate.capacitation_level         || '',
        capacitation_no_reason:     associate.capacitation_no_reason     || '',
        other_guilds:               associate.other_guilds               || '',
    });

    const handleSave = () => {
        put(route('admin.associates.update', associate.id), {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    return (
        <TabsContent value="characterization" className="space-y-4">
            <SectionAuditPanel
                sectionKey="characterization"
                review={sectionReview}
                onAuditSection={onAuditSection}
                onAuditChangeRequest={onAuditChangeRequest}
            />

            <div className="flex justify-end">
                {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}
                        className="h-8 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 border-slate-200">
                        <Pencil size={12} className="mr-1.5" /> Modificar datos
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { reset(); setIsEditing(false); }}
                            className="h-8 text-[10px] font-bold uppercase border-slate-200">
                            <X size={12} className="mr-1" /> Cancelar
                        </Button>
                        <Button size="sm" disabled={processing} onClick={handleSave}
                            className="h-8 text-[10px] font-bold uppercase bg-slate-900 text-white hover:bg-slate-800">
                            <Save size={12} className="mr-1.5" /> Guardar
                        </Button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><Briefcase size={14} /></div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Estructura de Empleados</h4>
                        </div>
                        <CardContent className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <NumField label="Total Directos"     value={data.employees_direct_count} onChange={v => setData('employees_direct_count', v)} />
                            <NumField label="Técnicos"           value={data.employees_tech}         onChange={v => setData('employees_tech', v)} />
                            <NumField label="Profesionales"      value={data.employees_prof}         onChange={v => setData('employees_prof', v)} />
                            <NumField label="Administrativos"    value={data.employees_admin}        onChange={v => setData('employees_admin', v)} />
                            <NumField label="Directivos"         value={data.employees_exec}         onChange={v => setData('employees_exec', v)} />
                            <NumField label="Otros"              value={data.employees_other}        onChange={v => setData('employees_other', v)} />
                            <div className="col-span-2 sm:col-span-3">
                                <TxtField label="Desc. Otros"    value={data.employees_other_desc}   onChange={v => setData('employees_other_desc', v)} />
                            </div>
                            <div className="col-span-2 sm:col-span-3">
                                <TxtField label="Clasificación Empresa" value={data.company_classification} onChange={v => setData('company_classification', v)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><Layers size={14} /></div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Actividad e Ingresos</h4>
                        </div>
                        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <BoolField label="Part. Hidrocarburos" value={data.hydrocarbons_participation} onChange={v => setData('hydrocarbons_participation', v)} />
                            {data.hydrocarbons_participation && (
                                <TxtField label="Alcance Hidrocarburos" value={data.hydrocarbons_level} onChange={v => setData('hydrocarbons_level', v)} />
                            )}
                            <NumField label="% Ingresos Privados" value={data.private_income_pct} onChange={v => setData('private_income_pct', v)} />
                            <NumField label="% Ingresos Públicos"  value={data.public_income_pct}  onChange={v => setData('public_income_pct', v)} />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><ShieldAlert size={14} /></div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">PEP y Transparencia</h4>
                        </div>
                        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <BoolField label="Declaración PEP" value={data.pep_declaration} onChange={v => setData('pep_declaration', v)} />
                            {data.pep_declaration && (<>
                                <TxtField label="Nombre PEP"  value={data.pep_name}     onChange={v => setData('pep_name', v)} />
                                <TxtField label="Doc. PEP"    value={data.pep_doc_type} onChange={v => setData('pep_doc_type', v)} />
                                <TxtField label="Entidad PEP" value={data.pep_entity}   onChange={v => setData('pep_entity', v)} />
                            </>)}
                            <BoolField label="Plan Capacitación" value={data.capacitation_plan} onChange={v => setData('capacitation_plan', v)} />
                            {data.capacitation_plan === true  && <TxtField label="Prioridad"       value={data.capacitation_level}     onChange={v => setData('capacitation_level', v)} />}
                            {data.capacitation_plan === false && <TxtField label="Motivo sin plan" value={data.capacitation_no_reason} onChange={v => setData('capacitation_no_reason', v)} />}
                            <div className="col-span-1 sm:col-span-2">
                                <TxtField label="Otros Gremios" value={data.other_guilds} onChange={v => setData('other_guilds', v)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><Briefcase size={14} /></div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Estructura de Empleados</h4>
                        </div>
                        <CardContent className="p-0 divide-y divide-slate-100/60">
                            <Field label="Total Directos"        value={associate.employees_direct_count} />
                            <Field label="Técnicos"              value={associate.employees_tech} />
                            <Field label="Profesionales"         value={associate.employees_prof} />
                            <Field label="Administrativos"       value={associate.employees_admin} />
                            <Field label="Directivos"            value={associate.employees_exec} />
                            <Field label="Otros"                 value={associate.employees_other ?? 0} />
                            <Field label="Desc. Otros"           value={associate.employees_other_desc} />
                            <Field label="Clasificación Empresa" value={associate.company_classification} />
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><Layers size={14} /></div>
                                <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Actividad e Ingresos</h4>
                            </div>
                            <CardContent className="p-0 divide-y divide-slate-100/60">
                                <Field label="Part. Hidrocarburos" value={bool(associate.hydrocarbons_participation)} />
                                {associate.hydrocarbons_participation && <Field label="Alcance Hidrocarburos" value={associate.hydrocarbons_level} />}
                                <Field label="% Ingresos Privados"  value={associate.private_income_pct != null ? `${associate.private_income_pct}%` : null} />
                                <Field label="% Ingresos Públicos"  value={associate.public_income_pct  != null ? `${associate.public_income_pct}%`  : null} />
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><ShieldAlert size={14} /></div>
                                <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">PEP y Transparencia</h4>
                            </div>
                            <CardContent className="p-0 divide-y divide-slate-100/60">
                                <Field label="Declaración PEP"  value={bool(associate.pep_declaration)} />
                                {associate.pep_declaration && (<>
                                    <Field label="Nombre PEP"   value={associate.pep_name} />
                                    <Field label="Doc. PEP"     value={associate.pep_doc_type} />
                                    <Field label="Entidad PEP"  value={associate.pep_entity} />
                                </>)}
                                <Field label="Plan Capacitación" value={bool(associate.capacitation_plan)} />
                                {associate.capacitation_plan === true  && <Field label="Prioridad"       value={associate.capacitation_level} />}
                                {associate.capacitation_plan === false && <Field label="Motivo sin plan" value={associate.capacitation_no_reason} />}
                                <Field label="Otros Gremios"     value={associate.other_guilds} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </TabsContent>
    );
}
