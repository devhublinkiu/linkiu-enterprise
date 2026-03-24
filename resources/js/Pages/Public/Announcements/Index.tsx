import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { 
    Megaphone, 
    Calendar, 
    ArrowRight,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';

interface Announcement {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string;
    cover_url: string | null;
}

interface Props extends PageProps {
    announcements: {
        data: Announcement[];
        links: any[];
    };
}

export default function Index({ announcements }: Props) {
    const { tenant } = usePage<PageProps>().props;

    return (
        <PublicLayout>
            <Head title="Anuncios y Licitaciones" />

            {/* Hero Header */}
            <div className="relative bg-slate-900 overflow-hidden py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full mb-6 border border-orange-500/20">
                            <Megaphone size={14} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Información Oficial</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 uppercase">
                            Anuncios, Noticias <br />
                            <span className="text-orange-500">y Licitaciones Públicas</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                            Manténgase al día con las últimas convocatorias, pliegos de condiciones y noticias institucionales de CAMEP.
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px]" />
                <Megaphone className="absolute right-12 bottom-12 text-slate-800/10 w-64 h-64 -rotate-12 hidden lg:block" strokeWidth={1} />
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-24">
                
                {/* Search Bar Placeholder */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar anuncios..." 
                            className="w-full pl-12 pr-6 h-14 rounded-xl border-slate-200 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm font-medium transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest">
                        <span>Mostrando {announcements.data.length} resultados</span>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {announcements.data.map((item) => (
                        <Card key={item.id} className="group relative border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 rounded-xl overflow-hidden bg-white">
                            {/* Image Header */}
                            <div className="aspect-[16/10] overflow-hidden relative bg-slate-100">
                                {item.cover_url ? (
                                    <img 
                                        src={item.cover_url} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                        <Megaphone size={64} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <CardContent className="p-8">
                                <Link href={route('announcements.show', item.slug)} className="block group/link">
                                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 line-clamp-2 group-hover/link:text-orange-600 transition-colors uppercase">
                                        {item.title}
                                    </h3>
                                </Link>
                                
                                <p className="text-slate-500 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
                                    {item.excerpt || "Consulte los detalles oficiales de esta publicación institucional de CAMEP."}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Calendar size={14} className="text-orange-500" />
                                        <span>{item.published_at}</span>
                                    </div>
                                    <Link href={route('announcements.show', item.slug)}>
                                        <Button variant="ghost" className="h-10 w-10 rounded-full p-0 flex items-center justify-center bg-slate-50 text-slate-900 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                                            <ArrowRight size={18} />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {announcements.data.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                                <Megaphone size={48} strokeWidth={1} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight uppercase">No se encontraron anuncios</h3>
                            <p className="text-slate-500 font-medium font-bold uppercase tracking-widest text-[10px]">Vuelva a consultar más tarde para nuevas actualizaciones.</p>
                        </div>
                    )}
                </div>

                {/* Pagination (Simplified) */}
                {announcements.links && announcements.links.length > 3 && (
                    <div className="mt-16 flex justify-center">
                        {/* Pagination links here */}
                    </div>
                )}
            </div>

            {/* Final CTA */}
            <section className="bg-white py-24 border-t border-slate-100 overflow-hidden relative">
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase">¿Desea acceso exclusivo?</h2>
                    <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed uppercase tracking-tight text-center">
                        Afíliese a CAMEP para acceder a licitaciones privadas, pliegos de condiciones detallados y documentos técnicos exclusivos para asociados.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href={route('register')}>
                            <Button className="h-16 px-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 transition-all flex items-center gap-3">
                                Solicitar Afiliación <ArrowRight size={20} />
                            </Button>
                        </Link>
                        <Link href={route('login')}>
                            <Button variant="outline" className="h-16 px-10 rounded-xl border-slate-200 text-slate-900 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
                                Mi Portal Asociado
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-orange-100/30 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px]" />
            </section>
        </PublicLayout>
    );
}
