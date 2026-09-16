import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Briefcase,
    Building2,
    Calendar,
    Clock,
    Globe,
    MapPin,
    ShieldAlert,
} from 'lucide-react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import { Card, CardContent } from '@/Components/base/Card';
import AppLayout from '@/Layouts/AppLayout';

interface Tender {
    id: number;
    titulo: string;
    slug: string;
    extracto: string | null;
    publico_objetivo: 'abierto' | 'exclusivo_asociados';
    estado: 'borrador' | 'publicado' | 'cerrado';
    fecha_publicacion: string | null;
    fecha_cierre: string | null;
    featured_image_url: string | null;
}

interface Company {
    id: number;
    nombre: string;
    slug: string;
    logo_url: string | null;
    departamento: string | null;
    ciudad: string | null;
}

interface Props {
    company: Company;
    tenders: Tender[];
}

export default function CompanyTenders({ company, tenders }: Props) {
    const location =
        company.ciudad && company.departamento
            ? `${company.ciudad}, ${company.departamento}`
            : (company.ciudad ?? company.departamento);

    const tenderUrl = (slug: string) =>
        route('associate.company.bienes-servicios.tender', [
            company.slug,
            slug,
        ]);

    return (
        <AppLayout>
            <Head title={`Licitaciones · ${company.nombre}`} />

            <div className="mx-auto max-w-6xl space-y-6">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="-ml-2 text-muted-foreground"
                >
                    <Link
                        href={route('associate.company.bienes-servicios.index')}
                    >
                        <ArrowLeft className="size-4" /> Directorio
                    </Link>
                </Button>

                {/* Cabecera de empresa */}
                <Card>
                    <CardContent className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                        <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-muted/50 p-4 ring-1 ring-foreground/10">
                            {company.logo_url ? (
                                <img
                                    src={company.logo_url}
                                    alt={company.nombre}
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <Building2 className="size-10 text-muted-foreground" />
                            )}
                        </div>
                        <div className="space-y-2 text-center sm:text-left">
                            <h1 className="font-display text-h3">
                                {company.nombre}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                                {location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="size-4" />
                                        {location}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="size-4" />
                                    {tenders.length} convocatoria
                                    {tenders.length === 1 ? '' : 's'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Licitaciones */}
                {tenders.length === 0 ? (
                    <Card className="items-center gap-3 py-16 text-center">
                        <Briefcase className="size-8 text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="font-medium">Sin convocatorias</p>
                            <p className="text-sm text-muted-foreground">
                                Esta empresa aún no tiene licitaciones
                                publicadas.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {tenders.map((t) => (
                            <Card key={t.id} className="gap-0 py-0">
                                <Link
                                    href={tenderUrl(t.slug)}
                                    className="group"
                                >
                                    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-muted/50">
                                        {t.featured_image_url ? (
                                            <img
                                                src={t.featured_image_url}
                                                alt={t.titulo}
                                                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <Briefcase
                                                className="size-10 text-muted-foreground"
                                                strokeWidth={1}
                                            />
                                        )}
                                        <div className="absolute right-2 top-2">
                                            {t.publico_objetivo ===
                                            'exclusivo_asociados' ? (
                                                <Badge variant="default">
                                                    <ShieldAlert /> Exclusivo
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <Globe /> Público
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                <CardContent className="flex flex-1 flex-col gap-3 py-4">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="size-3" />
                                            {t.fecha_publicacion ?? '—'}
                                        </span>
                                        {t.fecha_cierre && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                Cierre: {t.fecha_cierre}
                                            </span>
                                        )}
                                        {t.estado === 'cerrado' && (
                                            <Badge variant="outline">
                                                Cerrado
                                            </Badge>
                                        )}
                                    </div>

                                    <Link
                                        href={tenderUrl(t.slug)}
                                        className="font-medium leading-snug hover:underline"
                                    >
                                        <span className="line-clamp-2">
                                            {t.titulo}
                                        </span>
                                    </Link>

                                    <p className="line-clamp-3 text-sm text-muted-foreground">
                                        {t.extracto ??
                                            'Consulta los detalles completos y la documentación de esta licitación.'}
                                    </p>

                                    <Button
                                        asChild
                                        variant="outline"
                                        className="mt-auto w-full"
                                    >
                                        <Link href={tenderUrl(t.slug)}>
                                            Ver detalles{' '}
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
