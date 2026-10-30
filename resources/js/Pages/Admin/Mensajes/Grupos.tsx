import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Users, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/Components/base/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import AppLayout from '@/Layouts/AppLayout';

import GroupDialog, { type GroupItem } from './parts/GroupDialog';

interface Props {
    groups: GroupItem[];
    associates: { id: number; name: string }[];
}

export default function Grupos({ groups, associates }: Props) {
    const [editing, setEditing] = useState<GroupItem | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState<GroupItem | null>(null);

    const openCreate = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (g: GroupItem) => {
        setEditing(g);
        setDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deleting) return;
        router.delete(route('admin.message-groups.destroy', deleting.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Grupo eliminado.'),
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <div className="space-y-6">
            <Head title="Grupos de mensajería | Admin" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label="Volver a mensajes"
                    >
                        <Link href={route('admin.messages.index')}>
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Grupos
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Listas con nombre para difundir mensajes.
                        </p>
                    </div>
                </div>
                <Button onClick={openCreate}>
                    <Users className="size-4" />
                    Nuevo grupo
                </Button>
            </div>

            {groups.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
                    <UsersRound
                        className="size-10 text-muted-foreground/60"
                        strokeWidth={1.5}
                    />
                    <p className="text-sm text-muted-foreground">
                        Aún no hay grupos. Crea el primero para difundir
                        mensajes.
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                    {groups.map((g) => (
                        <li
                            key={g.id}
                            className="flex items-center gap-3 px-4 py-3.5"
                        >
                            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                                <UsersRound className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {g.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {g.count} asociado(s)
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Editar ${g.name}`}
                                onClick={() => openEdit(g)}
                            >
                                <Pencil className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Eliminar ${g.name}`}
                                onClick={() => setDeleting(g)}
                            >
                                <Trash2 className="size-4 text-destructive" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <GroupDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                associates={associates}
                group={editing}
            />

            {/* Confirmación de borrado */}
            <Dialog
                open={!!deleting}
                onOpenChange={(o) => !o && setDeleting(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Eliminar grupo</DialogTitle>
                        <DialogDescription>
                            ¿Seguro que quieres eliminar «{deleting?.name}»?
                            Esta acción no se puede deshacer. Los mensajes ya
                            enviados no se borran.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleting(null)}
                        >
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

Grupos.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
