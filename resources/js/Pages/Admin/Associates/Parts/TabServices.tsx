import React from 'react';
import { Layers, Pencil, Save, Check, X, AlertTriangle, RotateCcw } from 'lucide-react';
import { Card } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { Label } from '@/Components/ui/Label';
import { TabsContent } from '@/Components/ui/Tabs';
import { SearchableSelect } from '@/Components/ui/SearchableSelect';
import { cn } from '@/lib/utils';

interface TabServicesProps {
    associate: any;
    auditState: any;
    getFieldStatus: (field: string) => string;
    getChangeRequest: (field: string) => any;
    handleAudit: (field: string, status: string, reason?: string) => void;
    isEditingServices: boolean;
    setIsEditingServices: (value: boolean) => void;
    data: any;
    setData: (key: string, value: any) => void;
    availableServices: any[];
    toggleService: (id: number) => void;
    handleUpdate: () => void;
    processing: boolean;
}

function FieldAuditControls({ fieldId, auditState, getChangeRequest, handleAudit }: {
    fieldId: string;
    auditState: any;
    getChangeRequest: (f: string) => any;
    handleAudit: (f: string, s: string, r?: string) => void;
}) {
    const status = auditState[fieldId]?.status;
    const changeRequest = getChangeRequest(fieldId);

    if (!status || status === 'pending') {
        return (
            <div className="flex items-center gap-1.5">
                <button onClick={() => handleAudit(fieldId, 'approved')}
                    className="p-1.5 rounded-lg border bg-slate-50 border-slate-100 text-slate-400 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all">
                    <Check size={14} />
                </button>
                <button onClick={() => handleAudit(fieldId, 'rejected')}
                    className="p-1.5 rounded-lg border bg-slate-50 border-slate-100 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all">
                    <X size={14} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            )}>
                {status === 'approved' ? 'Aprobado' : 'Rechazado'}
            </span>
            {changeRequest ? (
                <button onClick={() => handleAudit(fieldId, 'reset')}
                    className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-600 border border-amber-200 hover:bg-amber-50 px-2 py-1 rounded-lg transition-all">
                    <RotateCcw size={9} /> Permitir cambio
                </button>
            ) : (
                <button onClick={() => handleAudit(fieldId, 'reset')}
                    className="text-[8px] font-bold uppercase text-slate-400 hover:text-slate-900 transition-colors px-1">
                    Deshacer
                </button>
            )}
        </div>
    );
}

export function TabServices({
    associate,
    auditState,
    getFieldStatus,
    getChangeRequest,
    handleAudit,
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        {/* Descripción */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Propuesta de Valor</Label>
                                <FieldAuditControls
                                    fieldId="description"
                                    auditState={auditState}
                                    getChangeRequest={getChangeRequest}
                                    handleAudit={handleAudit}
                                />
                            </div>

                            {getChangeRequest('description') && (
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                                    <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-amber-900">Solicitud de modificación</p>
                                        <p className="text-xs text-amber-800 font-medium mt-0.5 italic">"{getChangeRequest('description').reason}"</p>
                                    </div>
                                </div>
                            )}

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

                            {auditState['description']?.status === 'rejected' && auditState['description']?.reason && (
                                <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                    <AlertTriangle size={12} /> {auditState['description'].reason}
                                </p>
                            )}
                        </div>

                        {/* Servicios */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catálogo de Servicios</Label>
                                <FieldAuditControls
                                    fieldId="service_ids"
                                    auditState={auditState}
                                    getChangeRequest={getChangeRequest}
                                    handleAudit={handleAudit}
                                />
                            </div>

                            {getChangeRequest('service_ids') && (
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                                    <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-amber-900">Solicitud de modificación</p>
                                        <p className="text-xs text-amber-800 font-medium mt-0.5 italic">"{getChangeRequest('service_ids').reason}"</p>
                                    </div>
                                </div>
                            )}

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

                            {auditState['service_ids']?.status === 'rejected' && auditState['service_ids']?.reason && (
                                <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                    <AlertTriangle size={12} /> {auditState['service_ids'].reason}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </TabsContent>
    );
}
