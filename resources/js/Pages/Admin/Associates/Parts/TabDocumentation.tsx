import React, { useState } from 'react';
import { FileText, ShieldCheck, X, ExternalLink, Check, Eye, Download } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/Card';
import { TabsContent } from '@/Components/ui/Tabs';
import { SectionAuditPanel, SectionReviewData } from './SectionAuditPanel';
import { cn } from '@/lib/utils';

interface TabDocumentationProps {
    associate: any;
    sectionReview: SectionReviewData;
    onAuditSection: (section: string, status: 'approved' | 'rejected', reason?: string) => void;
    onAuditChangeRequest: (section: string, action: 'approve' | 'reject', reason?: string) => void;
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

const DOC_NAMES = [
    'Carta Solicitud Afiliación', 'Logo HD (JPG/PNG)', 'Brochure/Portafolio', 'RUT',
    'Cámara y Comercio / Registro Mercantil', 'Estados financieros con notas',
    'Fotocopia de la cédula del representante legal', 'Antecedentes del contador público (Balance anterior)',
    'Composición Accionaria', 'Certificación Parafiscales', 'Declaración de aceptación del PTEEI',
    'Compromiso de autoregulacion', 'Transferencia de datos', 'Acuerdo de Afiliación',
    'Participación Accionaria', 'Certificado tamaño empresas', 'Carta de residencia del Representante Legal',
    'Última planilla de seguridad social', 'Certificaciones de calidad'
];

export function TabDocumentation({ associate, sectionReview, onAuditSection, onAuditChangeRequest }: TabDocumentationProps) {
    const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

    const uploadedDocs = DOC_NAMES.filter(d => !!associate.document_urls?.[d]);

    const handleDownload = (url: string, name: string) => {
        const a = document.createElement('a');
        a.href = url; a.download = name;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    return (
        <TabsContent value="docs" className="space-y-4">
            {previewDoc && (
                <DocPreviewModal url={previewDoc.url} name={previewDoc.name} onClose={() => setPreviewDoc(null)} />
            )}

            <SectionAuditPanel
                sectionKey="documentation"
                review={sectionReview}
                onAuditSection={onAuditSection}
                onAuditChangeRequest={onAuditChangeRequest}
            />

            {/* Declaraciones legales */}
            <Card className="border-slate-200 overflow-hidden rounded-2xl bg-white">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                        <ShieldCheck size={14} />
                    </div>
                    <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Declaraciones Legales</h4>
                </div>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100/60">
                        <div className="px-5 py-3">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block leading-none mb-0.5">Decl. Origen de Fondos</span>
                            <p className={cn("text-sm font-bold", associate.funds_origin_declaration ? "text-emerald-700" : "text-red-500")}>
                                {associate.funds_origin_declaration ? 'ACEPTADA / FIRMADA' : 'PENDIENTE'}
                            </p>
                        </div>
                        <div className="px-5 py-3">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block leading-none mb-0.5">Intereses de Afiliación</span>
                            <p className="text-sm font-bold text-slate-900">
                                {Array.isArray(associate.membership_interest) && associate.membership_interest.length > 0
                                    ? associate.membership_interest.join(', ')
                                    : <span className="text-slate-300 font-normal italic text-xs">Sin registrar</span>}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Archivos */}
            <Card className="border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                            <FileText size={13} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Documentación Oficial</h3>
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">Previsualiza y descarga</p>
                        </div>
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {uploadedDocs.length} archivos
                    </span>
                </div>

                <CardContent className="p-0">
                    {uploadedDocs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                            {[uploadedDocs.slice(0, Math.ceil(uploadedDocs.length / 2)), uploadedDocs.slice(Math.ceil(uploadedDocs.length / 2))].map((col, ci) => (
                                <div key={ci} className="divide-y divide-slate-100/60">
                                    {col.map(docName => {
                                        const fileUrl = associate.document_urls?.[docName];
                                        return (
                                            <div key={docName} className="px-4 py-2.5 hover:bg-slate-50/60 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full shrink-0 bg-emerald-500" />
                                                    <p className="text-[11px] font-bold text-slate-800 flex-1 min-w-0 truncate" title={docName}>{docName}</p>
                                                    {fileUrl && (
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button onClick={() => setPreviewDoc({ url: fileUrl, name: docName })}
                                                                className="h-6 w-6 rounded-md border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-all">
                                                                <Eye size={11} />
                                                            </button>
                                                            <button onClick={() => handleDownload(fileUrl, docName)}
                                                                className="h-6 w-6 rounded-md border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-all">
                                                                <Download size={11} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
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
