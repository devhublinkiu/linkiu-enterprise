import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    KeyRound,
    Phone,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

interface UserRow {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: 'superadmin' | 'admin' | 'associate';
    company_name: string | null;
    associate_id: number | null;
    can_delete: boolean;
    delete_hint: string | null;
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginator {
    data: UserRow[];
    links: PaginatorLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    users: Paginator;
    spam_count: number;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    superadmin: {
        label: 'Super Admin',
        color: 'bg-violet-100 text-violet-700',
    },
    admin: { label: 'Admin', color: 'bg-blue-100 text-blue-700' },
    associate: { label: 'Asociado', color: 'bg-emerald-100 text-emerald-700' },
};

function ChangePasswordModal({
    user,
    onClose,
}: {
    user: UserRow;
    onClose: () => void;
}) {
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.update-password', user.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                            Cambiar Contraseña
                        </h3>
                        <p className="mt-0.5 text-[10px] font-bold uppercase text-slate-400">
                            {user.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={14} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Nueva Contraseña
                        </Label>
                        <div className="relative">
                            <Input
                                type={showPass ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="h-9 rounded-lg border-slate-200 pr-10 text-sm"
                                placeholder="Mínimo 8 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                                {showPass ? (
                                    <EyeOff size={14} />
                                ) : (
                                    <Eye size={14} />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs font-bold text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Confirmar Contraseña
                        </Label>
                        <div className="relative">
                            <Input
                                type={showConfirm ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                className="h-9 rounded-lg border-slate-200 pr-10 text-sm"
                                placeholder="Repite la contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                                {showConfirm ? (
                                    <EyeOff size={14} />
                                ) : (
                                    <Eye size={14} />
                                )}
                            </button>
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-xs font-bold text-red-500">
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="h-8 border-slate-200 text-[10px] font-bold uppercase"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing}
                            className="h-8 bg-slate-900 text-[10px] font-bold uppercase text-white hover:bg-slate-800"
                        >
                            <KeyRound size={12} className="mr-1.5" /> Guardar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Pagination({ paginator }: { paginator: Paginator }) {
    if (paginator.last_page <= 1) return null;

    // Strip the "Previous" and "Next" entries — we render our own arrows
    const pageLinks = paginator.links.filter((l) => {
        const txt = l.label.replace(/&[a-z]+;/g, '').trim();
        return txt !== '' && !/Previous|Next/i.test(txt);
    });

    const prevLink = paginator.links.find((l) =>
        /Previous|laquo/i.test(l.label),
    );
    const nextLink = paginator.links.find((l) => /Next|raquo/i.test(l.label));

    return (
        <div className="flex items-center justify-between px-2">
            <p className="text-[11px] font-bold uppercase text-slate-400">
                {paginator.from}–{paginator.to} de {paginator.total} usuarios
            </p>

            <div className="flex items-center gap-1">
                {/* Prev */}
                {prevLink?.url ? (
                    <Link
                        href={prevLink.url}
                        preserveScroll
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                        <ChevronLeft size={14} />
                    </Link>
                ) : (
                    <span className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg border border-slate-100 text-slate-300">
                        <ChevronLeft size={14} />
                    </span>
                )}

                {/* Page numbers */}
                {pageLinks.map((link, i) => {
                    if (!link.url && !link.active) {
                        return (
                            <span
                                key={i}
                                className="flex h-8 min-w-[2rem] items-center justify-center px-2 text-[11px] font-bold text-slate-300"
                            >
                                …
                            </span>
                        );
                    }
                    return link.active ? (
                        <span
                            key={i}
                            className="flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-slate-900 px-2 text-[11px] font-black text-white"
                        >
                            {link.label}
                        </span>
                    ) : (
                        <Link
                            key={i}
                            href={link.url!}
                            preserveScroll
                            className="flex h-8 min-w-[2rem] items-center justify-center rounded-lg border border-slate-200 px-2 text-[11px] font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                            {link.label}
                        </Link>
                    );
                })}

                {/* Next */}
                {nextLink?.url ? (
                    <Link
                        href={nextLink.url}
                        preserveScroll
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                        <ChevronRight size={14} />
                    </Link>
                ) : (
                    <span className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg border border-slate-100 text-slate-300">
                        <ChevronRight size={14} />
                    </span>
                )}
            </div>
        </div>
    );
}

export default function Index({ users, spam_count }: Props) {
    const [passwordUser, setPasswordUser] = useState<UserRow | null>(null);

    const deleteUser = (user: UserRow) => {
        if (!user.can_delete) return;
        if (
            confirm(
                `¿Eliminar al usuario ${user.name} (${user.email})? Esta acción no se puede deshacer.`,
            )
        ) {
            router.delete(route('admin.users.destroy', user.id), {
                preserveScroll: true,
            });
        }
    };

    const purgeSpam = () => {
        if (
            confirm(
                `Se eliminarán ${spam_count} registros de spam (sin verificar, sin empresa y con nombre de bot). Se guarda un respaldo CSV antes de borrar. ¿Continuar?`,
            )
        ) {
            router.post(
                route('admin.users.purge-spam'),
                {},
                { preserveScroll: true },
            );
        }
    };

    return (
        <AppLayout>
            <Head title="Usuarios" />

            {passwordUser && (
                <ChangePasswordModal
                    user={passwordUser}
                    onClose={() => setPasswordUser(null)}
                />
            )}

            <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-xl font-black uppercase tracking-wider text-slate-900">
                            <Users size={20} className="text-slate-400" />
                            Usuarios
                        </h1>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {users.total} usuario{users.total !== 1 ? 's' : ''}{' '}
                            registrados
                        </p>
                    </div>

                    {spam_count > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={purgeSpam}
                            className="h-9 border-red-200 text-[10px] font-black uppercase tracking-wider text-red-600 hover:border-red-300 hover:bg-red-50"
                        >
                            <Trash2 size={12} className="mr-1.5" />
                            Limpiar spam ({spam_count})
                        </Button>
                    )}
                </div>

                {/* Table */}
                <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                        <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                            Directorio de Usuarios
                        </h3>
                    </div>

                    <div className="divide-y divide-slate-100/70">
                        {users.data.length === 0 && (
                            <div className="py-16 text-center">
                                <Users
                                    size={40}
                                    className="mx-auto mb-3 text-slate-200"
                                />
                                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                                    Sin usuarios registrados
                                </p>
                            </div>
                        )}

                        {users.data.map((user) => {
                            const roleInfo = ROLE_LABELS[user.role] ?? {
                                label: user.role,
                                color: 'bg-slate-100 text-slate-600',
                            };
                            return (
                                <div
                                    key={user.id}
                                    className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50"
                                >
                                    {/* Avatar */}
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
                                        <span className="text-sm font-black uppercase text-slate-500">
                                            {user.name.charAt(0)}
                                        </span>
                                    </div>

                                    {/* Main info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-black leading-tight text-slate-900">
                                                {user.name}
                                            </p>
                                            <Badge
                                                className={cn(
                                                    'rounded-full border-0 px-2 py-0.5 text-[9px] font-black uppercase',
                                                    roleInfo.color,
                                                )}
                                            >
                                                {roleInfo.label}
                                            </Badge>
                                        </div>
                                        <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Phone */}
                                    <div className="hidden min-w-[130px] items-center gap-1.5 text-[11px] font-bold text-slate-500 sm:flex">
                                        <Phone
                                            size={11}
                                            className="shrink-0 text-slate-300"
                                        />
                                        {user.phone || (
                                            <span className="font-normal italic text-slate-300">
                                                Sin teléfono
                                            </span>
                                        )}
                                    </div>

                                    {/* Company */}
                                    <div className="hidden min-w-[180px] items-center gap-1.5 text-[11px] font-bold text-slate-500 md:flex">
                                        <Building2
                                            size={11}
                                            className="shrink-0 text-slate-300"
                                        />
                                        {user.company_name || (
                                            <span className="font-normal italic text-slate-300">
                                                Sin empresa
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setPasswordUser(user)
                                            }
                                            className="h-8 border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:border-slate-400 hover:text-slate-900"
                                        >
                                            <KeyRound
                                                size={12}
                                                className="mr-1.5"
                                            />
                                            <span className="hidden sm:inline">
                                                Contraseña
                                            </span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteUser(user)}
                                            disabled={!user.can_delete}
                                            title={
                                                user.delete_hint ??
                                                'Eliminar usuario'
                                            }
                                            className={cn(
                                                'h-8 w-8 border-slate-200 p-0',
                                                user.can_delete
                                                    ? 'text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                                                    : 'cursor-not-allowed text-slate-300',
                                            )}
                                        >
                                            <Trash2 size={13} />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {users.last_page > 1 && (
                        <div className="border-t border-slate-100 bg-slate-50/30 px-6 py-4">
                            <Pagination paginator={users} />
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
