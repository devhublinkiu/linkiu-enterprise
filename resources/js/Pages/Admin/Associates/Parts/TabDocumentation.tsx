import {
    AlertCircle,
    Archive,
    Check,
    CheckCircle2,
    Clock,
    ExternalLink,
    Eye,
    FileText,
    ShieldCheck,
    X,
} from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/Components/base/Alert';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import { Textarea } from '@/Components/base/Textarea';
import { TabsContent } from '@/Components/ui/Tabs';

import { SectionReviewData } from './SectionAuditPanel';

interface DocSpec {
    key: string;
    label: string;
    icon: string;
    accepts: string[];
    legend?: string | null;
    template?: string | null;
}

interface DocumentCatalog {
    mandatory: DocSpec[];
    optional: DocSpec[];
}

// Solo los campos de Documentación que se leen. El admin no edita (ADR-0005 / 0005-e).
interface AssociateDocs {
    document_urls?: Record<string, string>;
    funds_origin_declaration?: boolean;
    membership_interest?: string[];
    membership_interest_other?: string | null;
}

interface Props {
    associate: AssociateDocs;
    sectionReview: SectionReviewData;
    onAuditSection: (
        section: string,
        status: 'approved' | 'rejected',
        reason?: string,
    ) => void;
    documentCatalog: DocumentCatalog;
}

const isImageUrl = (url: string) =>
    /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);

