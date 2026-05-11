import React from 'react';
import { Layers, Pencil, Save } from 'lucide-react';
import { Card } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { Label } from '@/Components/ui/Label';
import { TabsContent } from '@/Components/ui/Tabs';
import { SearchableSelect } from '@/Components/ui/SearchableSelect';
import { SectionAuditPanel, SectionReviewData } from './SectionAuditPanel';

interface TabServicesProps {
    associate: any;
    sectionReview: SectionReviewData;
    onAuditSection: (section: string, status: 'approved' | 'rejected', reason?: string) => void;
    onAuditChangeRequest: (section: string, action: 'approve' | 'reject', reason?: string) => void;
    isEditingServices: boolean;
    setIsEditingServices: (value: boolean) => void;
    data: any;
    setData: (key: string, value: any) => void;
    availableServices: any[];
    toggleService: (id: number) => void;
    handleUpdate: () => void;
    processing: boolean;
}

export function TabServices({
    associate,
    sectionReview,
    onAuditSection,
    onAuditChangeRequest,
    isEditingServices,
    setIsEditingServices,
    data,
    setData,
    availableServices,
    toggleService,
    handleUpdate,
    processing
}: TabServicesProps) {
    return (
        <TabsContent value="services" className="space-y-6">

            <SectionAuditPanel
                sectionKey="services"
                review={sectionReview}
                onAuditSection={onAuditSection}
                onAuditChangeRequest={onAuditChangeRequest}
            />

            <Card className="md:col-span-3 border-slate-200 overflow-hidden rounded-2xl shadow-sm">
                <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Layers size={18} className="text-slate-400" />
                        <h4 className="text-sm font-bold uppercase text-slate-700 tracking-wide">Descripción y Portafolio</h4>
                    </div>
                    {!isEditingServices ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingServices(true)}
                            className="h-8 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm border border-slate-200"
                        >
                            <Pencil size={12} className="mr-1.5" /> Modificar Servicios
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                                setIsEditingServices(false);
                                setData('service_ids', associate.services?.map((s: any) => s.id) || []);
                            }} className="h-8 text-[10px] font-bold uppercase border-slate-200">Cancelar</Button>
                            <Button size="sm" disabled={processing} onClick={() => {
                                handleUpdate();
                                setIsEditingServices(false);
                            }} className="h-8 text-[10px] font-bold uppercase bg-slate-900 text-white hover:bg-slate-800">
                                <Save size={12} className="mr-1.5" /> Guardar
                            </Button>
                        </div>
                    )}
                </div>

                <div className="p-8 space-y-8 bg-white">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Propuesta de Valor</Label>
                        {!isEditingServices ? (
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100 italic">
                                "{associate.description || 'Sin descripción'}"
                            </p>
                        ) : (
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="w-full min-h-[150px] p-4 rounded-xl border border-slate-200 focus:border-slate-900 transition-all text-sm resize-none outline-none"
                            />
                        )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catálogo de Servicios</Label>
                        {!isEditingServices ? (
                            <div className="flex flex-wrap gap-2">
                                {associate.services?.length > 0 ? (
                                    associate.services.map((s: any) => (
                                        <Badge key={s.id} variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 font-bold px-3 py-1">
                                            {s.name}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-xs italic">No hay servicios seleccionados</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 pb-12">
                                {availableServices.map((cat: any) => (
                                    <SearchableSelect
                                        key={cat.id}
                                        label={cat.name}
                                        multiple={true}
                                        value={cat.services.filter((s: any) => data.service_ids.includes(s.id)).map((s: any) => s.name)}
                                        onChange={(opt: any) => toggleService(opt.id)}
                                        options={cat.services}
                                        placeholder={`Selec. ${cat.name}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </TabsContent>
    );
}
