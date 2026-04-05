import React, { useState } from 'react';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { 
    Check, 
    X, 
    MessageSquare, 
    Download,
    Eye,
    FileText,
    AlertTriangle,
    RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileAuditItemProps {
    id: string;
    name: string;
    status: 'approved' | 'rejected' | 'pending';
    reason?: string;
    fileUrl?: string;
    changeRequest?: {
        reason: string;
        requested_at: string;
        requested_by: string;
    } | null;
    onAudit: (status: 'approved' | 'rejected' | 'reset', reason: string) => void;
    onPreview?: (url: string, name: string) => void;
}

export function FileAuditItem({ id, name, status, reason, fileUrl, changeRequest, onAudit, onPreview }: FileAuditItemProps) {
    const [isRejecting, setIsRejecting] = useState(false);
    const [localReason, setLocalReason] = useState('');

    const handleDownload = () => {
        if (!fileUrl) return;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 group font-sans">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">{name}</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">
                            {status === 'pending' ? 'Documento pendiente de revisión' : (status === 'approved' ? 'Verificado' : 'Rechazado')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button
                        onClick={handleDownload}
                        disabled={!fileUrl}
                        variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg"
                    >
                        <Download size={14} />
                    </Button>
                    <Button
                        onClick={() => fileUrl && onPreview?.(fileUrl, name)}
                        disabled={!fileUrl}
                        variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg"
                    >
                        <Eye size={14} />
                    </Button>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50">
                {status === 'pending' ? (
                    <div className="space-y-3">
                        {!isRejecting ? (
                            <div className="flex items-center gap-2">
                                <Button 
                                    onClick={() => onAudit('approved', '')}
                                    className="flex-1 h-8 text-[10px] font-bold uppercase bg-slate-900 hover:bg-slate-800 rounded-lg"
                                >Aprobar</Button>
                                <Button 
                                    onClick={() => setIsRejecting(true)}
                                    variant="outline" className="flex-1 h-8 text-[10px] font-bold uppercase border-slate-200 text-red-600 hover:bg-red-50 rounded-lg"
                                >Rechazar</Button>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-top-1 duration-200">
                                <Label className="text-[10px] font-black uppercase text-red-900 mb-1.5 block">Motivo del Rechazo</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={localReason}
                                        onChange={(e) => setLocalReason(e.target.value)}
                                        placeholder="Ej. Formato inválido..."
                                        className="h-8 text-xs border-red-200 focus-visible:ring-red-500"
                                    />
                                    <Button 
                                        onClick={() => {
                                            onAudit('rejected', localReason);
                                            setIsRejecting(false);
                                        }}
                                        disabled={!localReason.trim()}
                                        className="h-8 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase px-3"
                                >Ok</Button>
                                <Button 
                                    onClick={() => setIsRejecting(false)}
                                    variant="ghost" className="h-8 text-[10px] font-bold uppercase px-2"
                                >X</Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full">
                        <div className={cn("flex items-center gap-2 mb-1 text-[10px] font-black uppercase tracking-wider", 
                            status === 'approved' ? 'text-emerald-600' : 'text-red-600'
                        )}>
                            {status === 'approved' ? <Check size={14} /> : <X size={14} />}
                            <span>{status === 'approved' ? 'Documento Aprobado' : 'Documento Rechazado'}</span>
                        </div>
                        {status === 'rejected' && reason && (
                            <p className="text-[10px] font-bold text-red-500 pl-5 italic opacity-80">{reason}</p>
                        )}
                        {changeRequest && (
                            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2 shadow-sm animate-in zoom-in-95">
                                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-amber-900 leading-tight">Solicitud de modificación</p>
                                    <p className="text-[11px] text-amber-800 font-medium mt-1 italic">"{changeRequest.reason}"</p>
                                    <p className="text-[9px] text-amber-500 font-bold mt-1 uppercase">Solicitado por {changeRequest.requested_by} • {new Date(changeRequest.requested_at).toLocaleDateString()}</p>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => onAudit('reset', '')}
                                        className="h-7 mt-2 text-[9px] font-black uppercase text-amber-600 border-amber-200 hover:bg-amber-50 w-full"
                                    >
                                        <RotateCcw size={10} className="mr-1" />
                                        Permitir Nueva Carga
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
