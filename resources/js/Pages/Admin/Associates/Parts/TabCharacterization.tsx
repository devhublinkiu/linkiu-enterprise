import {
    AlertCircle,
    Briefcase,
    Check,
    CheckCircle2,
    Clock,
    GraduationCap,
    Layers,
    ShieldAlert,
    ShieldCheck,
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

// Solo los campos de Caracterización que se muestran (lectura). El admin no edita (ADR-0005).
interface AssociateCharacterization {
    employees_tech?: number;
    employees_prof?: number;
    employees_admin?: number;
    employees_exec?: number;
    employees_other?: number;
    employees_other_desc?: string;
    employees_direct_count?: number;
    company_classification?: string;
    hydrocarbons_participation?: boolean | null;
    hydrocarbons_level?: string;
    pep_declaration?: boolean | null;
    pep_name?: string;
    pep_doc_type?: string;
    pep_entity?: string;
    public_income_pct?: number;
    private_income_pct?: number;
    capacitation_plan?: boolean | null;
    capacitation_level?: string;
    capacitation_no_reason?: string;
    other_guilds?: string;
}

interface Props {
    associate: AssociateCharacterization;
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

const yesNo = (v: boolean | null | undefined): string | null =>
    v === null || v === undefined ? null : v ? 'Sí' : 'No';

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

// Panel de auditoría de la sección (solo Caracterización): aprobar / rechazar.
// characterization no usa change_pending (se reabre con "Editar" del asociado). Ver ADR-0005-b.
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
                            onAuditSection('characterization', 'approved')
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
                    Revisa los datos y aprueba o rechaza la sección.
                </AlertDescription>
            </Alert>

            {!rejecting ? (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() =>
                            onAuditSection('characterization', 'approved')
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
                                    'characterization',
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

export function TabCharacterization({
    associate,
    sectionReview,
    onAuditSection,
}: Props) {
    const docType = associate.pep_doc_type;
    const num = (v: number | undefined) => String(v ?? 0);
    const pct = (v: number | undefined) => (v != null ? `${v}%` : null);

    return (
        <TabsContent value="characterization" className="space-y-4">
            <AuditPanel
                review={sectionReview}
                onAuditSection={onAuditSection}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Briefcase className="size-4 text-muted-foreground" />
                        Estructura de empleados
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                    <ReadField
                        label="Total (directos)"
                        value={num(associate.employees_direct_count)}
                    />
                    <ReadField
                        label="Técnicos"
                        value={num(associate.employees_tech)}
                    />
                    <ReadField
                        label="Profesionales"
                        value={num(associate.employees_prof)}
                    />
                    <ReadField
                        label="Administrativos"
                        value={num(associate.employees_admin)}
                    />
                    <ReadField
                        label="Directivos"
                        value={num(associate.employees_exec)}
                    />
                    <ReadField
                        label="Otros"
                        value={num(associate.employees_other)}
                    />
                    {!!associate.employees_other_desc && (
                        <ReadField
                            label='Descripción de "Otros"'
                            value={associate.employees_other_desc}
                        />
                    )}
                    <ReadField
                        label="Tamaño de la organización"
                        value={associate.company_classification}
                    />
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Layers className="size-4 text-muted-foreground" />
                            Sector e ingresos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <ReadField
                            label="Participa en hidrocarburos"
                            value={yesNo(associate.hydrocarbons_participation)}
                        />
                        {associate.hydrocarbons_participation && (
                            <ReadField
                                label="Nivel de alcance"
                                value={associate.hydrocarbons_level}
                            />
                        )}
                        <ReadField
                            label="Ingresos sector público"
                            value={pct(associate.public_income_pct)}
                        />
                        <ReadField
                            label="Ingresos sector privado"
                            value={pct(associate.private_income_pct)}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldAlert className="size-4 text-muted-foreground" />
                            PEP y transparencia
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <ReadField
                            label="Declaración PEP"
                            value={yesNo(associate.pep_declaration)}
                        />
                        {associate.pep_declaration && (
                            <>
                                <ReadField
                                    label="Nombre del PEP"
                                    value={associate.pep_name}
                                />
                                <ReadField
                                    label="Tipo de documento"
                                    value={
                                        docType
                                            ? (DOC_LABELS[docType] ?? docType)
                                            : null
                                    }
                                />
                                <ReadField
                                    label="Entidad vinculada"
                                    value={associate.pep_entity}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <GraduationCap className="size-4 text-muted-foreground" />
                        Capacitación y gremios
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <ReadField
                        label="Plan de capacitación"
                        value={yesNo(associate.capacitation_plan)}
                    />
                    {associate.capacitation_plan === true && (
                        <ReadField
                            label="Nivel que prioriza"
                            value={associate.capacitation_level}
                        />
                    )}
                    {associate.capacitation_plan === false && (
                        <ReadField
                            label="Motivo sin plan"
                            value={associate.capacitation_no_reason}
                        />
                    )}
                    <ReadField
                        label="Otros gremios"
                        value={associate.other_guilds}
                    />
                </CardContent>
            </Card>
        </TabsContent>
    );
}
