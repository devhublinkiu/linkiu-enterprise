import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Download,
    Files,
    GripVertical,
    Info,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
import { getDocumentIcon } from '@/lib/documentIcons';
import { cn } from '@/lib/utils';

import DocumentDialog from './Parts/DocumentDialog';
import { DocumentRequirement, Props } from './types';

export default function Index({
    documents,
    allowedIcons,
    allowedMimes,
}: Props) {
    const flash = (usePage().props.flash ?? {}) as {
        success?: string;
        info?: string;
        error?: string;
    };

    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<DocumentRequirement | null>(null);
    const [deleteTarget, setDeleteTarget] =
        useState<DocumentRequirement | null>(null);
    const [draggedId, setDraggedId] = useState<number | null>(null);
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

    const canReorder = search.trim() === '';

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return documents;
        return documents.filter(
            (d) =>
                d.label.toLowerCase().includes(q) ||
                d.key.toLowerCase().includes(q),
        );
    }, [documents, search]);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };
    const openEdit = (doc: DocumentRequirement) => {
        setEditing(doc);
        setFormOpen(true);
    };

    const toggleActive = (doc: DocumentRequirement) =>
        router.post(
            route('admin.document-requirements.toggle', doc.id),
            {},
            { preserveScroll: true },
        );

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(
            route('admin.document-requirements.destroy', deleteTarget.id),
            {
                preserveScroll: true,
                onFinish: () => setDeleteTarget(null),
            },
        );
    };

    const handleDrop = (targetId: number) => {
        if (draggedId == null || draggedId === targetId) {
            setDraggedId(null);
            return;
        }
        const reordered = [...documents];
        const from = reordered.findIndex((d) => d.id === draggedId);
        const to = reordered.findIndex((d) => d.id === targetId);
        if (from < 0 || to < 0) {
            setDraggedId(null);
            return;
        }
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);
        router.post(
            route('admin.document-requirements.reorder'),
            { order: reordered.map((d) => d.id) },
            { preserveScroll: true },
        );
        setDraggedId(null);
    };

    return (
        <AppLayout>
            <Head title="Documentos requeridos" />
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 font-display text-h3">
                            <Files className="size-6 text-muted-foreground" />
                            Documentos requeridos
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Define qué documentos deben subir los asociados (
                            {documents.length} en el catálogo).
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus className="size-4" /> Nuevo documento
                    </Button>
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

                <div className="flex flex-wrap items-center gap-3">
                    <InputGroup className="h-9 max-w-xs flex-1">
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                        <InputGroupInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre o clave…"
                        />
                    </InputGroup>
                    {!canReorder && (
                        <p className="text-xs text-muted-foreground">
                            Limpia la búsqueda para reordenar.
                        </p>
                    )}
                </div>

                <div className="rounded-xl ring-1 ring-foreground/10">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8" />
                                <TableHead>Documento</TableHead>
                                <TableHead>Tipos</TableHead>
                                <TableHead className="text-center">
                                    Obligatorio
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
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        No se encontraron documentos.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtered.map((doc) => {
                                const Icon = getDocumentIcon(doc.icon);
                                return (
                                    <TableRow
                                        key={doc.id}
                                        draggable={canReorder}
                                        onDragStart={() =>
                                            canReorder && setDraggedId(doc.id)
                                        }
                                        onDragOver={(e) =>
                                            canReorder && e.preventDefault()
                                        }
                                        onDrop={() =>
                                            canReorder && handleDrop(doc.id)
                                        }
                                        className={cn(
                                            draggedId === doc.id &&
                                                'opacity-40',
                                            !doc.is_active &&
                                                'text-muted-foreground',
                                        )}
                                    >
                                        <TableCell>
                                            <span
                                                aria-label={`Reordenar ${doc.label}`}
                                                className={cn(
                                                    'flex items-center text-muted-foreground',
                                                    canReorder
                                                        ? 'cursor-grab'
                                                        : 'cursor-default opacity-30',
                                                )}
                                            >
                                                <GripVertical className="size-4" />
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={cn(
                                                        'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                                        doc.is_active
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    <Icon className="size-4" />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-foreground">
                                                        {doc.label}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        <code>{doc.key}</code>
                                                        {doc.legend
                                                            ? ` · ${doc.legend}`
                                                            : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {doc.accepts
                                                .map((a) => a.toUpperCase())
                                                .join(', ')}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {doc.is_required ? (
                                                <Badge>Obligatorio</Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Opcional
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={doc.is_active}
                                                onCheckedChange={() =>
                                                    toggleActive(doc)
                                                }
                                                aria-label={`Activo: ${doc.label}`}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {doc.template_url && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label={`Ver plantilla de ${doc.label}`}
                                                        asChild
                                                    >
                                                        <a
                                                            href={
                                                                doc.template_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Download className="size-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label={`Editar ${doc.label}`}
                                                    onClick={() =>
                                                        openEdit(doc)
                                                    }
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label={`Eliminar ${doc.label}`}
                                                    className="text-muted-foreground hover:text-destructive"
                                                    onClick={() =>
                                                        setDeleteTarget(doc)
                                                    }
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <DocumentDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                document={editing}
                allowedIcons={allowedIcons}
                allowedMimes={allowedMimes}
            />

            <Dialog
                open={!!deleteTarget}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar documento</DialogTitle>
                        <DialogDescription>
                            ¿Eliminar «{deleteTarget?.label}» del catálogo? Esta
                            acción no se puede deshacer. Si algún asociado ya
                            subió un archivo para este documento, se desactivará
                            en su lugar.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
