import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import {
    Megaphone,
    Calendar,
    ChevronRight,
    FileText,
    Globe,
    ShieldAlert,
    Clock,
    Search,
    ArrowUpRight,
    Bell,
    Filter,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/Components/ui/Input';

interface Announcement {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    visibility: 'public' | 'members_only';
    published_at: string;
    expires_at: string | null;
    cover_url: string | null;
    documents_count: number;
}

interface Props {
    announcements: {
        data: Announcement[];
        links: any[];
    };
}

export default function Index({ announcements }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAnnouncements = useMemo(() => {
        return announcements.data.filter(item => 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.excerpt && item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, announcements.data]);

    return (
        <AppLayout>
            <Head title="Anuncios y Licitaciones" />

            <div className="max-w-7xl mx-auto space-y-10 pb-20">
                {/* Premium Banner */}
                <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800 shadow-xl p-8 md:p-10">
                    <div className="relative z-10 max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <Bell size={14} className="text-emerald-400 fill-emerald-400/20" />
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Comunicados Oficiales</span>
                        </div>
                        
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                            Anuncios, Noticias <br />
                            <span className="text-emerald-500">y Licitaciones</span>
                        </h1>
                        
                        <p className="text-slate-400 text-base font-medium leading-relaxed max-w-xl">
                            Accede a convocatorias oficiales, pliegos de condiciones y las últimas actualizaciones del ecosistema CAMEP.
                        </p>
                    </div>

                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] -mr-48 -mt-48 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-24 -mb-24 pointer-events-none" />
                    
                    <div className="absolute right-12 bottom-0 transform translate-y-1/4 hidden lg:block opacity-10">
                         <Megaphone size={300} strokeWidth={0.5} className="text-white -rotate-12" />
                    </div>
                </div>

                {/* Search and Navigation Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-20 backdrop-blur-md bg-white/90">
                    <div className="relative w-full md:w-96 group">
                        <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", searchTerm ? "text-slate-900" : "text-slate-400 group-focus-within:text-slate-900")} size={18} />
                        <Input
                            placeholder="Buscar comunicado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-11 bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:ring-slate-950/5 transition-all font-medium text-sm"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="h-10 px-4 bg-slate-100 rounded-xl flex items-center justify-center gap-2 border border-slate-200 shadow-inner">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {filteredAnnouncements.length} Publicaciones encontradas
                            </span>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAnnouncements.map((item) => (
                        <Card key={item.id} className="group relative border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-xl overflow-hidden bg-white">
                            {/* Image Header */}
                            <div className="aspect-[16/10] overflow-hidden relative bg-slate-50 border-b border-slate-100">
                                {item.cover_url ? (
                                    <img
                                        src={item.cover_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                        <Megaphone size={48} strokeWidth={1} />
                                    </div>
                                )}

                                {/* Visibility Overlay */}
                                <div className="absolute top-3 left-3">
                                    {item.visibility === 'members_only' ? (
                                        <Badge className="bg-slate-950 text-white border-none py-1 px-2.5 text-[10px] font-black uppercase tracking-wider shadow-lg">
                                            <ShieldAlert size={10} className="mr-1.5 text-emerald-400" /> Miembros
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-white text-slate-900 border-none py-1 px-2.5 text-[10px] font-black uppercase tracking-wider shadow-lg">
                                            <Globe size={10} className="mr-1.5 text-blue-500" /> Público
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-4 flex flex-col">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Calendar size={12} className="text-emerald-500" />
                                        <span>{item.published_at}</span>
                                    </div>
                                    
                                    <Link href={route('associate.announcements.show', item.slug)}>
                                        <h3 className="text-lg font-black text-slate-900 leading-tight tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-2 uppercase">
                                            {item.title}
                                        </h3>
                                    </Link>

                                    <p className="text-slate-500 text-xs font-bold leading-relaxed line-clamp-2">
                                        {item.excerpt || "Accede para conocer los detalles, requisitos y plazos de esta publicación oficial."}
                                    </p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        {item.documents_count > 0 ? (
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                <FileText size={12} />
                                                <span>{item.documents_count} Adjuntos</span>
                                            </div>
                                        ) : <div />}

                                        {item.expires_at && (
                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500">
                                                <Clock size={12} />
                                                <span>Expira {item.expires_at}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Link href={route('associate.announcements.show', item.slug)} className="block group/link">
                                        <Button className="w-full bg-slate-50 group-hover/link:bg-slate-950 group-hover/link:text-white text-slate-900 rounded-lg h-11 font-black text-xs uppercase tracking-widest transition-all duration-300 gap-2">
                                            Leer Publicación
                                            <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredAnnouncements.length === 0 && (
                        <div className="col-span-full py-32 flex flex-col items-center text-center space-y-6">
                            <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-100 border border-slate-100 shadow-inner">
                                <Search size={48} strokeWidth={1} />
                            </div>
                            <div className="max-w-md">
                                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Sin coincidencias</h2>
                                <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-wide">
                                    No encontramos anuncios que coincidan con tu búsqueda. Intenta con otros términos o despeja los filtros.
                                </p>
                            </div>
                            <Button onClick={() => setSearchTerm('')} variant="outline" className="rounded-xl border-slate-200 font-bold uppercase text-[10px] tracking-widest px-8">
                                Mostrar todo
                            </Button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {announcements.links && announcements.links.length > 3 && (
                    <div className="flex justify-center mt-12 py-8 bg-slate-50/50 rounded-3xl border border-slate-100">
                        {/* Pagination component logic or simplified link rendering */}
                        <div className="flex gap-2">
                             {announcements.links.map((link, i) => (
                                 <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={cn(
                                        "h-10 min-w-[2.5rem] px-3 flex items-center justify-center rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                                        link.active 
                                            ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10" 
                                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                 />
                             ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function X({ size, className }: { size?: number; className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );
}

const Target = ({ size, className }: { size?: number; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
);
