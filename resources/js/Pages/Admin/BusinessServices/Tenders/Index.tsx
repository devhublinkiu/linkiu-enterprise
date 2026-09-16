import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    Clock,
    Globe,
    Pencil,
    Plus,
    Search,
    ShieldAlert,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/Components/base/InputGroup';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/base/Table';
import AppLayout from '@/Layouts/AppLayout';

interface Tender {
    id: number;
    titulo: string;
    empresa_nombre: string;
    publico_objetivo: 'abierto' | 'exclusivo_asociados';
    estado: 'borrador' | 'publicado' | 'cerrado';
    fecha_publicacion: string | null;
    fecha_cierre: string | null;
}

interface Props {
    tenders: Tender[];
}

const ESTADO_BADGE: Record<
    Tender['estado'],
    { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
    publicado: { label: 'Publicado', variant: 'default' },
    cerrado: { label: 'Cerrado', variant: 'outline' },
    borrador: { label: 'Borrador', variant: 'secondary' },
};

export default function Index({ tenders }: Props) {
    const [search, setSearch] = useState('');

    const deleteTender = (tender: Tender) => {
        if (confirm(`¿Eliminar la licitación «${tender.titulo}»?`)) {
            router.delete(
                route('admin.bienes-servicios.tenders.destroy', tender.id),
            );
        }
    };

    const filtered = tenders.filter(
        (t) =>
            t.titulo.toLowerCase().includes(search.toLowerCase()) ||
            t.empresa_nombre.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout>
            <Head title="Licitaciones · Bienes y Servicios" />

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-h3">Licitaciones</h1>
                        <p className="text-sm text-muted-foreground">
                            Convocatorias de bienes y servicios de las empresas
                            proveedoras ({tenders.length} en total).
                        </p>
                    </div>
                    <Button asChild>
                        <Link
                            href={route(
                                'admin.bienes-servicios.tenders.create',
                            )}
                        >
                            <Plus className="size-4" /> Nueva licitación
                        </Link>
                    </Button>
                </div>

                <InputGroup className="h-9 max-w-xs">
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por título o empresa…"
                    />
                </InputGroup>

                <div className="rounded-xl ring-1 ring-foreground/10">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Licitación</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead className="text-center">
                                    Público
                                </TableHead>
                                <TableHead className="text-center">
                                    Estado
                                </TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        No se encontraron licitaciones.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtered.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>
                                        <div className="flex max-w-md flex-col">
                                            <span className="font-medium">
                                                {t.titulo}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Calendar className="size-3" />
                                                Publicado:{' '}
                                                {t.fecha_publicacion ?? '—'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Building2 className="size-3.5" />
                                            {t.empresa_nombre}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {t.publico_objetivo === 'abierto' ? (
                                            <Badge variant="outline">
                                                <Globe /> Abierto
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <ShieldAlert /> Asociados
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={
                                                ESTADO_BADGE[t.estado].variant
                                            }
                                        >
                                            {ESTADO_BADGE[t.estado].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {t.fecha_cierre ? (
                                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Clock className="size-3.5" />
                                                {t.fecha_cierre}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                Sin fecha
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Editar ${t.titulo}`}
                                            >
                                                <Link
                                                    href={route(
                                                        'admin.bienes-servicios.tenders.edit',
                                                        t.id,
                                                    )}
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Eliminar ${t.titulo}`}
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => deleteTender(t)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
