import { router } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    CircleX,
    MailMinus,
    MoreVertical,
    RotateCcw,
} from 'lucide-react';

import { Button } from '@/Components/base/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/base/DropdownMenu';

interface Props {
    id: number;
    // 'admin.messages' | 'associate.messages'
    prefix: string;
    archived: boolean;
    closed?: boolean;
    canClose?: boolean;
}

// Menú ⋯ de una conversación en la bandeja: actuar sin entrar al hilo (corte 7 · 1.A).
export default function ConversationActions({
    id,
    prefix,
    archived,
    closed = false,
    canClose = false,
}: Props) {
    const act = (action: string) =>
        router.post(
            route(`${prefix}.${action}`, id),
            {},
            { preserveScroll: true },
        );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Acciones de la conversación"
                >
                    <MoreVertical className="size-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => act('mark-unread')}>
                    <MailMinus className="size-4" />
                    Marcar como no leída
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => act('archive')}>
                    {archived ? (
                        <>
                            <ArchiveRestore className="size-4" />
                            Restaurar
                        </>
                    ) : (
                        <>
                            <Archive className="size-4" />
                            Archivar
                        </>
                    )}
                </DropdownMenuItem>
                {canClose && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant={closed ? undefined : 'destructive'}
                            onClick={() => act('close')}
                        >
                            {closed ? (
                                <>
                                    <RotateCcw className="size-4" />
                                    Reabrir
                                </>
                            ) : (
                                <>
                                    <CircleX className="size-4" />
                                    Cerrar
                                </>
                            )}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
