import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Briefcase,
    Building2,
    Image as ImageIcon,
    Lock,
    Megaphone,
    Network,
    Star,
    Trophy,
    type LucideIcon,
} from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';

type QuickModule = {
    label: string;
    icon: LucideIcon;
    route?: string;
    soon?: boolean;
    // Requiere suscripción activa (todos los módulos reales) y, opcionalmente,
    // que el plan incluya esta feature.
    feature?: string;
};

const QUICK_MODULES: QuickModule[] = [
    {
        label: 'Galería de fotos',
        icon: ImageIcon,
        route: 'associate.company.gallery',
    },
    {
        label: 'Anuncios',
        icon: Megaphone,
        route: 'associate.announcements.index',
    },
    {
        label: 'Bienes y Servicios',
        icon: Building2,
        route: 'associate.company.bienes-servicios.index',
        feature: 'bienes_servicios',
    },
    { label: 'Red Camep', icon: Network, route: 'forums.index' },
    { label: 'EmpleAmep', icon: Briefcase, soon: true },
    { label: 'Reseñas', icon: Star, soon: true },
    { label: 'Mi Ranking', icon: Trophy, soon: true },
];

export function QuickAccessCard({
    locked = false,
    planFeatures = {},
}: {
    // Sin suscripción activa: los módulos de plan quedan bloqueados.
    locked?: boolean;
    planFeatures?: Record<string, boolean>;
}) {
    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                    Accesos rápidos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {QUICK_MODULES.map((m) => {
                        const Icon = m.icon;
                        if (m.soon || !m.route) {
                            return (
                                <div
                                    key={m.label}
                                    className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-3 opacity-70"
                                >
                                    <Icon className="size-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        {m.label}
                                    </span>
                                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                        Próximamente
                                    </span>
                                </div>
                            );
                        }
                        const moduleLocked =
                            locked ||
                            (!!m.feature && planFeatures[m.feature] === false);
                        if (moduleLocked) {
                            return (
                                <div
                                    key={m.label}
                                    className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-3 opacity-70"
                                >
                                    <Icon className="size-5 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        {m.label}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Lock className="size-3" />
                                        {m.feature
                                            ? 'No incluido'
                                            : 'Requiere plan'}
                                    </span>
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={m.label}
                                href={route(m.route)}
                                className="group flex flex-col items-start gap-2 rounded-lg border p-3 transition-colors hover:border-primary hover:bg-primary/5"
                            >
                                <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                                <span className="text-sm font-medium">
                                    {m.label}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    Entrar
                                    <ArrowRight className="size-3" />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
