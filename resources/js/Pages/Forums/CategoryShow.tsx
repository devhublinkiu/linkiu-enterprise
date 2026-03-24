import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    MessageSquare, 
    Users, 
    Clock, 
    ArrowLeft, 
    ChevronRight,
    Search,
    Plus,
    Eye,
    Pin,
    Lock,
    X
} from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Textarea } from '@/Components/ui/Textarea';
import Modal from '@/Components/Modal';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';

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
        links: any[];
    };
}

export default function CategoryShow({ category, topics }: Props) {
    const { auth } = usePage().props as any;
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

            <div className={cn(
                "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                auth.user ? "py-8" : "py-16 md:py-24"
            )}>
                {/* Breadcrumbs & Header */}
                <div className="mb-8 space-y-4">
                    <Link 
                        href={route('forums.index')}
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={12} />
                        Volver a los Círculos
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
                                {category.name}
                            </h1>
                            <p className="text-slate-500 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
                                {category.description || 'Participa en las discusiones técnicas y estratégicas de este círculo gremial.'}
                            </p>
                        </div>
                        
                        <Button 
                            className="rounded-lg bg-slate-900 hover:bg-emerald-600 text-white px-8 h-12 font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 shrink-0"
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
                <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="2xl">
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <Plus size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Iniciar Nuevo Debate</h2>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">En {category.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Título del Debate</label>
                                <Input 
                                    placeholder="¿Cuál es el tema principal?"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="h-12 rounded-xl border-slate-200 focus:ring-slate-950 focus:border-slate-950 font-bold text-slate-900 text-sm"
                                    required
                                />
                                {errors.title && <p className="text-xs font-black text-red-500 uppercase">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Contenido / Argumento</label>
                                <Textarea 
                                    placeholder="Explica detalladamente el tema de debate..."
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    className="min-h-[160px] rounded-xl border-slate-200 focus:ring-slate-950 focus:border-slate-950 p-5 font-medium text-slate-700 text-sm"
                                    required
                                />
                                {errors.content && <p className="text-xs font-black text-red-500 uppercase">{errors.content}</p>}
                            </div>

                            <div className="pt-2 flex gap-4">
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    disabled={processing}
                                    className="flex-[2] h-12 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all"
                                >
                                    {processing ? 'Publicando...' : 'Publicar Debate'}
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
                                href={route('forums.topic', [category.slug, topic.slug])}
                                className="block"
                            >
                                <Card className={cn(
                                    "border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 rounded-xl overflow-hidden bg-white group",
                                    topic.is_pinned && "border-emerald-100 bg-emerald-50/10"
                                )}>
                                    <CardContent className="p-5 md:p-6">
                                        <div className="flex gap-6">
                                            {/* Author Info (Desktop) */}
                                            <div className="hidden md:flex flex-col items-center gap-2 shrink-0 w-20">
                                                <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                                                    {topic.user.associate?.logo_path ? (
                                                        <img 
                                                            src={`/storage/${topic.user.associate.logo_path}`} 
                                                            alt="" 
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <Users size={20} className="text-slate-200" />
                                                    )}
                                                </div>
                                                <span className="text-[7px] font-black uppercase text-slate-400 text-center leading-tight line-clamp-2">
                                                    {topic.user.associate?.company_name || topic.user.name}
                                                </span>
                                            </div>

                                            {/* Topic Body */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {topic.is_pinned && (
                                                                <div className="bg-emerald-600 text-white p-0.5 rounded">
                                                                    <Pin size={10} className="fill-white" />
                                                                </div>
                                                            )}
                                                            <h3 className="text-base md:text-lg font-black text-slate-900 uppercase group-hover:text-emerald-600 transition-colors leading-tight tracking-tight flex items-center gap-2">
                                                                {topic.title}
                                                                {topic.is_locked && (
                                                                    <Lock size={12} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                                                                )}
                                                            </h3>
                                                        </div>
                                                        <p className="text-slate-500 text-xs line-clamp-1 font-medium italic opacity-70">
                                                            "{topic.content.substring(0, 120)}..."
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-3 border-t border-slate-50">
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <MessageSquare size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{topic.replies_count}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Eye size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{topic.views_count}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <Clock size={12} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{new Date(topic.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    
                                                    {/* Mobile Only Author */}
                                                    <div className="md:hidden flex items-center gap-2 text-slate-900 ml-auto">
                                                        <span className="text-[8px] font-black uppercase tracking-widest">{topic.user.associate?.company_name || topic.user.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="hidden md:flex items-center justify-center pl-4">
                                                <ChevronRight size={18} className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    )) : (
                        <div className="py-32 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <MessageSquare size={32} className="text-slate-100" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase">Sin debates aún</h3>
                            <p className="text-slate-500 text-sm mt-2 uppercase font-bold tracking-widest">Sé el primero en iniciar la conversación en {category.name}</p>
                            <Button 
                                variant="outline" 
                                className="mt-8 rounded-xl border-slate-200 font-black text-[10px] uppercase"
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
