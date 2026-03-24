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
    ShieldAlert,
    Globe,
    Building2,
    ExternalLink,
    MapPin,
    Share2,
    FileCheck
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';

interface Document {
    id: number;
    name: string;
    file_name: string;
    size: string;
    url: string;
    ext: string;
}

interface Company {
    id: number;
    nombre: string;
    slug: string;
    logo_url: string | null;
    departamento: string | null;
    ciudad: string | null;
}

interface Tender {
    id: number;
    titulo: string;
    contenido: string | null;
    extracto: string | null;
    enlace_externo: string | null;
    publico_objetivo: 'abierto' | 'exclusivo_asociados';
    estado: 'borrador' | 'publicado' | 'cerrado';
    fecha_publicacion: string | null;
    fecha_cierre: string | null;
    featured_image_url: string | null;
}

interface Props {
    company: Company;
    tender: Tender;
    documents: Document[];
}

export default function TenderDetail({ company, tender, documents }: Props) {
    const sanitizedContent = tender.contenido ? DOMPurify.sanitize(tender.contenido) : '';

    const getFileIcon = (ext: string) => {
        const e = ext.toLowerCase();
        if (['pdf'].includes(e)) return <FileText className="text-red-500" />;
        if (['doc', 'docx'].includes(e)) return <FileText className="text-blue-500" />;
        if (['xls', 'xlsx'].includes(e)) return <FileCheck className="text-emerald-500" />;
        return <FileText className="text-slate-400" />;
    };

    return (
        <AppLayout>
            <Head title={`${tender.titulo} - ${company.nombre}`} />

            <div className="max-w-5xl mx-auto space-y-8 pb-20 mt-4">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between">
                    <Link href={route('associate.company.bienes-servicios.company', company.slug)}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-green-600 transition-all font-black text-[11px] uppercase tracking-widest group bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                        Otras Licitaciones de {company.nombre}
                    </Link>

                    <div className="hidden sm:flex items-center gap-2">
                        <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                            {tender.fecha_publicacion || 'N/A'}
                        </Badge>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Tender Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Header Section */}
                        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl p-8 md:p-12 relative border border-slate-800">
                            <div className="relative z-10 space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    {tender.publico_objetivo === 'exclusivo_asociados' ? (
                                        <Badge className="bg-emerald-600 text-white border-none px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                                            <ShieldAlert size={12} className="mr-1.5" /> Exclusivo Asociados
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-blue-600 text-white border-none px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                                            <Globe size={12} className="mr-1.5" /> Público Abierto
                                        </Badge>
                                    )}

                                    {tender.estado === 'cerrado' && (
                                        <Badge variant="destructive" className="px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                                            <Clock size={12} className="mr-1.5" /> Cerrado
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight uppercase">
                                    {tender.titulo}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-green-500" />
                                        <span>Inicio: {tender.fecha_publicacion || 'N/A'}</span>
                                    </div>
                                    {tender.fecha_cierre && (
                                        <div className="flex items-center gap-2 text-red-400">
                                            <Clock size={14} />
                                            <span>Cierre: {tender.fecha_cierre}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                        </div>

                        {/* Featured Image */}
                        {tender.featured_image_url && (
                            <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 aspect-video">
                                <img
                                    src={tender.featured_image_url}
                                    alt={tender.titulo}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Content Body */}
                        <article className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
                            <div
                                className="tiptap-content prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-img:rounded-xl prose-a:text-green-600 prose-a:font-black"
                                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                            />

                            {!sanitizedContent && (
                                <p className="text-slate-400 italic font-medium">No se ha proporcionado contenido detallado adicional.</p>
                            )}

                            {tender.enlace_externo && (
                                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center md:justify-start">
                                    <a
                                        href={tender.enlace_externo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        Portal de Licitación Externo <ExternalLink size={18} />
                                    </a>
                                </div>
                            )}
                        </article>
                    </div>

                    {/* Right Side: Company & Documents */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Company Card */}
                        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-6 text-center space-y-4">
                                <Link
                                    href={route('associate.company.bienes-servicios.company', company.slug)}
                                    className="block mx-auto w-24 h-24 bg-slate-50 rounded-2xl p-4 border border-slate-100 group transition-all"
                                >
                                    {company.logo_url ? (
                                        <img src={company.logo_url} alt={company.nombre} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <Building2 size={40} className="text-slate-200 mx-auto mt-2" />
                                    )}
                                </Link>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight line-clamp-1">{company.nombre}</h3>
                                    <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <MapPin size={12} className="text-green-500" />
                                        <span>{company.ciudad || company.departamento}</span>
                                    </div>
                                </div>
                                <Link href={route('associate.company.bienes-servicios.company', company.slug)} className="block">
                                    <Button variant="outline" className="w-full h-10 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50">
                                        Perfil Operadora
                                    </Button>
                                </Link>
                            </div>
                        </section>

                        {/* Documents Section */}
                        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm sticky top-6">
                            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                                <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shrink-0">
                                    <FileText size={16} />
                                </div>
                                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Pliegos y Anexos</h2>
                            </div>

                            <div className="p-5 space-y-4">
                                {documents.length > 0 ? (
                                    <div className="space-y-2">
                                        {documents.map((doc) => (
                                            <div key={doc.id} className="group p-3 rounded-xl border border-slate-200 hover:border-green-300 transition-all flex items-center justify-between gap-3 bg-white hover:shadow-lg hover:shadow-green-500/5">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="shrink-0 h-9 w-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center group-hover:bg-green-50 transition-colors">
                                                        {getFileIcon(doc.ext)}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-black text-slate-900 tracking-tight truncate uppercase mb-0.5">
                                                            {doc.name}
                                                        </p>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{doc.ext} • {doc.size}</span>
                                                    </div>
                                                </div>

                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    download
                                                    className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-green-600 transition-all shadow-md shrink-0"
                                                >
                                                    <Download size={14} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                                        <FileText size={32} className="text-slate-200" strokeWidth={1} />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay archivos adjuntos</p>
                                    </div>
                                )}

                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                                    <ShieldAlert size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-[9px] text-blue-800 font-black leading-relaxed uppercase tracking-widest">
                                        Documentación técnica confidencial. Prohibida su reproducción parcial o total fuera del marco de la licitación.
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
