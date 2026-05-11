import React, { useState } from 'react';
import { Building2, Globe, User, Pencil, Save, X } from 'lucide-react';
import { TabsContent } from '@/Components/ui/Tabs';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { useForm } from '@inertiajs/react';
import { SectionAuditPanel, SectionReviewData } from './SectionAuditPanel';
import { cn } from '@/lib/utils';

interface TabBasicInfoProps {
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

function EditField({ label, name, value, onChange, type = 'text' }: {
    label: string; name: string; value: string; onChange: (v: string) => void; type?: string;
}) {
    return (
        <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</Label>
            <Input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="h-8 text-sm border-slate-200 rounded-lg"
            />
        </div>
    );
}

export function TabBasicInfo({ associate, sectionReview, onAuditSection, onAuditChangeRequest }: TabBasicInfoProps) {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, put, processing, reset } = useForm({
        company_name:      associate.company_name      || '',
        initials:          associate.initials          || '',
        nit:               associate.nit               || '',
        legal_status:      associate.legal_status      || '',
        constitution_date: associate.constitution_date ? associate.constitution_date.split('T')[0] : '',
        country_origin:    associate.country_origin    || '',
        department:        associate.department        || '',
        city:              associate.city              || '',
        address:           associate.address           || '',
        phone:             associate.phone             || '',
        website:           associate.website           || '',
        rep_name:          associate.rep_name          || '',
        rep_doc_type:      associate.rep_doc_type      || '',
        rep_doc:           associate.rep_doc           || '',
        rep_position:      associate.rep_position      || '',
    });

    const handleSave = () => {
        put(route('admin.associates.update', associate.id), {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    return (
        <TabsContent value="basic" className="space-y-4">
            <SectionAuditPanel
                sectionKey="basicinfo"
                review={sectionReview}
                onAuditSection={onAuditSection}
                onAuditChangeRequest={onAuditChangeRequest}
            />

            {/* Edit toolbar */}
            <div className="flex justify-end">
                {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}
                        className="h-8 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 border-slate-200">
                        <Pencil size={12} className="mr-1.5" /> Modificar datos
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancel}
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
                    {/* Identidad corporativa */}
                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                                <Building2 size={14} />
                            </div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Identidad Corporativa</h4>
                        </div>
                        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <EditField label="Nombre Empresa"      name="company_name"      value={data.company_name}      onChange={v => setData('company_name', v)} />
                            <EditField label="Sigla"               name="initials"          value={data.initials}          onChange={v => setData('initials', v)} />
                            <EditField label="NIT"                 name="nit"               value={data.nit}               onChange={v => setData('nit', v)} />
                            <EditField label="Tipo Sociedad"       name="legal_status"      value={data.legal_status}      onChange={v => setData('legal_status', v)} />
                            <EditField label="Fecha Constitución"  name="constitution_date" value={data.constitution_date} onChange={v => setData('constitution_date', v)} type="date" />
                            <EditField label="País de Origen"      name="country_origin"    value={data.country_origin}    onChange={v => setData('country_origin', v)} />
                        </CardContent>
                    </Card>

                    {/* Ubicación */}
                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                                <Globe size={14} />
                            </div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Ubicación y Contacto</h4>
                        </div>
                        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <EditField label="Departamento" name="department" value={data.department} onChange={v => setData('department', v)} />
                            <EditField label="Ciudad"       name="city"       value={data.city}       onChange={v => setData('city', v)} />
                            <EditField label="Dirección"    name="address"    value={data.address}    onChange={v => setData('address', v)} />
                            <EditField label="Teléfono"     name="phone"      value={data.phone}      onChange={v => setData('phone', v)} />
                            <EditField label="Sitio Web"    name="website"    value={data.website}    onChange={v => setData('website', v)} />
                        </CardContent>
                    </Card>

                    {/* Representante */}
                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                                <User size={14} />
                            </div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Representante Legal</h4>
                        </div>
                        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <EditField label="Nombre Completo"    name="rep_name"     value={data.rep_name}     onChange={v => setData('rep_name', v)} />
                            <EditField label="Tipo Documento"     name="rep_doc_type" value={data.rep_doc_type} onChange={v => setData('rep_doc_type', v)} />
                            <EditField label="Documento Identidad" name="rep_doc"     value={data.rep_doc}      onChange={v => setData('rep_doc', v)} />
                            <EditField label="Cargo"              name="rep_position" value={data.rep_position} onChange={v => setData('rep_position', v)} />
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><Building2 size={14} /></div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Identidad Corporativa</h4>
                        </div>
                        <CardContent className="p-0 divide-y divide-slate-100/60">
                            <Field label="Nombre Empresa"      value={associate.company_name} />
                            <Field label="Sigla"               value={associate.initials} />
                            <Field label="NIT"                 value={associate.nit} />
                            <Field label="Tipo Sociedad"       value={associate.legal_status} />
                            <Field label="Fecha Constitución"  value={associate.constitution_date ? associate.constitution_date.split('T')[0] : null} />
                            <Field label="País de Origen"      value={associate.country_origin} />
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><Globe size={14} /></div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Ubicación y Contacto</h4>
                        </div>
                        <CardContent className="p-0 divide-y divide-slate-100/60">
                            <Field label="Departamento" value={associate.department} />
                            <Field label="Ciudad"        value={associate.city} />
                            <Field label="Dirección"     value={associate.address} />
                            <Field label="Teléfono"      value={associate.phone} />
                            <Field label="Sitio Web"     value={associate.website} />
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><User size={14} /></div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Representante Legal</h4>
                        </div>
                        <CardContent className="p-0 divide-y divide-slate-100/60">
                            <Field label="Nombre Completo"     value={associate.rep_name} />
                            <Field label="Tipo Documento"      value={associate.rep_doc_type} />
                            <Field label="Documento Identidad" value={associate.rep_doc} />
                            <Field label="Cargo"               value={associate.rep_position} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </TabsContent>
    );
}
