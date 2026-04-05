import React, { useState } from 'react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { 
    Check, 
    X, 
    MessageSquare, 
    RotateCcw,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditItem {
    id: string;
    label: string;
    value: any;
    status: 'approved' | 'rejected' | 'pending';
    reason?: string;
    required?: boolean;
    changeRequest?: {
        reason: string;
        requested_at: string;
        requested_by: string;
    } | null;
}

interface AuditSectionProps {
    title: string;
    icon: any;
    items: AuditItem[];
    onAudit: (field: string, status: 'approved' | 'rejected' | 'reset', reason?: string) => void;
}

export function AuditSection({ title, icon: Icon, items, onAudit }: AuditSectionProps) {
    const [rejectionField, setRejectionField] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    return (
        <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white h-fit">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                    <Icon size={14} />
                </div>
                <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">{title}</h4>
            </div>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100/60">
                    {items.map((item, index) => (
                        <div key={index} className="px-5 py-3 hover:bg-slate-50/40 transition-colors">
                            <div className="flex items-center justify-between gap-4">
                                {/* Label + Value inline */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="min-w-0">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block leading-none mb-0.5">
                                            {item.label}
                                        </span>
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {item.value || <span className="text-slate-300 font-normal italic text-xs">Sin registrar</span>}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="shrink-0">
                                    {item.status === 'pending' ? (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => onAudit(item.id, 'approved')}
                                                className="h-7 w-7 rounded-lg bg-slate-900 hover:bg-slate-700 text-white flex items-center justify-center transition-all"
                                            >
                                                <Check size={12} />
                                            </button>
                                            <button
                                                onClick={() => setRejectionField(item.id)}
                                                className="h-7 w-7 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            )}>
                                                {item.status === 'approved' ? 'Ok' : 'Obs.'}
                                            </span>
                                            {item.changeRequest ? (
                                                <button onClick={() => onAudit(item.id, 'reset')}
                                                    className="text-[9px] font-black uppercase text-amber-600 border border-amber-200 hover:bg-amber-50 px-2 py-0.5 rounded-lg transition-all flex items-center gap-1">
                                                    <RotateCcw size={9} /> Cambio
                                                </button>
                                            ) : (
                                                <button onClick={() => onAudit(item.id, 'reset')}
                                                    className="text-[8px] font-bold uppercase text-slate-300 hover:text-slate-600 transition-colors px-1">
                                                    ↺
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Change Request */}
                            {item.changeRequest && (
                                <div className="mt-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
                                    <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase text-amber-800 leading-none mb-0.5">Solicitud de cambio</p>
                                        <p className="text-[10px] text-amber-700 font-medium italic truncate">"{item.changeRequest.reason}"</p>
                                    </div>
                                </div>
                            )}

                            {/* Rejection form */}
                            {rejectionField === item.id && (
                                <div className="mt-2 flex gap-2">
                                    <Input
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                        placeholder="Motivo del rechazo..."
                                        className="h-8 text-xs border-red-200 focus-visible:ring-red-400 bg-white flex-1"
                                        autoFocus
                                    />
                                    <Button onClick={() => { onAudit(item.id, 'rejected', rejectionReason); setRejectionField(null); setRejectionReason(''); }}
                                        disabled={!rejectionReason.trim()}
                                        className="h-8 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase px-3 shrink-0">
                                        Ok
                                    </Button>
                                    <button onClick={() => setRejectionField(null)}
                                        className="h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0">
                                        <X size={13} />
                                    </button>
                                </div>
                            )}

                            {/* Rejection reason */}
                            {item.status === 'rejected' && item.reason && (
                                <p className="mt-1.5 text-[10px] font-bold text-red-500 flex items-center gap-1">
                                    <MessageSquare size={10} /> {item.reason}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
