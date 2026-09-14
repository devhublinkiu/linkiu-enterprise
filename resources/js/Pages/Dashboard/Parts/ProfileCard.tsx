import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    Clock,
    MinusCircle,
    XCircle,
    type LucideIcon,
} from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Progress } from '@/Components/base/Progress';
import { cn } from '@/lib/utils';

type SectionKey =
    | 'basicinfo'
    | 'characterization'
    | 'contacts'
    | 'documentation'
    | 'services';

const SECTIONS: { key: SectionKey; label: string; route: string }[] = [
    {
        key: 'basicinfo',
        label: 'Información Básica',
        route: 'associate.company.basic',
    },
    {
        key: 'characterization',
        label: 'Caracterización',
        route: 'associate.company.characterization',
    },
    {
        key: 'contacts',
        label: 'Contactos',
        route: 'associate.company.contacts',
    },
    {
        key: 'documentation',
        label: 'Documentación',
        route: 'associate.company.documentation',
    },
    {
        key: 'services',
        label: 'Servicios',
        route: 'associate.company.services',
    },
];

const SECTION_STATUS: Record<
    string,
    { icon: LucideIcon; cls: string; label: string }
> = {
    approved: { icon: CheckCircle2, cls: 'text-success', label: 'Aprobada' },
    pending: { icon: Clock, cls: 'text-accent-strong', label: 'En revisión' },
    change_pending: {
        icon: AlertCircle,
        cls: 'text-accent-strong',
        label: 'Cambio pendiente',
    },
    rejected: { icon: XCircle, cls: 'text-destructive', label: 'Observada' },
    draft: {
        icon: MinusCircle,
        cls: 'text-muted-foreground',
        label: 'Sin enviar',
    },
};

function SectionRow({
    section,
    review,
}: {
    section: (typeof SECTIONS)[number];
    review?: { status: string };
}) {
    const cfg =
        SECTION_STATUS[review?.status || 'draft'] ?? SECTION_STATUS.draft;
    const Icon = cfg.icon;
    return (
        <Link
            href={route(section.route)}
            className="group -mx-2 flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted"
        >
            <span className="flex items-center gap-2.5">
                <Icon className={cn('size-4', cfg.cls)} />
                <span className="text-sm font-medium">{section.label}</span>
            </span>
            <span className="flex items-center gap-2">
                <span className={cn('text-xs font-medium', cfg.cls)}>
                    {cfg.label}
                </span>
                <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
        </Link>
    );
}

export function ProfileCard({
    sectionReviews,
    isPublic,
}: {
    sectionReviews: Record<string, { status: string }>;
    isPublic: boolean;
}) {
    const approved = SECTIONS.filter(
        (s) => sectionReviews[s.key]?.status === 'approved',
    ).length;
    const pct = Math.round((approved / SECTIONS.length) * 100);

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    Estado de mi perfil
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                        {approved}/{SECTIONS.length} secciones
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={pct} />
                {!isPublic && (
                    <p className="flex items-start gap-2 rounded-lg bg-accent-subtle p-3 text-xs text-accent-strong">
                        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                        Aún no apareces en el directorio público. Completa y
                        envía tus secciones para que el equipo las apruebe.
                    </p>
                )}
                <div className="divide-y">
                    {SECTIONS.map((section) => (
                        <SectionRow
                            key={section.key}
                            section={section}
                            review={sectionReviews[section.key]}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
