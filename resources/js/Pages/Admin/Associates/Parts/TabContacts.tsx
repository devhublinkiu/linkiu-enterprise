import {
    AlertCircle,
    Briefcase,
    Building2,
    Check,
    CheckCircle2,
    Clock,
    Globe,
    Landmark,
    Mail,
    Phone,
    ShieldCheck,
    Users,
    X,
} from 'lucide-react';
import { ReactNode, useState } from 'react';

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

import { SectionReviewData } from './section-review';

// Solo los campos de Contactos que se muestran (lectura). El admin no edita (ADR-0005 / 0005-c).
interface ContactItem {
    name?: string;
    position?: string;
    area?: string;
    email?: string;
    phone?: string;
}

interface ReferenceItem {
    type?: string;
    name?: string;
    contact_person?: string;
    position?: string;
    email?: string;
    phone?: string;
}

interface AssociateContacts {
    main_ciiu?: string;
    secondary_ciiu?: string;
    billing_email?: string;
    company_type?: string[] | string;
    social_instagram?: string;
    social_facebook?: string;
    social_linkedin?: string;
    social_other?: string;
    contacts?: ContactItem[];
    references?: ReferenceItem[];
}

interface Props {
    associate: AssociateContacts;
    sectionReview: SectionReviewData;
    onAuditSection: (
        section: string,
        status: 'approved' | 'rejected',
        reason?: string,
    ) => void;
}

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

function EmptyList({ text }: { text: string }) {
    return <p className="text-sm text-muted-foreground">{text}</p>;
}

// Panel de auditoría de la sección (solo Contactos): aprobar / rechazar.
// contacts no usa change_pending (se reabre con "Editar" del asociado). Ver ADR-0005-c.
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
                        onClick={() => onAuditSection('contacts', 'approved')}
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
                        onClick={() => onAuditSection('contacts', 'approved')}
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
                                onAuditSection('contacts', 'rejected', reason);
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

export function TabContacts({
    associate,
    sectionReview,
    onAuditSection,
}: Props) {
    const contacts = associate.contacts ?? [];
    const references = associate.references ?? [];
    const companyType = Array.isArray(associate.company_type)
        ? associate.company_type.join(', ')
        : associate.company_type;

    return (
        <TabsContent value="contacts" className="space-y-4">
            <AuditPanel
                review={sectionReview}
                onAuditSection={onAuditSection}
            />

            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Users className="size-4 text-muted-foreground" />
                        Directorio de contactos
                    </CardTitle>
                    <Badge variant="secondary">{contacts.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                    {contacts.length ? (
                        contacts.map((c, i) => (
                            <div key={i} className="rounded-lg border p-3">
                                <p className="text-sm font-medium text-foreground">
                                    {c.name || '—'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {[c.position, c.area]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
                                    {c.email && (
                                        <span className="flex items-center gap-1">
                                            <Mail className="size-3.5" />
                                            {c.email}
                                        </span>
                                    )}
                                    {c.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="size-3.5" />
                                            {c.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyList text="Sin contactos registrados." />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Briefcase className="size-4 text-muted-foreground" />
                        Comercial y facturación
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <ReadField
                        label="CIIU principal"
                        value={associate.main_ciiu}
                    />
                    <ReadField
                        label="CIIU secundario"
                        value={associate.secondary_ciiu}
                    />
                    <ReadField
                        label="Email de facturación"
                        value={associate.billing_email}
                    />
                    <ReadField
                        label="Perfil de operación"
                        value={companyType}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldCheck className="size-4 text-muted-foreground" />
                        Referencias de respaldo
                    </CardTitle>
                    <Badge variant="secondary">{references.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                    {references.length ? (
                        references.map((r, i) => {
                            const isBank = r.type === 'bank';
                            return (
                                <div key={i} className="rounded-lg border p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {r.name || '—'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {[r.contact_person, r.position]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="gap-1.5"
                                        >
                                            {isBank ? (
                                                <Landmark className="size-3.5" />
                                            ) : (
                                                <Building2 className="size-3.5" />
                                            )}
                                            {isBank ? 'Bancaria' : 'Comercial'}
                                        </Badge>
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
                                        {r.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="size-3.5" />
                                                {r.phone}
                                            </span>
                                        )}
                                        {r.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="size-3.5" />
                                                {r.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <EmptyList text="Sin referencias registradas." />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Globe className="size-4 text-muted-foreground" />
                        Canales digitales
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <ReadField
                        label="Instagram"
                        value={associate.social_instagram}
                    />
                    <ReadField
                        label="Facebook"
                        value={associate.social_facebook}
                    />
                    <ReadField
                        label="LinkedIn"
                        value={associate.social_linkedin}
                    />
                    <ReadField
                        label="Sitio web / portafolio"
                        value={associate.social_other}
                    />
                </CardContent>
            </Card>
        </TabsContent>
    );
}
