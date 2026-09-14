import {
    AlertCircle,
    Check,
    CheckCircle2,
    Clock,
    Layers,
    ShieldCheck,
    Target,
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
import { Textarea } from '@/Components/base/Textarea';
import { TabsContent } from '@/Components/ui/Tabs';

import { SectionReviewData } from './SectionAuditPanel';

// Solo los campos de Servicios que se muestran (lectura). El admin no edita (ADR-0005 / 0005-d).
interface AssociateService {
    id: number;
    name?: string;
    category?: { id: number; name: string } | null;
}

interface AssociateServices {
    description?: string;
    services?: AssociateService[];
}

interface Props {
    associate: AssociateServices;
    sectionReview: SectionReviewData;
    onAuditSection: (
        section: string,
        status: 'approved' | 'rejected',
        reason?: string,
    ) => void;
}

// Panel de auditoría (solo Servicios): aprobar / rechazar. Sin change_pending (ADR-0005-d).
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
                        onClick={() => onAuditSection('services', 'approved')}
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
                    Revisa los datos y aprueba o rechaza la sección.
                </AlertDescription>
            </Alert>

            {!rejecting ? (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => onAuditSection('services', 'approved')}
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
                                onAuditSection('services', 'rejected', reason);
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

export function TabServices({
    associate,
    sectionReview,
    onAuditSection,
}: Props) {
    const services = associate.services ?? [];

    return (
        <TabsContent value="services" className="space-y-4">
            <AuditPanel
                review={sectionReview}
                onAuditSection={onAuditSection}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="size-4 text-muted-foreground" />
                        Propuesta de valor
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {associate.description ? (
                        <p className="whitespace-pre-line text-sm text-foreground">
                            {associate.description}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Sin propuesta de valor.
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Layers className="size-4 text-muted-foreground" />
                        Portafolio de servicios
                    </CardTitle>
                    <Badge variant="secondary">{services.length}</Badge>
                </CardHeader>
                <CardContent>
                    {services.length ? (
                        <div className="flex flex-wrap gap-2">
                            {services.map((s) => (
                                <Badge key={s.id} variant="secondary">
                                    {s.name}
                                    {s.category?.name
                                        ? ` · ${s.category.name}`
                                        : ''}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Sin servicios seleccionados.
                        </p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    );
}
