import React, { useState } from 'react';
import { FileText, ShieldCheck, X, ExternalLink, Check, Eye, Download, AlertTriangle, RotateCcw, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { TabsContent } from '@/Components/ui/Tabs';
import { AuditSection } from './AuditSection';
import { cn } from '@/lib/utils';

interface TabDocumentationProps {
    associate: any;
    auditState: any;
    getFieldStatus: (field: string) => string;
    getChangeRequest: (field: string) => any;
    handleAudit: (field: string, status: string, reason?: string) => void;
    docNames: string[];
}

function DocPreviewModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                            <FileText size={13} className="text-white" />
                        </div>
                        <p className="text-[11px] font-black uppercase text-slate-700 tracking-wide truncate">{name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                        <a href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 transition-all hover:bg-slate-50">
                            <ExternalLink size={12} /> Abrir en pestaña
                        </a>
                        <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                            <X size={16} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden bg-slate-50 min-h-0">
                    {isImage ? (
                        <div className="h-full flex items-center justify-center p-6">
                            <img src={url} alt={name} className="max-w-full max-h-full object-contain rounded-xl" />
                        </div>
                    ) : (
                        <iframe src={url} title={name} className="w-full h-full min-h-[65vh] border-0" />
                    )}
                </div>
            </div>
        </div>
    );
}

