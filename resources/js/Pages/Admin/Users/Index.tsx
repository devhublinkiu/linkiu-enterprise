import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Badge } from '@/Components/ui/Badge';
import { Users, Phone, Building2, KeyRound, X, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserRow {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: 'superadmin' | 'admin' | 'associate';
    company_name: string | null;
    associate_id: number | null;
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
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    superadmin: { label: 'Super Admin', color: 'bg-violet-100 text-violet-700' },
    admin:      { label: 'Admin',       color: 'bg-blue-100 text-blue-700' },
    associate:  { label: 'Asociado',    color: 'bg-emerald-100 text-emerald-700' },
};

function ChangePasswordModal({ user, onClose }: { user: UserRow; onClose: () => void }) {
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
            onSuccess: () => { reset(); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider">Cambiar Contraseña</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{user.name}</p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Nueva Contraseña</Label>
                        <div className="relative">
                            <Input
                                type={showPass ? 'text' : 'password'}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="h-9 text-sm border-slate-200 rounded-lg pr-10"
                                placeholder="Mínimo 8 caracteres"
                            />
                            <button type="button" onClick={() => setShowPass(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 font-bold">{errors.password}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Confirmar Contraseña</Label>
                        <div className="relative">
                            <Input
                                type={showConfirm ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                className="h-9 text-sm border-slate-200 rounded-lg pr-10"
                                placeholder="Repite la contraseña"
                            />
                            <button type="button" onClick={() => setShowConfirm(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        {errors.password_confirmation && <p className="text-xs text-red-500 font-bold">{errors.password_confirmation}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}
                            className="h-8 text-[10px] font-bold uppercase border-slate-200">
                            Cancelar
                        </Button>
                        <Button type="submit" size="sm" disabled={processing}
                            className="h-8 text-[10px] font-bold uppercase bg-slate-900 text-white hover:bg-slate-800">
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
    const pageLinks = paginator.links.filter(l => {
        const txt = l.label.replace(/&[a-z]+;/g, '').trim();
        return txt !== '' && !/Previous|Next/i.test(txt);
    });

    const prevLink = paginator.links.find(l => /Previous|laquo/i.test(l.label));
    const nextLink = paginator.links.find(l => /Next|raquo/i.test(l.label));

    return (
        <div className="flex items-center justify-between px-2">
            <p className="text-[11px] text-slate-400 font-bold uppercase">
                {paginator.from}–{paginator.to} de {paginator.total} usuarios
            </p>

            <div className="flex items-center gap-1">
                {/* Prev */}
                {prevLink?.url ? (
                    <Link href={prevLink.url} preserveScroll
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <ChevronLeft size={14} />
                    </Link>
                ) : (
                    <span className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-100 text-slate-300 cursor-not-allowed">
                        <ChevronLeft size={14} />
                    </span>
                )}

                {/* Page numbers */}
                {pageLinks.map((link, i) => {
                    if (!link.url && !link.active) {
                        return (
                            <span key={i} className="h-8 min-w-[2rem] px-2 flex items-center justify-center text-[11px] font-bold text-slate-300">
                                …
                            </span>
                        );
                    }
                    return link.active ? (
                        <span key={i} className="h-8 min-w-[2rem] px-2 flex items-center justify-center rounded-lg bg-slate-900 text-white text-[11px] font-black">
                            {link.label}
                        </span>
                    ) : (
                        <Link key={i} href={link.url!} preserveScroll
                            className="h-8 min-w-[2rem] px-2 flex items-center justify-center rounded-lg border border-slate-200 text-[11px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            {link.label}
                        </Link>
                    );
                })}

                {/* Next */}
                {nextLink?.url ? (
                    <Link href={nextLink.url} preserveScroll
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <ChevronRight size={14} />
                    </Link>
                ) : (
                    <span className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-100 text-slate-300 cursor-not-allowed">
                        <ChevronRight size={14} />
                    </span>
                )}
            </div>
        </div>
    );
}

export default function Index({ users }: Props) {
    const [passwordUser, setPasswordUser] = useState<UserRow | null>(null);

    return (
        <AppLayout>
            <Head title="Usuarios" />

            {passwordUser && (
                <ChangePasswordModal user={passwordUser} onClose={() => setPasswordUser(null)} />
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                            <Users size={20} className="text-slate-400" />
                            Usuarios
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {users.total} usuario{users.total !== 1 ? 's' : ''} registrados
                        </p>
                    </div>
                </div>

                {/* Table */}
                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                            Directorio de Usuarios
                        </h3>
                    </div>

                    <div className="divide-y divide-slate-100/70">
                        {users.data.length === 0 && (
                            <div className="text-center py-16">
                                <Users size={40} className="mx-auto text-slate-200 mb-3" />
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Sin usuarios registrados</p>
                            </div>
                        )}

                        {users.data.map(user => {
                            const roleInfo = ROLE_LABELS[user.role] ?? { label: user.role, color: 'bg-slate-100 text-slate-600' };
                            return (
                                <div key={user.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                                    {/* Avatar */}
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-black text-slate-500 uppercase">
                                            {user.name.charAt(0)}
                                        </span>
                                    </div>

                                    {/* Main info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-black text-slate-900 leading-tight">{user.name}</p>
                                            <Badge className={cn('text-[9px] font-black uppercase px-2 py-0.5 rounded-full border-0', roleInfo.color)}>
                                                {roleInfo.label}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{user.email}</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-bold min-w-[130px]">
                                        <Phone size={11} className="text-slate-300 shrink-0" />
                                        {user.phone || <span className="text-slate-300 italic font-normal">Sin teléfono</span>}
                                    </div>

                                    {/* Company */}
                                    <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 font-bold min-w-[180px]">
                                        <Building2 size={11} className="text-slate-300 shrink-0" />
                                        {user.company_name || <span className="text-slate-300 italic font-normal">Sin empresa</span>}
                                    </div>

                                    {/* Actions */}
                                    <div className="shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPasswordUser(user)}
                                            className="h-8 text-[10px] font-black uppercase tracking-wider border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400"
                                        >
                                            <KeyRound size={12} className="mr-1.5" />
                                            <span className="hidden sm:inline">Contraseña</span>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {users.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                            <Pagination paginator={users} />
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
