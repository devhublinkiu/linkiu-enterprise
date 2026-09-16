import { Head, Link } from '@inertiajs/react';
import { Building2, MapPin, Search } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/Components/base/Badge';
import { Card } from '@/Components/base/Card';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/Components/base/InputGroup';
import AppLayout from '@/Layouts/AppLayout';

interface Company {
    id: number;
    nombre: string;
    slug: string;
    logo_url: string | null;
    departamento: string | null;
    ciudad: string | null;
    licitaciones_activas: number;
    licitaciones_vencidas: number;
}

interface Props {
    companies: Company[];
}

export default function Index({ companies }: Props) {
    const [search, setSearch] = useState('');

    const filtered = companies.filter(
        (c) =>
            c.nombre.toLowerCase().includes(search.toLowerCase()) ||
            (c.ciudad ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    const location = (c: Company) =>
        c.ciudad ?? c.departamento ?? 'Ubicación no definida';

    return (
        <AppLayout>
            <Head title="Bienes y Servicios · Directorio" />

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 font-display text-h3">
                            <Building2 className="size-6 text-muted-foreground" />
                            Bienes y Servicios
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Directorio de empresas aliadas y sus convocatorias (
                            {companies.length} en total).
                        </p>
                    </div>
                    <InputGroup className="h-9 w-full max-w-xs">
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre o ciudad…"
                        />
                    </InputGroup>
                </div>

                {filtered.length === 0 ? (
                    <Card className="items-center gap-3 py-16 text-center">
                        <Search className="size-8 text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="font-medium">Sin resultados</p>
                            <p className="text-sm text-muted-foreground">
                                No hay empresas que coincidan con la búsqueda.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {filtered.map((c) => (
                            <Link
                                key={c.id}
                                href={route(
                                    'associate.company.bienes-servicios.company',
                                    c.slug,
                                )}
                                className="group"
                            >
                                <Card className="gap-0 py-0 transition-shadow group-hover:ring-foreground/20">
                                    <div className="flex aspect-square items-center justify-center bg-muted/50 p-6">
                                        {c.logo_url ? (
                                            <img
                                                src={c.logo_url}
                                                alt={c.nombre}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <Building2 className="size-10 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="border-t p-3 text-center">
                                        <h3 className="line-clamp-1 text-sm font-medium">
                                            {c.nombre}
                                        </h3>
                                        <span className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="size-3" />
                                            {location(c)}
                                        </span>
                                        <div className="mt-2 flex flex-wrap justify-center gap-1">
                                            <Badge variant="secondary">
                                                {c.licitaciones_activas} activa
                                                {c.licitaciones_activas === 1
                                                    ? ''
                                                    : 's'}
                                            </Badge>
                                            <Badge variant="outline">
                                                {c.licitaciones_vencidas}{' '}
                                                vencida
                                                {c.licitaciones_vencidas === 1
                                                    ? ''
                                                    : 's'}
                                            </Badge>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
