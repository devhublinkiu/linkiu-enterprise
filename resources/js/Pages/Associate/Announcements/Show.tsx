import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { 
    ArrowLeft, 
    Download, 
    Calendar, 
    Clock, 
    FileText, 
    Megaphone, 
    ShieldAlert, 
    Globe,
    User,
    ExternalLink,
    Lock,
    Unlock,
    Info,
    ArrowUpRight,
    FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface Document {
    id: number;
    name: string;
    file_name: string;
    size: string;
    url: string | null;
    ext: string;
    is_locked: boolean;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    excerpt: string | null;
    visibility: 'public' | 'members_only';
    published_at: string;
    expires_at: string | null;
    cover_url: string | null;
    author: string;
}

interface Props {
    announcement: Announcement;
    documents: Document[];
    can_download: boolean;
}

export default function Show({ announcement, documents, can_download }: Props) {
    const sanitizedContent = DOMPurify.sanitize(announcement.content);

    const getFileIcon = (ext: string) => {
        const e = ext.toLowerCase();
        if (['pdf'].includes(e)) return <FileText className="text-red-500" />;
        if (['doc', 'docx'].includes(e)) return <FileText className="text-blue-500" />;
        if (['xls', 'xlsx'].includes(e)) return <FileCheck className="text-emerald-500" />;
        return <FileText className="text-slate-400" />;
    };

    return (
        <AppLayout>
            <Head title={announcement.title} />

            <div className="max-w-5xl mx-auto space-y-8 pb-20 mt-4">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between">
                    <Link href={route('associate.announcements.index')} 
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-all font-black text-[11px] uppercase tracking-widest group bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                        Volver al Portal
                    </Link>
                    
                    <div className="hidden sm:flex items-center gap-2">
                         <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                            {announcement.published_at}
                         </Badge>
                    </div>
                </div>

                {/* Hero Feature */}
                <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl min-h-[350px] flex flex-col justify-end p-8 md:p-12">
                    {announcement.cover_url && (
                        <div className="absolute inset-0">
                            <img src={announcement.cover_url} alt={announcement.title} className="w-full h-full object-cover opacity-30" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                        </div>
                    )}
                    
                    <div className="relative z-10 space-y-6 max-w-3xl">
                        <div className="flex flex-wrap gap-2">
                            {announcement.visibility === 'members_only' ? (
                                <Badge className="bg-emerald-600 text-white border-none px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                                    <ShieldAlert size={12} className="mr-1.5" /> Exclusivo Asociados
                                </Badge>
                            ) : (
                                <Badge className="bg-blue-600 text-white border-none px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                                    <Globe size={12} className="mr-1.5" /> Información Pública
                                </Badge>
                            )}
                            
                            {announcement.expires_at && (
                                <Badge className="bg-red-500 text-white border-none px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                                    <Clock size={12} className="mr-1.5" /> Plazo: {announcement.expires_at}
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            {announcement.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                                    <User size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Autor</span>
                                    <span className="text-sm font-bold text-white uppercase">{announcement.author}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                                    <Calendar size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Publicado</span>
                                    <span className="text-sm font-bold text-white uppercase">{announcement.published_at}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <article className="bg-white rounded-xl border border-slate-200 p-8 md:p-10 shadow-sm">
                            <div 
                                className="tiptap-content prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-img:rounded-lg prose-a:text-emerald-600 prose-a:font-black"
                                dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
                            />
                        </article>

                        {/* Support Center Bar */}
                        <div className="bg-slate-900 rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-lg">
                            <div className="relative z-10 space-y-1">
                                <h4 className="text-xl font-black tracking-tight flex items-center gap-2 uppercase">
                                    <Megaphone size={20} className="text-emerald-500" />
                                    ¿Necesitas ayuda?
                                </h4>
                                <p className="text-slate-400 text-sm font-medium max-w-md">
                                    Contáctanos si tienes dudas sobre los términos o el proceso de esta publicación.
                                </p>
                            </div>
                            
                            <Button className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg h-12 px-8 font-black text-xs uppercase tracking-widest transition-all shadow-lg relative z-10">
                                <ExternalLink size={16} className="mr-2" /> Soporte CAMEP
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar: Downloads & Metadata */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm sticky top-6">
                            <div className="flex items-center gap-3 p-5 bg-slate-50 border-b border-slate-200">
                                <div className="h-8 w-8 rounded-lg bg-slate-950 flex items-center justify-center text-white shrink-0 shadow-md">
                                    <FileText size={16} />
                                </div>
                                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Documentos</h2>
                            </div>
                            
                            <div className="p-5 space-y-4">
                                {documents.length > 0 ? (
                                    <div className="space-y-2">
                                        {documents.map((doc) => (
                                            <div key={doc.id} className={cn(
                                                "group relative p-3 rounded-xl border transition-all flex items-center justify-between gap-3",
                                                doc.is_locked ? "bg-slate-50 border-slate-100 opacity-80" : "bg-white border-slate-200 hover:border-emerald-300 shadow-sm"
                                            )}>
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="shrink-0 h-9 w-9 bg-white border border-slate-100 rounded-lg flex items-center justify-center">
                                                        {doc.is_locked ? <Lock size={14} className="text-slate-300" /> : getFileIcon(doc.ext)}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className={cn("text-xs font-black tracking-tight truncate uppercase leading-none mb-1", doc.is_locked ? "text-slate-400" : "text-slate-900")}>
                                                            {doc.name}
                                                        </p>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.ext} • {doc.size}</span>
                                                    </div>
                                                </div>

                                                {!doc.is_locked ? (
                                                    <a href={doc.url!} target="_blank" download className="h-8 w-8 rounded-lg bg-slate-950 text-white flex items-center justify-center hover:bg-emerald-500 transition-all shrink-0">
                                                        <Download size={14} />
                                                    </a>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                                        <Lock size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 border border-dashed border-slate-200 rounded-xl">
                                        <FileText size={24} className="text-slate-200" strokeWidth={1} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin documentos</p>
                                    </div>
                                )}

                                {!can_download && (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                                        <div className="flex items-center gap-2 text-amber-700">
                                            <ShieldAlert size={16} className="shrink-0" />
                                            <h5 className="text-[10px] font-black uppercase tracking-widest">Sin permiso</h5>
                                        </div>
                                        <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-widest">
                                            Tu plan no permite descargar estos archivos.
                                        </p>
                                        <Link href={route('associate.billing.index')} className="block">
                                            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg h-9 text-[10px] font-black uppercase tracking-widest">
                                                Mejorar Plan
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                                
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
                                    <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-[9px] text-blue-800 font-bold uppercase tracking-wider leading-relaxed">
                                        Información exclusiva para asociados CAMEP.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
