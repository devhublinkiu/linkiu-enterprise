import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    MessageSquare, 
    ArrowLeft, 
    Send,
    ThumbsUp,
    MoreVertical,
    Share2,
    Flag,
    Users,
    Clock,
    Shield,
    Lock
} from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Textarea } from '@/Components/ui/Textarea';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/Components/ui/DropdownMenu';
import { cn } from '@/lib/utils';
import { Badge } from '@/Components/ui/Badge';
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
    const { auth } = usePage().props as any;
    const Layout = auth.user ? AppLayout : PublicLayout;

    const { data, setData, post, processing, reset, errors } = useForm({
        content: '',
    });

    const handleLike = () => {
        if (!auth.user) {
            toast.error('Inicia sesión para valorar este aporte');
            return;
        }
        post(route('forums.react', { type: 'useful', id: topic.id }), {
            preserveScroll: true,
            onSuccess: () => toast.success('¡Aporte valorado!'),
        });
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
        
        const reason = window.prompt('¿Por qué deseas reportar este contenido?');
        if (!reason) return;

        router.post(route('forums.report', { type, id: contentId }), {
            reason: reason,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Reporte enviado correctamente'),
        });
    };

    const handleReplyLike = (replyId: number) => {
        if (!auth.user) {
            toast.error('Inicia sesión para valorar este aporte');
            return;
        }
        post(route('forums.react', { type: 'useful', id: replyId }), {
            preserveScroll: true,
            onSuccess: () => toast.success('¡Aporte valorado!'),
        });
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

            <div className={cn(
                "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8",
                auth.user ? "py-8" : "py-16 md:py-24"
            )}>
                {/* Header / Breadcrumbs */}
                <div className="mb-6">
                    <Link 
                        href={route('forums.category', category.slug)}
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors mb-3"
                    >
                        <ArrowLeft size={12} />
                        Volver a {category.name}
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase leading-tight tracking-tight flex items-center gap-3">
                        {topic.title}
                        {topic.is_locked && (
                            <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600 border-none px-3 py-1 rounded-full text-[10px] tracking-widest flex items-center gap-1.5 shadow-lg shadow-amber-200">
                                <Lock size={12} /> CERRADO
                            </Badge>
                        )}
                    </h1>
                </div>

                {/* Main Post */}
                <Card className="border-slate-200 rounded-xl overflow-hidden bg-white mb-8 shadow-sm">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-50">
                            {/* Author Sidebar */}
                            <div className="w-full md:w-52 p-6 bg-slate-50/30 flex flex-col items-center text-center space-y-4">
                                <div className="h-16 w-16 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                                    {topic.user.associate?.logo_path ? (
                                        <img 
                                            src={`/storage/${topic.user.associate.logo_path}`} 
                                            alt="" 
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <Users size={24} className="text-slate-100" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{topic.user.associate?.company_name || topic.user.name}</h4>
                                    <p className="text-[8px] font-black uppercase text-emerald-600 tracking-widest">{topic.user.associate ? 'Miembro Red' : 'Administrador'}</p>
                                </div>
                            </div>

                            {/* Post Content */}
                            <div className="flex-1 p-6 md:p-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(topic.created_at).toLocaleDateString()}</span>
                                        <span className="h-1 w-1 bg-slate-200 rounded-full" />
                                        <span className="flex items-center gap-1.5"><MessageSquare size={12} /> {topic.replies.length} Respuestas</span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-slate-900 transition-colors">
                                                <MoreVertical size={18} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-100 shadow-xl p-1">
                                            <DropdownMenuItem onClick={handleShare} className="rounded-lg gap-2 font-black text-[9px] uppercase tracking-widest cursor-pointer">
                                                <Share2 size={12} />
                                                Copiar Enlace
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleReport(topic.id, 'topic')} className="rounded-lg gap-2 font-black text-[9px] uppercase tracking-widest text-red-500 focus:text-red-600 cursor-pointer">
                                                <Flag size={12} />
                                                Reportar Contenido
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="prose prose-slate max-w-none mb-10">
                                    <p className="text-slate-700 text-base md:text-lg leading-relaxed font-medium">
                                        {topic.content}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex items-center gap-3 relative z-50">
                                    <Button 
                                        onClick={handleLike}
                                        className={cn(
                                            "rounded-lg gap-2 px-5 h-10 font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-sm",
                                            topic.is_liked 
                                                ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                                                : "bg-slate-900 text-white hover:bg-emerald-600"
                                        )}
                                    >
                                        <ThumbsUp size={12} className={cn(topic.is_liked && "fill-white")} />
                                        {topic.is_liked ? 'Valorado' : 'Valorar Aporte'}
                                        {topic.reactions_count > 0 && (
                                            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[8px]">{topic.reactions_count}</span>
                                        )}
                                    </Button>
                                    <Button 
                                        onClick={handleShare}
                                        variant="outline" 
                                        className="rounded-lg border-slate-200 gap-2 px-5 h-10 font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all"
                                    >
                                        <Share2 size={12} />
                                        Compartir
                                    </Button>
                                    <Button 
                                        onClick={() => handleReport(topic.id, 'topic')}
                                        variant="ghost" 
                                        className="rounded-lg text-slate-400 hover:text-red-500 gap-2 px-5 h-10 font-black text-[9px] uppercase tracking-widest ml-auto active:scale-95 transition-all"
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
                <div className="space-y-6 mb-12">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        Respuestas Gremiales
                        <span className="h-6 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400">{topic.replies.length}</span>
                    </h3>

                    {topic.replies.map((reply) => (
                        <Card key={reply.id} className="border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6 md:p-8">
                                <div className="flex gap-6">
                                    <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                        {reply.user.associate?.logo_path ? (
                                            <img 
                                                src={`/storage/${reply.user.associate.logo_path}`} 
                                                alt="" 
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <Users size={18} className="text-slate-200" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{reply.user.associate?.company_name || reply.user.name}</h4>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Aportado el {new Date(reply.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleReplyLike(reply.id)}
                                                    className={cn(
                                                        "h-8 rounded-lg gap-2 px-3 font-black text-[9px] uppercase tracking-widest transition-colors",
                                                        reply.is_liked 
                                                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                                                            : "text-slate-300 hover:text-emerald-500"
                                                    )}
                                                >
                                                    <ThumbsUp size={12} className={cn(reply.is_liked && "fill-emerald-600")} />
                                                    {reply.reactions_count > 0 && reply.reactions_count}
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleReport(reply.id, 'reply')}
                                                    className="h-8 w-8 rounded-lg text-slate-200 hover:text-red-500 transition-colors"
                                                >
                                                    <Flag size={12} />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="text-slate-600 text-sm font-medium leading-relaxed">
                                            {reply.content}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {topic.replies.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-xl">
                            <p className="text-slate-400 font-black uppercase text-[9px] tracking-widest">No hay respuestas aún. Sé el primero en opinar.</p>
                        </div>
                    )}
                </div>

                {/* Reply Editor */}
                {topic.is_locked ? (
                    <Card className="border-amber-200 bg-amber-50/30 rounded-xl overflow-hidden p-10 text-center border-2 border-dashed shadow-sm">
                        <div className="max-w-md mx-auto space-y-5">
                            <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm border border-amber-100">
                                <Lock size={24} className="text-amber-500" />
                            </div>
                            <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight">Debate Finalizado</h3>
                            <p className="text-amber-700/70 text-sm font-medium leading-relaxed">
                                Este hilo ha sido cerrado por un administrador. La conversación ha finalizado y no se admiten más aportes.
                            </p>
                        </div>
                    </Card>
                ) : auth.user ? (
                    <Card className="border-slate-200 rounded-xl overflow-hidden shadow-xl border-t-4 border-t-slate-900">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <Send size={18} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Tu Aporte Gremial</h3>
                            </div>
                            <form onSubmit={submitReply} className="space-y-6">
                                <Textarea 
                                    placeholder="Escribe tu opinión técnica o profesional aquí..."
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    className="min-h-[140px] rounded-xl border-slate-200 focus:ring-slate-950 focus:border-slate-950 p-6 font-medium text-slate-700 text-sm"
                                />
                                {errors.content && <p className="text-xs font-black text-red-500 uppercase">{errors.content}</p>}
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest max-w-[200px]">
                                        Recuerda mantener un lenguaje profesional y constructivo.
                                    </p>
                                    <Button 
                                        disabled={processing}
                                        className="rounded-lg bg-slate-900 hover:bg-emerald-600 text-white px-8 h-12 font-black text-[10px] uppercase tracking-widest shadow-lg transition-all"
                                    >
                                        Enviar Respuesta
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-emerald-100 bg-emerald-50/50 rounded-xl overflow-hidden p-12 text-center border-2 border-dashed">
                        <div className="max-w-md mx-auto space-y-6">
                            <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
                                <Shield size={28} className="text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Debate Reservado</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Para participar en este debate y dar tu opinión como empresario, debes estar registrado en la Red CAMEP.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href={route('login')}>
                                    <Button className="w-full sm:w-auto rounded-lg bg-slate-900 text-white px-8 h-11 font-black text-[9px] uppercase tracking-widest">
                                        Iniciar Sesión
                                    </Button>
                                </Link>
                                <Link href={route('register')}>
                                    <Button variant="outline" className="w-full sm:w-auto rounded-lg border-slate-200 px-8 h-11 font-black text-[9px] uppercase tracking-widest">
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
