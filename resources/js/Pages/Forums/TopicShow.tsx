import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/DropdownMenu';
import { Textarea } from '@/Components/ui/Textarea';
import AppLayout from '@/Layouts/AppLayout';
import PublicLayout from '@/Layouts/PublicLayout';
import { cn } from '@/lib/utils';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    Flag,
    Lock,
    MessageSquare,
    MoreVertical,
    Send,
    Share2,
    Shield,
    ThumbsUp,
    Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Reply {
    id: number;
    content: string;
    created_at: string;
    reactions_count: number;
    is_liked: boolean;
    user: {
        name: string;
        associate: {
            company_name: string;
            logo_path: string | null;
        } | null;
    };
}

interface Topic {
    id: number;
    title: string;
    content: string;
    views_count: number;
    reactions_count: number;
    is_liked: boolean;
    created_at: string;
    is_locked: boolean;
    user: {
        name: string;
        associate: {
            company_name: string;
            logo_path: string | null;
        } | null;
    };
    replies: Reply[];
}

interface Props {
    category: Category;
    topic: Topic;
}

export default function TopicShow({ category, topic }: Props) {
    const { auth } = usePage().props as {
        auth: { user: { name: string } | null };
    };
    const Layout = auth.user ? AppLayout : PublicLayout;

    const { data, setData, post, processing, reset, errors } = useForm({
        content: '',
    });

    const handleLike = () => {
        if (!auth.user) {
            toast.error('Inicia sesión para valorar este aporte');
            return;
        }
        post(
            route('forums.react', {
                reactable: 'topic',
                type: 'useful',
                id: topic.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => toast.success('¡Aporte valorado!'),
            },
        );
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado al portapapeles');
    };

    const handleReport = (contentId: number, type: 'topic' | 'reply') => {
        if (!auth.user) {
            toast.error('Inicia sesión para reportar contenido');
            return;
        }

        const reason = window.prompt(
            '¿Por qué deseas reportar este contenido?',
        );
        if (!reason) return;

        router.post(
            route('forums.report', { type, id: contentId }),
            {
                reason: reason,
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Reporte enviado correctamente'),
            },
        );
    };

    const handleReplyLike = (replyId: number) => {
        if (!auth.user) {
            toast.error('Inicia sesión para valorar este aporte');
            return;
        }
        post(
            route('forums.react', {
                reactable: 'reply',
                type: 'useful',
                id: replyId,
            }),
            {
                preserveScroll: true,
                onSuccess: () => toast.success('¡Aporte valorado!'),
            },
        );
    };

    const submitReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('forums.reply.store', topic.id), {
            onSuccess: () => reset(),
        });
    };

    return (
        <Layout>
            <Head title={`${topic.title} - ${category.name}`} />

            <div
                className={cn(
                    'mx-auto max-w-5xl px-4 sm:px-6 lg:px-8',
                    auth.user ? 'py-8' : 'py-16 md:py-24',
                )}
            >
                {/* Header / Breadcrumbs */}
                <div className="mb-6">
                    <Link
                        href={route('forums.category', category.slug)}
                        className="mb-3 inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft size={12} />
                        Volver a {category.name}
                    </Link>
                    <h1 className="flex items-center gap-3 text-2xl font-black uppercase leading-tight tracking-tight text-slate-900 md:text-3xl">
                        {topic.title}
                        {topic.is_locked && (
                            <Badge
                                variant="destructive"
                                className="flex items-center gap-1.5 rounded-full border-none bg-amber-500 px-3 py-1 text-[10px] tracking-widest shadow-lg shadow-amber-200 hover:bg-amber-600"
                            >
                                <Lock size={12} /> CERRADO
                            </Badge>
                        )}
                    </h1>
                </div>

                {/* Main Post */}
                <Card className="mb-8 overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-0">
                        <div className="flex flex-col divide-y divide-slate-50 md:flex-row md:divide-x md:divide-y-0">
                            {/* Author Sidebar */}
                            <div className="flex w-full flex-col items-center space-y-4 bg-slate-50/30 p-6 text-center md:w-52">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                                    {topic.user.associate?.logo_path ? (
                                        <img
                                            src={`/storage/${topic.user.associate.logo_path}`}
                                            alt=""
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <Users
                                            size={24}
                                            className="text-slate-100"
                                        />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black uppercase tracking-tight text-slate-900">
                                        {topic.user.associate?.company_name ||
                                            topic.user.name}
                                    </h4>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600">
                                        {topic.user.associate
                                            ? 'Miembro Red'
                                            : 'Administrador'}
                                    </p>
                                </div>
                            </div>

                            {/* Post Content */}
                            <div className="flex-1 p-6 md:p-10">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={12} />{' '}
                                            {new Date(
                                                topic.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-slate-200" />
                                        <span className="flex items-center gap-1.5">
                                            <MessageSquare size={12} />{' '}
                                            {topic.replies.length} Respuestas
                                        </span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-slate-300 transition-colors hover:text-slate-900"
                                            >
                                                <MoreVertical size={18} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-44 rounded-xl border-slate-100 p-1 shadow-xl"
                                        >
                                            <DropdownMenuItem
                                                onClick={handleShare}
                                                className="cursor-pointer gap-2 rounded-lg text-[9px] font-black uppercase tracking-widest"
                                            >
                                                <Share2 size={12} />
                                                Copiar Enlace
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleReport(
                                                        topic.id,
                                                        'topic',
                                                    )
                                                }
                                                className="cursor-pointer gap-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-500 focus:text-red-600"
                                            >
                                                <Flag size={12} />
                                                Reportar Contenido
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="prose prose-slate mb-10 max-w-none">
                                    <p className="whitespace-pre-line text-base font-medium leading-relaxed text-slate-700 md:text-lg">
                                        {topic.content}
                                    </p>
                                </div>

                                <div className="relative z-50 flex items-center gap-3 border-t border-slate-100 pt-6">
                                    <Button
                                        onClick={handleLike}
                                        className={cn(
                                            'h-10 gap-2 rounded-lg px-5 text-[9px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95',
                                            topic.is_liked
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                : 'bg-slate-900 text-white hover:bg-emerald-600',
                                        )}
                                    >
                                        <ThumbsUp
                                            size={12}
                                            className={cn(
                                                topic.is_liked && 'fill-white',
                                            )}
                                        />
                                        {topic.is_liked
                                            ? 'Valorado'
                                            : 'Valorar Aporte'}
                                        {topic.reactions_count > 0 && (
                                            <span className="ml-1 rounded bg-white/20 px-1.5 py-0.5 text-[8px]">
                                                {topic.reactions_count}
                                            </span>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleShare}
                                        variant="outline"
                                        className="h-10 gap-2 rounded-lg border-slate-200 px-5 text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        <Share2 size={12} />
                                        Compartir
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            handleReport(topic.id, 'topic')
                                        }
                                        variant="ghost"
                                        className="ml-auto h-10 gap-2 rounded-lg px-5 text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all hover:text-red-500 active:scale-95"
                                    >
                                        <Flag size={12} />
                                        Reportar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Replies Listing */}
                <div className="mb-12 space-y-6">
                    <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tight text-slate-900">
                        Respuestas Gremiales
                        <span className="flex h-6 w-10 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-400">
                            {topic.replies.length}
                        </span>
                    </h3>

                    {topic.replies.map((reply) => (
                        <Card
                            key={reply.id}
                            className="overflow-hidden rounded-xl border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                        >
                            <CardContent className="p-6 md:p-8">
                                <div className="flex gap-6">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                                        {reply.user.associate?.logo_path ? (
                                            <img
                                                src={`/storage/${reply.user.associate.logo_path}`}
                                                alt=""
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <Users
                                                size={18}
                                                className="text-slate-200"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <h4 className="text-[10px] font-black uppercase tracking-tight text-slate-900">
                                                    {reply.user.associate
                                                        ?.company_name ||
                                                        reply.user.name}
                                                </h4>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                                    Aportado el{' '}
                                                    {new Date(
                                                        reply.created_at,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleReplyLike(
                                                            reply.id,
                                                        )
                                                    }
                                                    className={cn(
                                                        'h-8 gap-2 rounded-lg px-3 text-[9px] font-black uppercase tracking-widest transition-colors',
                                                        reply.is_liked
                                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            : 'text-slate-300 hover:text-emerald-500',
                                                    )}
                                                >
                                                    <ThumbsUp
                                                        size={12}
                                                        className={cn(
                                                            reply.is_liked &&
                                                                'fill-emerald-600',
                                                        )}
                                                    />
                                                    {reply.reactions_count >
                                                        0 &&
                                                        reply.reactions_count}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleReport(
                                                            reply.id,
                                                            'reply',
                                                        )
                                                    }
                                                    className="h-8 w-8 rounded-lg text-slate-200 transition-colors hover:text-red-500"
                                                >
                                                    <Flag size={12} />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="whitespace-pre-line text-sm font-medium leading-relaxed text-slate-600">
                                            {reply.content}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {topic.replies.length === 0 && (
                        <div className="rounded-xl border-2 border-dashed border-slate-100 py-20 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                No hay respuestas aún. Sé el primero en opinar.
                            </p>
                        </div>
                    )}
                </div>

                {/* Reply Editor */}
                {topic.is_locked ? (
                    <Card className="overflow-hidden rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 p-10 text-center shadow-sm">
                        <div className="mx-auto max-w-md space-y-5">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-amber-100 bg-white shadow-sm">
                                <Lock size={24} className="text-amber-500" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-amber-900">
                                Debate Finalizado
                            </h3>
                            <p className="text-sm font-medium leading-relaxed text-amber-700/70">
                                Este hilo ha sido cerrado por un administrador.
                                La conversación ha finalizado y no se admiten
                                más aportes.
                            </p>
                        </div>
                    </Card>
                ) : auth.user ? (
                    <Card className="overflow-hidden rounded-xl border-t-4 border-slate-200 border-t-slate-900 shadow-xl">
                        <CardContent className="p-8">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
                                    <Send size={18} />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                                    Tu Aporte Gremial
                                </h3>
                            </div>
                            <form onSubmit={submitReply} className="space-y-6">
                                <Textarea
                                    placeholder="Escribe tu opinión técnica o profesional aquí..."
                                    value={data.content}
                                    onChange={(e) =>
                                        setData('content', e.target.value)
                                    }
                                    className="min-h-[140px] rounded-xl border-slate-200 p-6 text-sm font-medium text-slate-700 focus:border-slate-950 focus:ring-slate-950"
                                />
                                {errors.content && (
                                    <p className="text-xs font-black uppercase text-red-500">
                                        {errors.content}
                                    </p>
                                )}
                                <div className="flex items-center justify-between">
                                    <p className="max-w-[200px] text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        Recuerda mantener un lenguaje
                                        profesional y constructivo.
                                    </p>
                                    <Button
                                        disabled={processing}
                                        className="h-12 rounded-lg bg-slate-900 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-emerald-600"
                                    >
                                        Enviar Respuesta
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden rounded-xl border-2 border-dashed border-emerald-100 bg-emerald-50/50 p-12 text-center">
                        <div className="mx-auto max-w-md space-y-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm">
                                <Shield
                                    size={28}
                                    className="text-emerald-500"
                                />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                                Debate Reservado
                            </h3>
                            <p className="text-sm font-medium leading-relaxed text-slate-500">
                                Para participar en este debate y dar tu opinión
                                como empresario, debes estar registrado en la
                                Red CAMEP.
                            </p>
                            <div className="flex flex-col justify-center gap-3 sm:flex-row">
                                <Link href={route('login')}>
                                    <Button className="h-11 w-full rounded-lg bg-slate-900 px-8 text-[9px] font-black uppercase tracking-widest text-white sm:w-auto">
                                        Iniciar Sesión
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button
                                        variant="outline"
                                        className="h-11 w-full rounded-lg border-slate-200 px-8 text-[9px] font-black uppercase tracking-widest sm:w-auto"
                                    >
                                        Unirse a la Red
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
