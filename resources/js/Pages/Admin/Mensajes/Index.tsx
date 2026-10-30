import { Head, Link, router } from '@inertiajs/react';
import { isToday, parseISO } from 'date-fns';
import { Inbox, MessageSquarePlus, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import { Input } from '@/Components/base/Input';
import AppLayout from '@/Layouts/AppLayout';

import ComposeDialog from './parts/ComposeDialog';
import { type PickerOption } from './parts/SearchPicker';

interface ConversationRow {
    id: number;
    subject: string | null;
    status: string;
    associate: string | null;
    last: string | null;
    last_at: string | null;
    unread: number;
}

interface Props {
    conversations: ConversationRow[];
    archived: boolean;
    associates: PickerOption[];
    groups: PickerOption[];
}

function formatWhen(value: string | null): string {
    if (!value) return '';
    const d = parseISO(value.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return '';
    if (isToday(d)) {
        return d.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    return d.toLocaleDateString('es-CO');
}

export default function Index({
    conversations,
    archived,
    associates,
    groups,
}: Props) {
    const [composeOpen, setComposeOpen] = useState(false);
    const [q, setQ] = useState('');

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return conversations;
        return conversations.filter((c) =>
            [c.associate, c.subject, c.last]
                .filter(Boolean)
                .some((v) => v!.toLowerCase().includes(needle)),
        );
    }, [conversations, q]);

    return (
        <div className="space-y-6">
            <Head title="Mensajes | Admin" />

            {/* Encabezado */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Mensajes
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Conversaciones con las empresas asociadas.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href={route('admin.message-groups.index')}>
                            <Users className="size-4" />
                            Grupos
                        </Link>
                    </Button>
                    <Button onClick={() => setComposeOpen(true)}>
                        <MessageSquarePlus className="size-4" />
                        Nuevo mensaje
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
                    <Link
                        href={route('admin.messages.index')}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            !archived
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Activas
                    </Link>
                    <Link
                        href={route('admin.messages.index', { archived: 1 })}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            archived
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Archivadas
                    </Link>
                </div>
                <div className="relative sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar conversación…"
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Lista */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
                    <Inbox
                        className="size-10 text-muted-foreground/60"
                        strokeWidth={1.5}
                    />
                    <p className="text-sm text-muted-foreground">
                        {q
                            ? 'No hay conversaciones que coincidan.'
                            : archived
                              ? 'No tienes conversaciones archivadas.'
                              : 'Aún no hay conversaciones. Escribe la primera.'}
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                    {filtered.map((c) => (
                        <li key={c.id}>
                            <button
                                type="button"
                                onClick={() =>
                                    router.visit(
                                        route('admin.messages.show', c.id),
                                    )
                                }
                                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`truncate text-sm ${
                                                c.unread > 0
                                                    ? 'font-semibold text-foreground'
                                                    : 'font-medium text-foreground'
                                            }`}
                                        >
                                            {c.associate ?? 'Empresa'}
                                        </span>
                                        {c.unread > 0 && (
                                            <Badge className="shrink-0">
                                                {c.unread}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {c.subject}
                                    </p>
                                    {c.last && (
                                        <p className="truncate text-xs text-muted-foreground/80">
                                            {c.last}
                                        </p>
                                    )}
                                </div>
                                <span className="shrink-0 text-xs text-muted-foreground">
                                    {formatWhen(c.last_at)}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <ComposeDialog
                open={composeOpen}
                onOpenChange={setComposeOpen}
                associates={associates}
                groups={groups}
            />
        </div>
    );
}

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
