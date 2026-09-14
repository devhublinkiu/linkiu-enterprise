import { Link } from '@inertiajs/react';
import { ArrowRight, Receipt } from 'lucide-react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';

export function InvoicesCard({ unread }: { unread: number }) {
    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="size-4 text-muted-foreground" />
                    Facturas
                    {unread > 0 && (
                        <Badge className="ml-auto">{unread} sin leer</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    {unread > 0
                        ? `Tienes ${unread} factura${unread === 1 ? '' : 's'} sin revisar.`
                        : 'No tienes facturas pendientes de revisar.'}
                </p>
                <Button asChild variant="outline">
                    <Link href={route('associate.company.invoices.index')}>
                        Ver mis facturas
                        <ArrowRight />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
