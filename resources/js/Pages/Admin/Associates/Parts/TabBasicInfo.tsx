import {
    AlertCircle,
    Building2,
    Check,
    CheckCircle2,
    Clock,
    MapPin,
    ShieldCheck,
    UserRound,
    X,
} from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/Components/base/Alert';
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

// Solo los campos de Información Básica que se muestran (lectura). El admin no edita (ADR-0005).
interface AssociateBasicInfo {
    company_name?: string;
    initials?: string;
    nit?: string;
    legal_status?: string;
    constitution_date?: string;
    country_origin?: string;
    department?: string;
    city?: string;
    address?: string;
    phone?: string;
    website?: string;
    rep_name?: string;
    rep_position?: string;
    rep_doc_type?: string;
    rep_doc?: string;
}

interface Props {
    associate: AssociateBasicInfo;
    sectionReview: SectionReviewData;
    onAuditSection: (
        section: string,
        status: 'approved' | 'rejected',
        reason?: string,
    ) => void;
}

const DOC_LABELS: Record<string, string> = {
    CC: 'Cédula de ciudadanía',
    CE: 'Cédula de extranjería',
    PAS: 'Pasaporte',
    NIT: 'NIT',
};

function ReadField({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">
                {value || <span className="text-muted-foreground">—</span>}
            </p>
        </div>
    );
}

// Panel de auditoría de la sección (solo Información Básica): aprobar / rechazar.
// basicinfo no usa change_pending (se reabre con "Editar" del asociado). Ver ADR-0005-a.
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
                        onClick={() => onAuditSection('basicinfo', 'approved')}
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
                        onClick={() => onAuditSection('basicinfo', 'approved')}
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
                                onAuditSection('basicinfo', 'rejected', reason);
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

export function TabBasicInfo({
    associate,
    sectionReview,
    onAuditSection,
}: Props) {
    const docType = associate.rep_doc_type;
    const constitution = associate.constitution_date;

    return (
        <TabsContent value="basic" className="space-y-4">
            <AuditPanel
                review={sectionReview}
                onAuditSection={onAuditSection}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Building2 className="size-4 text-muted-foreground" />
                        Identificación corporativa
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <ReadField
                        label="Razón social"
                        value={associate.company_name}
                    />
                    <ReadField label="Sigla" value={associate.initials} />
                    <ReadField label="NIT" value={associate.nit} />
                    <ReadField
                        label="Tipo de sociedad"
                        value={associate.legal_status}
                    />
                    <ReadField
                        label="Fecha de constitución"
                        value={constitution ? constitution.split('T')[0] : null}
                    />
                    <ReadField
                        label="País de origen"
                        value={associate.country_origin}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="size-4 text-muted-foreground" />
                        Ubicación y contacto
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <ReadField
                        label="Departamento"
                        value={associate.department}
                    />
                    <ReadField
                        label="Ciudad / Municipio"
                        value={associate.city}
                    />
                    <ReadField label="Dirección" value={associate.address} />
                    <ReadField label="Teléfono" value={associate.phone} />
                    <ReadField label="Sitio web" value={associate.website} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <UserRound className="size-4 text-muted-foreground" />
                        Representante legal
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <ReadField
                        label="Nombre completo"
                        value={associate.rep_name}
                    />
                    <ReadField label="Cargo" value={associate.rep_position} />
                    <ReadField
                        label="Tipo de documento"
                        value={
                            docType ? (DOC_LABELS[docType] ?? docType) : null
                        }
                    />
                    <ReadField
                        label="Número de documento"
                        value={associate.rep_doc}
                    />
                </CardContent>
            </Card>
        </TabsContent>
    );
}