// Panel de auditoría (solo Documentación): aprobar / rechazar. Sin change_pending (ADR-0005-e).
function AuditPanel({
    review,
    onAuditSection,
}: {
    review: SectionReviewData;
    onAuditSection: Props['onAuditSection'];
}) {
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState('');
    const status = review.status;

    if (status === 'draft') {
        return (
            <Alert>
                <Clock />
                <AlertTitle>Borrador</AlertTitle>
                <AlertDescription>
                    El asociado aún no ha enviado esta sección.
                </AlertDescription>
            </Alert>
        );
    }

    if (status === 'approved') {
        return (
            <Alert variant="success">
                <CheckCircle2 />
                <AlertTitle>Sección aprobada</AlertTitle>
                <AlertDescription>
                    {review.reviewed_by
                        ? `Aprobada por ${review.reviewed_by}.`
                        : 'Esta sección está aprobada.'}
                </AlertDescription>
            </Alert>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="space-y-3">
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>Sección rechazada</AlertTitle>
                    <AlertDescription>
                        {review.rejected_reason
                            ? `Motivo: ${review.rejected_reason}`
                            : 'A la espera de que el asociado corrija y reenvíe.'}
                    </AlertDescription>
                </Alert>
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        onClick={() =>
                            onAuditSection('documentation', 'approved')
                        }
                    >
                        <Check /> Re-aprobar
                    </Button>
                </div>
            </div>
        );
    }

    // status === 'pending'
    return (
        <div className="space-y-3">
            <Alert>
                <ShieldCheck />
                <AlertTitle>Pendiente de revisión</AlertTitle>
                <AlertDescription>
                    Revisa los documentos y aprueba o rechaza la sección.
                </AlertDescription>
            </Alert>

            {!rejecting ? (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() =>
                            onAuditSection('documentation', 'approved')
                        }
                    >
                        <Check /> Aprobar sección
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejecting(true)}
                    >
                        <X /> Rechazar
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Motivo del rechazo (se enviará al asociado)…"
                        maxLength={1000}
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="destructive"
                            disabled={!reason.trim()}
                            onClick={() => {
                                onAuditSection(
                                    'documentation',
                                    'rejected',
                                    reason,
                                );
                                setRejecting(false);
                                setReason('');
                            }}
                        >
                            <X /> Confirmar rechazo
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setRejecting(false);
                                setReason('');
                            }}
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function TabDocumentation({
    associate,
    sectionReview,
    onAuditSection,
    documentCatalog,
}: Props) {
    const [previewDoc, setPreviewDoc] = useState<{
        url: string;
        name: string;
    } | null>(null);

    const urls = associate.document_urls ?? {};
    const allDocs = [...documentCatalog.mandatory, ...documentCatalog.optional];
    const catalogKeys = new Set(allDocs.map((d) => d.key));
    const uploadedDocs = allDocs.filter((d) => !!urls[d.key]);

    // Archivos cuya clave ya no está en el catálogo activo: se preservan para referencia.
    const orphanDocs = Object.entries(urls)
        .filter(
            ([key]) =>
                !catalogKeys.has(key) && key !== 'logo' && key !== 'cover',
        )
        .map(([key, url]) => ({ key, url }));

    const interests = Array.isArray(associate.membership_interest)
        ? associate.membership_interest
        : [];

    return (
        <TabsContent value="docs" className="space-y-4">
            <AuditPanel
                review={sectionReview}
                onAuditSection={onAuditSection}
            />

            {/* Declaraciones */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldCheck className="size-4 text-muted-foreground" />
                        Declaraciones e interés
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                            Declaración de origen de fondos
                        </span>
                        {associate.funds_origin_declaration ? (
                            <Badge variant="secondary">Aceptada</Badge>
                        ) : (
                            <Badge variant="outline">Pendiente</Badge>
                        )}
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">
                            Interés de afiliación
                        </span>
                        {interests.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {interests.map((i) => (
                                    <Badge key={i} variant="secondary">
                                        {i}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                Sin registrar.
                            </p>
                        )}
                        {associate.membership_interest_other && (
                            <p className="text-muted-foreground">
                                Otro: {associate.membership_interest_other}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Documentos */}
            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="size-4 text-muted-foreground" />
                        Documentación oficial
                    </CardTitle>
                    <Badge variant="secondary">{uploadedDocs.length}</Badge>
                </CardHeader>
                <CardContent>
                    {uploadedDocs.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {uploadedDocs.map((doc) => (
                                <li
                                    key={doc.key}
                                    className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                                >
                                    <span className="min-w-0 truncate text-sm text-foreground">
                                        {doc.label}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setPreviewDoc({
                                                url: urls[doc.key],
                                                name: doc.label,
                                            })
                                        }
                                    >
                                        <Eye className="size-4" /> Ver
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No se han cargado documentos.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Documentos históricos (clave fuera del catálogo activo) */}
            {orphanDocs.length > 0 && (
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Archive className="size-4 text-muted-foreground" />
                            Documentos históricos
                        </CardTitle>
                        <Badge variant="outline">{orphanDocs.length}</Badge>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-3 text-xs text-muted-foreground">
                            Archivos cuyo tipo ya no está activo en el catálogo.
                            Se conservan para referencia.
                        </p>
                        <ul className="divide-y divide-border">
                            {orphanDocs.map((doc) => (
                                <li
                                    key={doc.key}
                                    className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                                >
                                    <code className="min-w-0 truncate text-xs text-muted-foreground">
                                        {doc.key}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setPreviewDoc({
                                                url: doc.url,
                                                name: doc.key,
                                            })
                                        }
                                    >
                                        <Eye className="size-4" /> Ver
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Dialog
                open={!!previewDoc}
                onOpenChange={(o) => !o && setPreviewDoc(null)}
            >
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{previewDoc?.name}</DialogTitle>
                    </DialogHeader>
                    {previewDoc &&
                        (isImageUrl(previewDoc.url) ? (
                            <img
                                src={previewDoc.url}
                                alt={previewDoc.name}
                                className="max-h-[70vh] w-full rounded-lg object-contain"
                            />
                        ) : (
                            <iframe
                                src={previewDoc.url}
                                title={previewDoc.name}
                                className="h-[70vh] w-full rounded-lg border-0"
                            />
                        ))}
                    <DialogFooter>
                        {previewDoc && (
                            <Button asChild variant="outline">
                                <a
                                    href={previewDoc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="size-4" /> Abrir en
                                    pestaña
                                </a>
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TabsContent>
    );
}
