import React, { useState } from 'react';
import { Network, MessageSquare, Phone, Pencil, Save, X, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { TabsContent } from '@/Components/ui/Tabs';
import { useForm } from '@inertiajs/react';
import { SectionAuditPanel, SectionReviewData } from './SectionAuditPanel';
import { cn } from '@/lib/utils';

interface TabContactsProps {
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

function TxtField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1">
            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</Label>
            <Input value={value} onChange={e => onChange(e.target.value)} className="h-8 text-sm border-slate-200 rounded-lg" />
        </div>
    );
}

export function TabContacts({ associate, sectionReview, onAuditSection, onAuditChangeRequest }: TabContactsProps) {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, put, processing, reset } = useForm({
        billing_email:    associate.billing_email    || '',
        main_ciiu:        associate.main_ciiu        || '',
        secondary_ciiu:   associate.secondary_ciiu   || '',
        social_instagram: associate.social_instagram || '',
        social_facebook:  associate.social_facebook  || '',
        social_linkedin:  associate.social_linkedin  || '',
        social_other:     associate.social_other     || '',
        contacts: (associate.contacts || []).map((c: any) => ({
            name: c.name || '', position: c.position || '',
            area: c.area || '', email: c.email || '', phone: c.phone || '',
        })),
    });

    const addContact = () => setData('contacts', [...data.contacts, { name: '', position: '', area: '', email: '', phone: '' }]);
    const removeContact = (i: number) => setData('contacts', data.contacts.filter((_: any, idx: number) => idx !== i));
    const updateContact = (i: number, field: string, value: string) => {
        const updated = data.contacts.map((c: any, idx: number) => idx === i ? { ...c, [field]: value } : c);
        setData('contacts', updated);
    };

    const handleSave = () => {
        put(route('admin.associates.update', associate.id), {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    return (
        <TabsContent value="contacts" className="space-y-4">
            <SectionAuditPanel
                sectionKey="contacts"
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
                    {/* Clasificación y canales */}
                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><Network size={14} /></div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Clasificación y Canales</h4>
                        </div>
                        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TxtField label="Email Facturación" value={data.billing_email}    onChange={v => setData('billing_email', v)} />
                            <TxtField label="CIIU Principal"    value={data.main_ciiu}        onChange={v => setData('main_ciiu', v)} />
                            <TxtField label="CIIU Secundario"   value={data.secondary_ciiu}   onChange={v => setData('secondary_ciiu', v)} />
                            <TxtField label="Instagram"         value={data.social_instagram} onChange={v => setData('social_instagram', v)} />
                            <TxtField label="Facebook"          value={data.social_facebook}  onChange={v => setData('social_facebook', v)} />
                            <TxtField label="LinkedIn"          value={data.social_linkedin}  onChange={v => setData('social_linkedin', v)} />
                            <TxtField label="Otras Redes"       value={data.social_other}     onChange={v => setData('social_other', v)} />
                        </CardContent>
                    </Card>

                    {/* Directorio de contactos */}
                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Directorio de Contactos</h4>
                            </div>
                            <Button size="sm" variant="outline" onClick={addContact}
                                className="h-7 text-[10px] font-bold uppercase border-slate-200">
                                <Plus size={11} className="mr-1" /> Agregar
                            </Button>
                        </div>
                        <CardContent className="p-5 space-y-4">
                            {data.contacts.length === 0 && (
                                <p className="text-center text-slate-400 text-xs italic py-4">Sin contactos. Haz clic en Agregar.</p>
                            )}
                            {data.contacts.map((c: any, i: number) => (
                                <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3 relative">
                                    <button onClick={() => removeContact(i)}
                                        className="absolute top-3 right-3 h-6 w-6 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors">
                                        <Trash2 size={11} />
                                    </button>
                                    <div className="grid grid-cols-2 gap-3 pr-8">
                                        <TxtField label="Nombre"   value={c.name}     onChange={v => updateContact(i, 'name', v)} />
                                        <TxtField label="Cargo"    value={c.position} onChange={v => updateContact(i, 'position', v)} />
                                        <TxtField label="Área"     value={c.area}     onChange={v => updateContact(i, 'area', v)} />
                                        <TxtField label="Email"    value={c.email}    onChange={v => updateContact(i, 'email', v)} />
                                        <TxtField label="Teléfono" value={c.phone}    onChange={v => updateContact(i, 'phone', v)} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <>
                    <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0"><Network size={14} /></div>
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Clasificación y Canales</h4>
                        </div>
                        <CardContent className="p-0 divide-y divide-slate-100/60">
                            <Field label="Email Facturación" value={associate.billing_email} />
                            <Field label="CIIU Principal"    value={associate.main_ciiu} />
                            <Field label="CIIU Secundario"   value={associate.secondary_ciiu} />
                            <Field label="Tipo de Empresa"   value={Array.isArray(associate.company_type) ? associate.company_type.join(', ') : associate.company_type} />
                            <Field label="Instagram"         value={associate.social_instagram} />
                            <Field label="Facebook"          value={associate.social_facebook} />
                            <Field label="LinkedIn"          value={associate.social_linkedin} />
                            <Field label="Otras Redes"       value={associate.social_other} />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm h-fit">
                            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                                    Directorio de Contactos
                                    <Badge variant="outline" className="font-bold border-slate-200 text-[10px]">{associate.contacts?.length || 0}</Badge>
                                </h4>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {associate.contacts?.length > 0 ? associate.contacts.map((c: any, i: number) => (
                                    <div key={i} className="px-5 py-3.5">
                                        <p className="font-bold text-slate-900 text-sm leading-tight">{c.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">{c.position} · {c.area}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] font-medium text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><MessageSquare size={11} className="text-slate-400" /> {c.email}</span>
                                            <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {c.phone}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-slate-400 text-xs italic py-6">No hay contactos registrados</p>
                                )}
                            </div>
                        </Card>

                        <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm h-fit">
                            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                                    Referencias Registradas
                                    <Badge variant="outline" className="font-bold border-slate-200 text-[10px]">{associate.references?.length || 0}</Badge>
                                </h4>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {associate.references?.length > 0 ? associate.references.map((r: any, i: number) => (
                                    <div key={i} className="px-5 py-3.5">
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm leading-tight">{r.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">{r.contact_person}{r.position ? ` · ${r.position}` : ''}</p>
                                            </div>
                                            <Badge variant="secondary" className={cn("text-[9px] font-black uppercase shrink-0", r.type === 'bank' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700')}>
                                                {r.type === 'bank' ? 'Banco' : 'Comercial'}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] font-medium text-slate-500">
                                            {r.phone && <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {r.phone}</span>}
                                            {r.email && <span className="flex items-center gap-1"><MessageSquare size={11} className="text-slate-400" /> {r.email}</span>}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-slate-400 text-xs italic py-6">No hay referencias registradas</p>
                                )}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </TabsContent>
    );
}
