import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    MessageCircle, 
    Users, 
    TrendingUp, 
    Hash, 
    ChevronRight, 
    Lock, 
    Globe,
    MessageSquare,
    Zap
} from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string;
    is_private: boolean;
    topics_count?: number;
    replies_count?: number;
}

interface Props {
    categories: Category[];
    stats: {
        total_topics: number;
        total_replies: number;
    };
}

export default function Index({ categories, stats }: Props) {
    const { auth } = usePage().props as any;
    const Layout = auth.user ? AppLayout : PublicLayout;

    return (
        <Layout>
            <Head title="Red CAMEP - Comunidad Empresarial" />

            <div className={cn(
                "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                auth.user ? "py-8" : "py-16 md:py-24"
            )}>
                {/* Hero Section */}
                <div className="relative mb-12 overflow-hidden rounded-xl bg-slate-900 p-8 md:p-12 text-white shadow-lg">
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg mb-6 border border-emerald-500/30">
                            <Zap size={12} className="fill-emerald-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Ecosistema Colaborativo</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black mb-4 leading-tight tracking-tight uppercase">
                            Red CAMEP: <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Comunidad de Debates</span>
                        </h1>
                        <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed mb-8">
                            El espacio donde los empresarios de la región conectan, debaten y construyen el futuro gremial. Participa en los círculos de interés.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-2.5 rounded-xl">
                                <span className="text-xl font-black text-emerald-400">{stats.total_topics}</span>
                                <span className="text-[8px] font-black uppercase text-slate-500 leading-tight tracking-widest">Debates<br/>Abiertos</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-5 py-2.5 rounded-xl">
                                <span className="text-xl font-black text-emerald-400">{stats.total_replies}</span>
                                <span className="text-[8px] font-black uppercase text-slate-500 leading-tight tracking-widest">Respuestas<br/>Gremiales</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Title */}
                <div className="flex items-end justify-between mb-8 px-1">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Círculos de Debate</h2>
                        <p className="text-slate-500 text-[10px] font-black mt-1 uppercase tracking-widest">Selecciona un tema para explorar</p>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Link 
                            key={category.id} 
                            href={route('forums.category', category.slug)}
                            className="group block"
                        >
                            <Card className="h-full border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 rounded-xl overflow-hidden bg-white">
                                <CardContent className="p-6 md:p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all duration-300 shadow-inner">
                                            <Hash size={24} strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {category.is_private ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100/50">
                                                    <Lock size={10} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Privado</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100/50">
                                                    <Globe size={10} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Público</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-black text-slate-900 uppercase group-hover:text-emerald-600 transition-colors leading-tight tracking-tight">
                                            {category.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 opacity-70">
                                            {category.description || 'Participa en las discusiones técnicas y estratégicas de este círculo gremial.'}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <MessageSquare size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{category.topics_count || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <MessageCircle size={12} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{category.replies_count || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-emerald-600">
                                            <span className="text-[9px] font-black uppercase tracking-widest">Explorar</span>
                                            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}

                    {categories.length === 0 && (
                        <div className="col-span-full py-24 text-center">
                            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageSquare size={32} className="text-slate-200" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase">Aún no hay círculos activos</h3>
                            <p className="text-slate-500 text-sm mt-2">La administración está preparando los espacios de debate.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