// Fila compacta para cada documento
function DocRow({ docName, status, reason, changeRequest, fileUrl, onAudit, onPreview }: {
    docName: string;
    status: string;
    reason?: string;
    changeRequest: any;
    fileUrl?: string;
    onAudit: (s: 'approved' | 'rejected' | 'reset', r?: string) => void;
    onPreview: (url: string, name: string) => void;
}) {
    const [rejecting, setRejecting]   = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleDownload = () => {
        if (!fileUrl) return;
        const a = document.createElement('a');
        a.href = fileUrl; a.download = docName;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    return (
        <div className="px-4 py-2.5 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-center gap-3">
                {/* Status dot */}
                <div className={cn("h-2 w-2 rounded-full shrink-0",
                    status === 'approved' ? 'bg-emerald-500' :
                    status === 'rejected' ? 'bg-red-500' : 'bg-amber-400'
                )} />

                {/* Name */}
                <p className="text-[11px] font-bold text-slate-800 flex-1 min-w-0 truncate" title={docName}>{docName}</p>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    {fileUrl && (
                        <>
                            <button onClick={() => onPreview(fileUrl, docName)}
                                className="h-6 w-6 rounded-md border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-all">
                                <Eye size={11} />
                            </button>
                            <button onClick={handleDownload}
                                className="h-6 w-6 rounded-md border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-all">
                                <Download size={11} />
                            </button>
                        </>
                    )}

                    {status === 'pending' ? (
                        <>
                            <button onClick={() => onAudit('approved')}
                                className="h-6 w-6 rounded-md bg-slate-900 hover:bg-slate-700 text-white flex items-center justify-center transition-all">
                                <Check size={11} />
                            </button>
                            <button onClick={() => setRejecting(true)}
                                className="h-6 w-6 rounded-md border border-slate-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">
                                <X size={11} />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-1">
                            <span className={cn("text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full",
                                status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            )}>
                                {status === 'approved' ? 'Ok' : 'Obs.'}
                            </span>
                            {changeRequest ? (
                                <button onClick={() => onAudit('reset')}
                                    className="text-[9px] font-black uppercase text-amber-600 border border-amber-200 hover:bg-amber-50 px-1.5 py-0.5 rounded-lg transition-all flex items-center gap-0.5">
                                    <RotateCcw size={8} /> Cambio
                                </button>
                            ) : (
                                <button onClick={() => onAudit('reset')}
                                    className="text-[9px] text-slate-300 hover:text-slate-500 transition-colors px-1">↺</button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Change request */}
            {changeRequest && (
                <div className="ml-5 mt-1.5 p-2 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-1.5">
                    <AlertTriangle size={11} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700 font-medium italic truncate">"{changeRequest.reason}"</p>
                </div>
            )}

            {/* Rejection reason */}
            {status === 'rejected' && reason && (
                <p className="ml-5 mt-1 text-[10px] font-bold text-red-500 flex items-center gap-1">
                    <MessageSquare size={9} /> {reason}
                </p>
            )}

            {/* Rejection form */}
            {rejecting && (
                <div className="ml-5 mt-2 flex gap-1.5">
                    <Input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                        placeholder="Motivo del rechazo..." autoFocus
                        className="h-7 text-xs border-red-200 flex-1" />
                    <Button onClick={() => { onAudit('rejected', rejectReason); setRejecting(false); setRejectReason(''); }}
                        disabled={!rejectReason.trim()}
                        className="h-7 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 shrink-0">Ok</Button>
                    <button onClick={() => setRejecting(false)}
                        className="h-7 w-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0">
                        <X size={12} />
                    </button>
                </div>
            )}
        </div>
    );
}

export function TabDocumentation({ associate, auditState, getFieldStatus, getChangeRequest, handleAudit, docNames }: TabDocumentationProps) {
    const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

    const uploadedDocs = docNames.filter(d => !!associate.document_urls?.[d]);
    const approvedDocs = uploadedDocs.filter(d => auditState[`files.${d}`]?.status === 'approved').length;

    return (
        <TabsContent value="docs" className="space-y-4">
            {previewDoc && (
                <DocPreviewModal url={previewDoc.url} name={previewDoc.name} onClose={() => setPreviewDoc(null)} />
            )}

            {/* ── 1. Declaraciones — rápido de auditar, van arriba ─────────── */}
            <AuditSection
                title="Declaraciones Legales"
                icon={ShieldCheck}
                onAudit={handleAudit}
                items={[
                    {
                        id: 'funds_origin_declaration',
                        label: 'Decl. Origen de Fondos',
                        value: associate.funds_origin_declaration ? 'ACEPTADA / FIRMADA' : 'PENDIENTE',
                        status: getFieldStatus('funds_origin_declaration') as any,
                        reason: auditState['funds_origin_declaration']?.reason,
                        changeRequest: getChangeRequest('funds_origin_declaration')
                    },
                    {
                        id: 'membership_interest',
                        label: 'Intereses de Afiliación',
                        value: Array.isArray(associate.membership_interest)
                            ? associate.membership_interest.join(', ')
                            : associate.membership_interest,
                        status: getFieldStatus('membership_interest') as any,
                        reason: auditState['membership_interest']?.reason,
                        changeRequest: getChangeRequest('membership_interest')
                    },
                ]}
            />

            {/* ── 2. Archivos — lista compacta ─────────────────────────────── */}
            <Card className="border-slate-200 rounded-2xl overflow-hidden bg-white">
                {/* Header */}
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                            <FileText size={13} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Documentación Oficial</h3>
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">Previsualiza · Aprueba · Rechaza</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                            {approvedDocs}/{uploadedDocs.length} aprobados
                        </span>
                        <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {uploadedDocs.length} archivos
                        </span>
                    </div>
                </div>

                <CardContent className="p-0">
                    {uploadedDocs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                            <div className="divide-y divide-slate-100/60">
                                {uploadedDocs.slice(0, Math.ceil(uploadedDocs.length / 2)).map(docName => (
                                    <DocRow
                                        key={docName}
                                        docName={docName}
                                        status={getFieldStatus(`files.${docName}`)}
                                        reason={auditState[`files.${docName}`]?.reason}
                                        changeRequest={getChangeRequest(`files.${docName}`)}
                                        fileUrl={associate.document_urls?.[docName]}
                                        onAudit={(s, r) => handleAudit(`files.${docName}`, s, r || '')}
                                        onPreview={(url, name) => setPreviewDoc({ url, name })}
                                    />
                                ))}
                            </div>
                            <div className="divide-y divide-slate-100/60">
                                {uploadedDocs.slice(Math.ceil(uploadedDocs.length / 2)).map(docName => (
                                    <DocRow
                                        key={docName}
                                        docName={docName}
                                        status={getFieldStatus(`files.${docName}`)}
                                        reason={auditState[`files.${docName}`]?.reason}
                                        changeRequest={getChangeRequest(`files.${docName}`)}
                                        fileUrl={associate.document_urls?.[docName]}
                                        onAudit={(s, r) => handleAudit(`files.${docName}`, s, r || '')}
                                        onPreview={(url, name) => setPreviewDoc({ url, name })}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <FileText size={36} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-slate-400 text-sm italic">No se han cargado documentos</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    );
}
