import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Briefcase,
    CheckCircle2,
    FolderCog,
    Info,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertTitle } from '@/Components/base/Alert';
import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/Components/base/InputGroup';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';
import { Switch } from '@/Components/base/Switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/base/Table';
import AppLayout from '@/Layouts/AppLayout';

import CategoriesDialog from './Parts/CategoriesDialog';
import ServiceDialog from './Parts/ServiceDialog';
import TablePagination from './Parts/TablePagination';
import { Category, Filters, Paginator, Service } from './types';

interface Props {
    services: Paginator<Service>;
    categories: Category[];
    categoryServiceCounts: Record<number, number>;
    filters: Filters;
}

export default function Index({
    services,
    categories,
    categoryServiceCounts,
    filters,
}: Props) {
    const flash = (usePage().props.flash ?? {}) as {
        success?: string;
        info?: string;
        error?: string;
    };

    const [search, setSearch] = useState(filters.search ?? '');
    const [serviceDialog, setServiceDialog] = useState(false);
    const [editing, setEditing] = useState<Service | null>(null);
    const [categoriesDialog, setCategoriesDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
    const [notice, setNotice] = useState<{
        variant: 'success' | 'default' | 'destructive';
        msg: string;
    } | null>(null);

    useEffect(() => {
        if (flash.success)
            setNotice({ variant: 'success', msg: flash.success });
        else if (flash.info) setNotice({ variant: 'default', msg: flash.info });
        else if (flash.error)
            setNotice({ variant: 'destructive', msg: flash.error });
        if (flash.success || flash.info || flash.error) {
            const t = setTimeout(() => setNotice(null), 5000);
            return () => clearTimeout(t);
        }
    }, [flash.success, flash.info, flash.error]);

    const applyFilter = (params: Partial<Filters>) =>
        router.get(
            route('admin.services.index'),
            { ...filters, ...params },
            { preserveState: true, replace: true, preserveScroll: true },
        );

    const toggleActive = (s: Service) =>
        router.patch(
            route('admin.services.update', s.id),
            {
                name: s.name,
                category_id: s.category_id,
                is_active: !s.is_active,
            },
            { preserveScroll: true },
        );

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.services.destroy', deleteTarget.id), {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    const openCreate = () => {
        setEditing(null);
        setServiceDialog(true);
    };
    const openEdit = (s: Service) => {
        setEditing(s);
        setServiceDialog(true);
    };

    return (
        <AppLayout>
            <Head title="Catálogo de servicios" />
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 font-display text-h3">
                            <Briefcase className="size-6 text-muted-foreground" />
                            Catálogo de servicios
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Servicios disponibles para las empresas afiliadas (
                            {services.total} en total).
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCategoriesDialog(true)}
                        >
                            <FolderCog className="size-4" /> Categorías
                        </Button>
                        <Button onClick={openCreate}>
                            <Plus className="size-4" /> Nuevo servicio
                        </Button>
                    </div>
                </div>

                {notice && (
                    <Alert variant={notice.variant}>
                        {notice.variant === 'success' ? (
                            <CheckCircle2 />
                        ) : notice.variant === 'destructive' ? (
                            <AlertCircle />
                        ) : (
                            <Info />
                        )}
                        <AlertTitle>{notice.msg}</AlertTitle>
                    </Alert>
                )}

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-3">
                    <InputGroup className="h-9 max-w-xs flex-1">
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                applyFilter({ search: e.target.value });
                            }}
                            placeholder="Buscar por nombre…"
                        />
                    </InputGroup>

                    <Select
                        value={filters.category_id || 'all'}
                        onValueChange={(v) =>
                            applyFilter({ category_id: v === 'all' ? '' : v })
                        }
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Todas las categorías
                            </SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.per_page || '10'}
                        onValueChange={(v) => applyFilter({ per_page: v })}
                    >
                        <SelectTrigger className="ml-auto w-28">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 / pág.</SelectItem>
                            <SelectItem value="25">25 / pág.</SelectItem>
                            <SelectItem value="50">50 / pág.</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tabla */}
                <div className="rounded-xl ring-1 ring-foreground/10">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Servicio</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-center">
                                    Empresas
                                </TableHead>
                                <TableHead className="text-center">
                                    Activo
                                </TableHead>
                                <TableHead className="text-right">
                                    Acciones
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        No se encontraron servicios.
                                    </TableCell>
                                </TableRow>
                            )}
                            {services.data.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-medium">
                                        {s.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {s.category?.name ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">
                                            {s.associates_count}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={s.is_active}
                                            onCheckedChange={() =>
                                                toggleActive(s)
                                            }
                                            aria-label={`Activo: ${s.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Editar ${s.name}`}
                                                onClick={() => openEdit(s)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Eliminar ${s.name}`}
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    setDeleteTarget(s)
                                                }
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

                {services.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {services.from}–{services.to} de {services.total}
                        </p>
                        <TablePagination page={services} />
                    </div>
                )}
            </div>

            <ServiceDialog
                open={serviceDialog}
                onOpenChange={setServiceDialog}
                service={editing}
                categories={categories}
            />

            <CategoriesDialog
                open={categoriesDialog}
                onOpenChange={setCategoriesDialog}
                categories={categories}
                counts={categoryServiceCounts}
            />

            {/* Confirmación de borrado */}
            <Dialog
                open={!!deleteTarget}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar servicio</DialogTitle>
                        <DialogDescription>
                            {deleteTarget && deleteTarget.associates_count > 0
                                ? `No puedes eliminar «${deleteTarget.name}»: lo usan ${deleteTarget.associates_count} empresa(s). Desactívalo primero con el interruptor "Activo".`
                                : `¿Eliminar «${deleteTarget?.name}»? Esta acción no se puede deshacer.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cerrar</Button>
                        </DialogClose>
                        {deleteTarget &&
                            deleteTarget.associates_count === 0 && (
                                <Button
                                    variant="destructive"
                                    onClick={confirmDelete}
                                >
                                    Eliminar
                                </Button>
                            )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
