import { Check, Info } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/Components/base/Alert';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Progress } from '@/Components/base/Progress';
import { TabsContent } from '@/Components/ui/Tabs';

import { AdminState, ESTADO_BADGE } from '../types';

interface SectionStats {
    approved: number;
    pending: number;
    rejected: number;
    draft: number;
}

interface Props {
    estado: AdminState;
    sectionStats: SectionStats;
    total: number;
    progressPct: number;
    canAdmit: boolean;
    allApproved: boolean;
    alreadyAdmitted: boolean;
    handleApproveAll: () => void;
}

export function TabOverview({
    estado,
    sectionStats,
    total,
    progressPct,
    canAdmit,
    allApproved,
    alreadyAdmitted,
    handleApproveAll,
}: Props) {
    const badge = ESTADO_BADGE[estado];

    return (
        <TabsContent value="overview" className="space-y-4">
            <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">
                        Estado de la solicitud
                    </CardTitle>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Secciones aprobadas
                            </span>
                            <span className="font-medium">
                                {sectionStats.approved}/{total}
                            </span>
                        </div>
                        <Progress value={progressPct} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-muted/40 py-3">
                            <p className="text-lg font-semibold">
                                {sectionStats.pending}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Pendientes
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted/40 py-3">
                            <p className="text-lg font-semibold">
                                {sectionStats.rejected}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Con observaciones
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted/40 py-3">
                            <p className="text-lg font-semibold">
                                {sectionStats.draft}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                En borrador
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {alreadyAdmitted ? (
                <Alert variant="success">
                    <Check />
                    <AlertTitle>Empresa admitida</AlertTitle>
                    <AlertDescription>
                        Ya fue admitida. El estado depende ahora del pago de la
                        suscripción.
                    </AlertDescription>
                </Alert>
            ) : allApproved ? (
                <Card>
                    <CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Perfil completo
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Las {total} secciones están aprobadas. Puedes
                                admitir a la empresa como socia.
                            </p>
                        </div>
                        <Button onClick={handleApproveAll} disabled={!canAdmit}>
                            <Check className="size-4" /> Admitir socio
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Alert>
                    <Info />
                    <AlertTitle>Perfil incompleto</AlertTitle>
                    <AlertDescription>
                        Faltan {total - sectionStats.approved} secciones por
                        aprobar. La empresa podrá admitirse cuando todas estén
                        aprobadas.
                    </AlertDescription>
                </Alert>
            )}
        </TabsContent>
    );
}
