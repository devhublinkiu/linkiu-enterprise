import Modal from '@/Components/Modal';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { Textarea } from '@/Components/ui/Textarea';
import AppLayout from '@/Layouts/AppLayout';
import PublicLayout from '@/Layouts/PublicLayout';
import { cn } from '@/lib/utils';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronRight,
    Clock,
    Eye,
    Lock,
    MessageSquare,
    Pin,
    Plus,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

interface Topic {
    id: number;
    title: string;
    slug: string;
    content: string;
    is_pinned: boolean;
    is_locked: boolean;
    views_count: number;
    replies_count: number;
    created_at: string;
    user: {
        name: string;
        associate: {
            company_name: string;
            logo_path: string | null;
        } | null;
    };
}

interface Props {
    category: Category;
    topics: {
        data: Topic[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function CategoryShow({ category, topics }: Props) {
    const { auth } = usePage().props as {
        auth: { user: { name: string } | null };
    };
    const Layout = auth.user ? AppLayout : PublicLayout;

    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        content: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('forums.topic.store', category.id), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

    return (
        <Layout>
            <Head title={`${category.name} - Red CAMEP`} />

            <div
                className={cn(
                    'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
                    auth.user ? 'py-8' : 'py-16 md:py-24',
                )}
            >
                {/* Breadcrumbs & Header */}
                <div className="mb-8 space-y-4">
                    <Link
                        href={route('forums.index')}
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft size={12} />
                        Volver a los Círculos
                    </Link>

                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 md:text-3xl">
                                {category.name}
                            </h1>
                            <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500 md:text-base">
                                {category.description ||
                                    'Participa en las discusiones técnicas y estratégicas de este círculo gremial.'}
                            </p>
                        </div>

                        <Button
                            className="h-12 shrink-0 rounded-lg bg-slate-900 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-emerald-600 active:scale-95"
                            onClick={() => {
                                if (!auth.user) {
                                    window.location.href = route('login');
                                } else {
                                    setShowCreateModal(true);
                                }
                            }}
                        >
                            <Plus size={16} className="mr-2" />
                            Iniciar Debate
                        </Button>
                    </div>
                </div>

                {/* Create Topic Modal */}
                <Modal
                    show={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    maxWidth="2xl"
                >
                    <div className="p-8">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
                                    <Plus size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                                        Iniciar Nuevo Debate
                                    </h2>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        En {category.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-300 transition-colors hover:text-slate-900"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="px-1 text-[10px] font-black uppercase text-slate-400">
                                    Título del Debate
                                </label>
                                <Input
                                    placeholder="¿Cuál es el tema principal?"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    className="h-12 rounded-xl border-slate-200 text-sm font-bold text-slate-900 focus:border-slate-950 focus:ring-slate-950"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-xs font-black uppercase text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="px-1 text-[10px] font-black uppercase text-slate-400">
                                    Contenido / Argumento
                                </label>
                                <Textarea
                                    placeholder="Explica detalladamente el tema de debate..."
                                    value={data.content}
                                    onChange={(e) =>
                                        setData('content', e.target.value)
                                    }
                                    className="min-h-[160px] rounded-xl border-slate-200 p-5 text-sm font-medium text-slate-700 focus:border-slate-950 focus:ring-slate-950"
                                    required
                                />
                                {errors.content && (
                                    <p className="text-xs font-black uppercase text-red-500">
                                        {errors.content}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="h-12 flex-1 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    disabled={processing}
                                    className="h-12 flex-[2] rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-emerald-600"
                                >
                                    {processing
                                        ? 'Publicando...'
                                        : 'Publicar Debate'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>

                {/* Topics Container */}
                <div className="space-y-4">
                    {topics.data.length > 0 ? (
                        topics.data.map((topic) => (
                            <Link
                                key={topic.id}
                                href={route('forums.topic', [
                                    category.slug,
                                    topic.slug,
                                ])}
                                className="block"
                            >
                                <Card
                                    className={cn(
                                        'group overflow-hidden rounded-xl border-slate-200 bg-white transition-all duration-300 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5',
                                        topic.is_pinned &&
                                            'border-emerald-100 bg-emerald-50/10',
                                    )}
                                >
                                    <CardContent className="p-5 md:p-6">
                                        <div className="flex gap-6">
                                            {/* Author Info (Desktop) */}
                                            <div className="hidden w-20 shrink-0 flex-col items-center gap-2 md:flex">
                                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                                                    {topic.user.associate
                                                        ?.logo_path ? (
                                                        <img
                                                            src={`/storage/${topic.user.associate.logo_path}`}
                                                            alt=""
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <Users
                                                            size={20}
                                                            className="text-slate-200"
                                                        />
                                                    )}
                                                </div>
                                                <span className="line-clamp-2 text-center text-[7px] font-black uppercase leading-tight text-slate-400">
                                                    {topic.user.associate
                                                        ?.company_name ||
                                                        topic.user.name}
                                                </span>
                                            </div>

                                            {/* Topic Body */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {topic.is_pinned && (
                                                                <div className="rounded bg-emerald-600 p-0.5 text-white">
                                                                    <Pin
                                                                        size={
                                                                            10
                                                                        }
                                                                        className="fill-white"
                                                                    />
                                                                </div>
                                                            )}
                                                            <h3 className="flex items-center gap-2 text-base font-black uppercase leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-emerald-600 md:text-lg">
                                                                {topic.title}
                                                                {topic.is_locked && (
                                                                    <Lock
                                                                        size={
                                                                            12
                                                                        }
                                                                        className="text-slate-400 transition-colors group-hover:text-amber-500"
                                                                    />
                                                                )}
                                                            </h3>
                                                        </div>
                                                        <p className="line-clamp-1 text-xs font-medium italic text-slate-500 opacity-70">
                                                            "
                                                            {topic.content.substring(
                                                                0,
                                                                120,
                                                            )}
                                                            ..."
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 border-t border-slate-50 pt-3 md:gap-6">
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <MessageSquare
                                                            size={12}
                                                        />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            {
                                                                topic.replies_count
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Eye size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            {topic.views_count}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Clock size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            {new Date(
                                                                topic.created_at,
                                                            ).toLocaleDateString(
                                                                'es-CO',
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Mobile Only Author */}
                                                    <div className="ml-auto flex items-center gap-2 text-slate-900 md:hidden">
                                                        <span className="text-[8px] font-black uppercase tracking-widest">
                                                            {topic.user
                                                                .associate
                                                                ?.company_name ||
                                                                topic.user.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="hidden items-center justify-center pl-4 md:flex">
                                                <ChevronRight
                                                    size={18}
                                                    className="text-slate-200 transition-all group-hover:translate-x-1 group-hover:text-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-32 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                                <MessageSquare
                                    size={32}
                                    className="text-slate-100"
                                />
                            </div>
                            <h3 className="text-xl font-black uppercase text-slate-900">
                                Sin debates aún
                            </h3>
                            <p className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                                Sé el primero en iniciar la conversación en{' '}
                                {category.name}
                            </p>
                            <Button
                                variant="outline"
                                className="mt-8 rounded-xl border-slate-200 text-[10px] font-black uppercase"
                                onClick={() => {
                                    if (!auth.user) {
                                        window.location.href = route('login');
                                    } else {
                                        setShowCreateModal(true);
                                    }
                                }}
                            >
                                <Plus size={16} className="mr-2" />
                                Crear primer hilo
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
