import React from 'react';
import { Network, MessageSquare, Phone, Check, X, RotateCcw } from 'lucide-react';
import { Card } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { TabsContent } from '@/Components/ui/Tabs';
import { AuditSection } from './AuditSection';
import { cn } from '@/lib/utils';

interface TabContactsProps {
    associate: any;
    auditState: any;
    getFieldStatus: (field: string) => string;
    getChangeRequest: (field: string) => any;
    handleAudit: (field: string, status: string, reason?: string) => void;
}

function SectionAuditBar({ fieldId, status, changeRequest, onAudit }: {
    fieldId: string;
    status: string;
    changeRequest: any;
    onAudit: (field: string, status: string, reason?: string) => void;
}) {
    if (status === 'pending') {
        return (
            <div className="flex items-center gap-1.5">
                <Button size="sm" onClick={() => onAudit(fieldId, 'approved')}
                    className="h-7 px-3 text-[10px] font-black uppercase bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm">
                    <Check size={11} className="mr-1" /> Aprobar
                </Button>
                <Button size="sm" variant="outline" onClick={() => onAudit(fieldId, 'rejected')}
                    className="h-7 px-3 text-[10px] font-black uppercase border-slate-200 text-red-600 hover:bg-red-50 rounded-lg">
                    <X size={11} className="mr-1" /> Rechazar
                </Button>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-2">
            <Badge className={cn("font-black uppercase tracking-widest text-[9px] px-2 py-0.5 border-none",
                status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            )}>
                {status === 'approved' ? 'Aprobado' : 'Rechazado'}
            </Badge>
            {changeRequest ? (
                <Button size="sm" variant="outline" onClick={() => onAudit(fieldId, 'reset')}
                    className="h-6 text-[9px] font-black uppercase text-amber-600 border-amber-200 hover:bg-amber-50 px-2">
                    <RotateCcw size={9} className="mr-1" /> Permitir cambio
                </Button>
            ) : (
                <Button size="sm" variant="ghost" onClick={() => onAudit(fieldId, 'reset')}
                    className="h-6 text-[8px] font-bold uppercase text-slate-400 hover:text-slate-900 px-1.5">
                    Deshacer
                </Button>
            )}
        </div>
    );
}

export function TabContacts({ associate, auditState, getFieldStatus, getChangeRequest, handleAudit }: TabContactsProps) {
    return (
        <TabsContent value="contacts" className="space-y-4">

            {/* ── 1. Campos escalares — aprobación rápida ─────────────────── */}
            <AuditSection
                title="Clasificación y Redes"
                icon={Network}
                onAudit={handleAudit}
                items={[
                    { id: 'billing_email',  label: 'Email Facturación', value: associate.billing_email,  status: getFieldStatus('billing_email') as any,  reason: auditState['billing_email']?.reason,  changeRequest: getChangeRequest('billing_email') },
                    { id: 'main_ciiu',      label: 'CIIU Principal',    value: associate.main_ciiu,      status: getFieldStatus('main_ciiu') as any,      reason: auditState['main_ciiu']?.reason,      changeRequest: getChangeRequest('main_ciiu') },
                    { id: 'secondary_ciiu', label: 'CIIU Secundario',   value: associate.secondary_ciiu, status: getFieldStatus('secondary_ciiu') as any, reason: auditState['secondary_ciiu']?.reason, changeRequest: getChangeRequest('secondary_ciiu') },
                    { id: 'company_type',   label: 'Tipo de Empresa',   value: Array.isArray(associate.company_type) ? associate.company_type.join(', ') : associate.company_type, status: getFieldStatus('company_type') as any, reason: auditState['company_type']?.reason, changeRequest: getChangeRequest('company_type') },
                    { id: 'social_instagram', label: 'Instagram', value: associate.social_instagram, status: getFieldStatus('social_instagram') as any, reason: auditState['social_instagram']?.reason, changeRequest: getChangeRequest('social_instagram') },
                    { id: 'social_facebook',  label: 'Facebook',  value: associate.social_facebook,  status: getFieldStatus('social_facebook') as any,  reason: auditState['social_facebook']?.reason,  changeRequest: getChangeRequest('social_facebook') },
                    { id: 'social_linkedin',  label: 'LinkedIn',  value: associate.social_linkedin,  status: getFieldStatus('social_linkedin') as any,  reason: auditState['social_linkedin']?.reason,  changeRequest: getChangeRequest('social_linkedin') },
                    { id: 'social_other',     label: 'Otras Redes', value: associate.social_other,   status: getFieldStatus('social_other') as any,     reason: auditState['social_other']?.reason,     changeRequest: getChangeRequest('social_other') },
                ]}
            />

            {/* ── 2. Contactos y Referencias — lado a lado ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Directorio de Contactos */}
                <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm h-fit">
                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                            Directorio de Contactos
                            <Badge variant="outline" className="font-bold border-slate-200 text-[10px]">{associate.contacts?.length || 0}</Badge>
                        </h4>
                        <SectionAuditBar
                            fieldId="contacts"
                            status={getFieldStatus('contacts')}
                            changeRequest={getChangeRequest('contacts')}
                            onAudit={handleAudit}
                        />
                    </div>
                    <div className="divide-y divide-slate-50">
                        {associate.contacts?.length > 0 ? (
                            associate.contacts.map((c: any, i: number) => (
                                <div key={i} className="px-5 py-3.5">
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm leading-tight">{c.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">{c.position} · {c.area}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] font-medium text-slate-500">
                                        <span className="flex items-center gap-1"><MessageSquare size={11} className="text-slate-400" /> {c.email}</span>
                                        <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {c.phone}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-400 text-xs italic py-6">No hay contactos registrados</p>
                        )}
                    </div>
                </Card>

                {/* Referencias */}
                <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm h-fit">
                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                            Referencias Registradas
                            <Badge variant="outline" className="font-bold border-slate-200 text-[10px]">{associate.references?.length || 0}</Badge>
                        </h4>
                        <SectionAuditBar
                            fieldId="references"
                            status={getFieldStatus('references')}
                            changeRequest={getChangeRequest('references')}
                            onAudit={handleAudit}
                        />
                    </div>
                    <div className="divide-y divide-slate-50">
                        {associate.references?.length > 0 ? (
                            associate.references.map((r: any, i: number) => (
                                <div key={i} className="px-5 py-3.5">
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm leading-tight">{r.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
                                                {r.contact_person}{r.position ? ` · ${r.position}` : ''}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className={cn("text-[9px] font-black uppercase shrink-0",
                                            r.type === 'bank' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                        )}>
                                            {r.type === 'bank' ? 'Banco' : 'Comercial'}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] font-medium text-slate-500">
                                        {r.phone && <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {r.phone}</span>}
                                        {r.email && <span className="flex items-center gap-1"><MessageSquare size={11} className="text-slate-400" /> {r.email}</span>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-400 text-xs italic py-6">No hay referencias registradas</p>
                        )}
                    </div>
                </Card>

            </div>
        </TabsContent>
    );
}
