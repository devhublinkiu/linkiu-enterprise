import { Head, Link, router } from '@inertiajs/react';
import { Building2, MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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

interface Company {
    id: number;
    nombre: string;
    departamento: string | null;
    ciudad: string | null;
    estado: 'activo' | 'inactivo';
    logo_url: string | null;
}

interface Props {
    companies: Company[];
}

export default function Index({ companies }: Props) {
    const [search, setSearch] = useState('');

    const deleteCompany = (company: Company) => {
        if (
            confirm(
                `¿Eliminar «${company.nombre}»? También se eliminarán todas sus licitaciones. Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(
                route('admin.bienes-servicios.companies.destroy', company.id),
            );
        }
    };

    const filtered = companies.filter(
        (c) =>
            c.nombre.toLowerCase().includes(search.toLowerCase()) ||
            (c.ciudad ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    const location = (c: Company) =>
        c.ciudad && c.departamento
            ? `${c.ciudad}, ${c.departamento}`
            : (c.ciudad ?? c.departamento ?? '—');

    return (
        <AppLayout>
            <Head title="Empresas · Bienes y Servicios" />

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 font-display text-h3">
                            <Building2 className="size-6 text-muted-foreground" />
                            Empresas
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Proveedores de bienes y servicios para CAMEP (
                            {companies.length} en total).
                        </p>
                    </div>
                    <Button asChild>
                        <Link
                            href={route(
                                'admin.bienes-servicios.companies.create',
                            )}
                        >
                            <Plus className="size-4" /> Nueva empresa
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
                        placeholder="Buscar por nombre o ciudad…"
                    />
                </InputGroup>

                <div className="rounded-xl ring-1 ring-foreground/10">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Logo</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead className="text-center">
                                    Estado
                                </TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        No se encontraron empresas.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtered.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell>
                                        <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                                            {c.logo_url ? (
                                                <img
                                                    src={c.logo_url}
                                                    alt={c.nombre}
                                                    className="size-full object-contain p-1"
                                                />
                                            ) : (
                                                <Building2 className="size-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {c.nombre}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="size-3.5" />
                                            {location(c)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={
                                                c.estado === 'activo'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {c.estado === 'activo'
                                                ? 'Activo'
                                                : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Editar ${c.nombre}`}
                                            >
                                                <Link
                                                    href={route(
                                                        'admin.bienes-servicios.companies.edit',
                                                        c.id,
                                                    )}
                                                >
                                                    <Pencil className="size-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Eliminar ${c.nombre}`}
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => deleteCompany(c)}
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
