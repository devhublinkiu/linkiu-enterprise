import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
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
    Lock
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
    isRestricted: boolean;
}

export default function TenderDetail({ company, tender, documents, isRestricted }: Props) {
    console.log('TenderDetail Props:', { company, tender, isRestricted });
    const sanitizedContent = tender.contenido ? DOMPurify.sanitize(tender.contenido) : '';

    const getFileIcon = (ext: string) => {
        switch (ext.toLowerCase()) {
            case 'pdf': return <FileText className="text-red-500" />;
            case 'doc':
            case 'docx': return <FileText className="text-blue-500" />;
            case 'xls':
            case 'xlsx': return <FileText className="text-emerald-500" />;
            default: return <FileText className="text-slate-400" />;
        }
    };

    return (
        <PublicLayout>
            <Head title={`${tender.titulo} - ${company.nombre}`} />

            <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
                {/* Breadcrumbs / Back */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href={route('bienes-servicios.company', company.slug)}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors font-bold text-sm group uppercase tracking-widest"
                    >
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        Otras Licitaciones de {company.nombre}
                    </Link>

                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Share2 size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Header Section */}
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-3">
                                {tender.publico_objetivo === 'exclusivo_asociados' ? (
                                    <Badge className="bg-purple-600 text-white border-none px-4 py-1 text-[10px] uppercase font-black tracking-widest">
                                        <ShieldAlert size={12} className="mr-2" /> Exclusivo Asociados
                                    </Badge>
                                ) : (
                                    <Badge className="bg-blue-600 text-white border-none px-4 py-1 text-[10px] uppercase font-black tracking-widest">
                                        <Globe size={12} className="mr-2" /> Público Abierto
                                    </Badge>
                                )}

                                {tender.estado === 'cerrado' && (
                                    <Badge variant="destructive" className="px-4 py-1 text-[10px] uppercase font-black tracking-widest">
                                        <Clock size={12} className="mr-2" /> Convocatoria Cerrada
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] uppercase">
                                {tender.titulo}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-green-500" />
                                    <span>Publicado: {tender.fecha_publicacion || 'N/A'}</span>
                                </div>
                                {tender.fecha_cierre && (
                                    <div className="flex items-center gap-2 text-red-500">
                                        <Clock size={14} />
                                        <span>Cierre: {tender.fecha_cierre}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detailed Content */}
                        <div className="relative">
                            <Card className={`border-none shadow-sm rounded-3xl bg-white overflow-hidden transition-all duration-700 ${isRestricted ? 'blur-md opacity-40 select-none pointer-events-none' : ''}`}>
                                <CardContent className="p-8 md:p-12">
                                    <article className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-green-600 prose-img:rounded-2xl">
                                        {sanitizedContent ? (
                                            <div
                                                className="tiptap-content"
                                                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                                            />
                                        ) : (
                                            <p className="text-slate-400 italic">No hay contenido detallado adicional para esta licitación.</p>
                                        )}
                                    </article>

                                    {tender.enlace_externo && (
                                        <div className="mt-12 pt-8 border-t border-slate-100">
                                            <a
                                                href={tender.enlace_externo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-slate-900/10"
                                            >
                                                Ver en Portal Externo <ExternalLink size={18} />
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {isRestricted && (
                                <div className="fixed inset-0 z-[40] flex items-center justify-center p-6 bg-white/80 backdrop-blur-xl">
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="max-w-md w-full bg-white border border-white shadow-2xl rounded-[2.5rem] p-10 text-center space-y-8"
                                    >
                                        <div className="w-20 h-20 bg-green-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-green-600/20">
                                            <Lock size={32} className="text-white" />
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Contenido Exclusivo</h3>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                                Esta licitación está reservada únicamente para los <span className="text-green-600">Asociados CAMEP</span> activos.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 pt-4">
                                            <Link href={route('login')}>
                                                <Button className="w-full bg-slate-900 hover:bg-green-600 text-white rounded-2xl h-14 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10">
                                                    Iniciar Sesión
                                                </Button>
                                            </Link>
                                            <Link href={route('register')}>
                                                <Button variant="outline" className="w-full border-slate-200 text-slate-900 hover:bg-slate-50 rounded-2xl h-14 font-black text-xs uppercase tracking-widest transition-all">
                                                    Solicitar Afiliación
                                                </Button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        {/* Documents Section */}
                        {!isRestricted && documents.length > 0 && (
                            <Card className="border-none shadow-sm rounded-3xl bg-slate-100 overflow-hidden">
                                <CardHeader className="p-8 md:p-12 pb-4">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="h-12 w-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                                            <FileText size={24} />
                                        </div>
                                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight uppercase">Documentación Adjunta</CardTitle>
                                    </div>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Pliegos de condiciones y anexos técnicos.</p>
                                </CardHeader>
                                <CardContent className="p-8 md:p-12 pt-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        {documents.map((doc) => (
                                            <a
                                                key={doc.id}
                                                href={doc.url}
                                                target="_blank"
                                                download
                                                className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-green-300 hover:shadow-lg transition-all"
                                            >
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className="shrink-0 p-2 bg-slate-50 rounded-xl group-hover:bg-green-50 transition-colors">
                                                        {getFileIcon(doc.ext)}
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-bold text-slate-800 truncate text-sm uppercase">
                                                            {doc.name}
                                                        </p>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.size}</span>
                                                    </div>
                                                </div>
                                                <Download size={18} className="text-slate-300 group-hover:text-green-600 transition-colors shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {isRestricted && (
                             <div className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-12 text-center">
                                <ShieldAlert size={48} className="text-slate-200 mx-auto mb-6" />
                                <h4 className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Documentación técnica protegida</h4>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
