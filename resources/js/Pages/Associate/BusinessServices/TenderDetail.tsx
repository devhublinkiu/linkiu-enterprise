import { Head, Link } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Clock,
    Download,
    ExternalLink,
    FileText,
    Globe,
    MapPin,
    ShieldAlert,
} from 'lucide-react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import AppLayout from '@/Layouts/AppLayout';

interface Document {
    id: number;
    name: string;
    file_name: string;
    size: string;
    url: string;
    ext: string;
}

interface Company {
    id: number;
    nombre: string;
    slug: string;
    logo_url: string | null;
    departamento: string | null;
    ciudad: string | null;
}

interface Tender {
    id: number;
    titulo: string;
    contenido: string | null;
    extracto: string | null;
    enlace_externo: string | null;
    publico_objetivo: 'abierto' | 'exclusivo_asociados';
    estado: 'borrador' | 'publicado' | 'cerrado';
    fecha_publicacion: string | null;
    fecha_cierre: string | null;
    featured_image_url: string | null;
}

interface Props {
    company: Company;
    tender: Tender;
    documents: Document[];
}

export default function TenderDetail({ company, tender, documents }: Props) {
    const sanitizedContent = tender.contenido
        ? DOMPurify.sanitize(tender.contenido)
        : '';

    const location = company.ciudad ?? company.departamento;
    const companyUrl = route(
        'associate.company.bienes-servicios.company',
        company.slug,
    );

    return (
        <AppLayout>
            <Head title={`${tender.titulo} · ${company.nombre}`} />

            <div className="mx-auto max-w-6xl space-y-6">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="-ml-2 text-muted-foreground"
                >
                    <Link href={companyUrl}>
                        <ArrowLeft className="size-4" /> Licitaciones de{' '}
                        {company.nombre}
                    </Link>
                </Button>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Contenido */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {tender.publico_objetivo ===
                                'exclusivo_asociados' ? (
                                    <Badge variant="default">
                                        <ShieldAlert /> Exclusivo asociados
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        <Globe /> Público abierto
                                    </Badge>
                                )}
                                {tender.estado === 'cerrado' && (
                                    <Badge variant="outline">
                                        <Clock /> Cerrado
                                    </Badge>
                                )}
                            </div>
                            <h1 className="font-display text-h2">
                                {tender.titulo}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="size-4" />
                                    Inicio: {tender.fecha_publicacion ?? '—'}
                                </span>
                                {tender.fecha_cierre && (
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="size-4" />
                                        Cierre: {tender.fecha_cierre}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Card>
                            <CardContent>
                                {sanitizedContent ? (
                                    <div
                                        className="tiptap-content prose prose-neutral prose-headings:font-display max-w-none"
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizedContent,
                                        }}
                                    />
                                ) : (
                                    <p className="text-sm italic text-muted-foreground">
                                        No se ha proporcionado contenido
                                        detallado adicional.
                                    </p>
                                )}

                                {tender.enlace_externo && (
                                    <div className="mt-6 border-t pt-6">
                                        <Button asChild>
                                            <a
                                                href={tender.enlace_externo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Portal de licitación externo{' '}
                                                <ExternalLink className="size-4" />
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Barra lateral */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="flex flex-col items-center gap-3 text-center">
                                <Link
                                    href={companyUrl}
                                    className="flex size-20 items-center justify-center rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/10"
                                >
                                    {company.logo_url ? (
                                        <img
                                            src={company.logo_url}
                                            alt={company.nombre}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    ) : (
                                        <Building2 className="size-8 text-muted-foreground" />
                                    )}
                                </Link>
                                <div>
                                    <h3 className="font-medium">
                                        {company.nombre}
                                    </h3>
                                    {location && (
                                        <span className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="size-3" />
                                            {location}
                                        </span>
                                    )}
                                </div>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    <Link href={companyUrl}>
                                        Ver perfil de la empresa
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="gap-0">
                            <CardHeader className="border-b pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="size-4 text-muted-foreground" />
                                    Pliegos y anexos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2 py-4">
                                {documents.length > 0 ? (
                                    documents.map((doc) => (
                                        <a
                                            key={doc.id}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center justify-between gap-3 rounded-lg border border-input p-2.5 transition-colors hover:bg-muted/50"
                                        >
                                            <span className="flex items-center gap-2.5 overflow-hidden">
                                                <FileText className="size-4 shrink-0 text-muted-foreground" />
                                                <span className="overflow-hidden">
                                                    <span className="block truncate text-sm font-medium">
                                                        {doc.name}
                                                    </span>
                                                    <span className="text-xs uppercase text-muted-foreground">
                                                        {doc.ext} · {doc.size}
                                                    </span>
                                                </span>
                                            </span>
                                            <Download className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                                        </a>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        No hay archivos adjuntos.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
