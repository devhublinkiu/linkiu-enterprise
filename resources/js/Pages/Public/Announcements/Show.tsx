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
    Megaphone,
    ShieldAlert,
    Globe,
    User,
    ExternalLink
} from 'lucide-react';
import DOMPurify from 'dompurify';

interface Document {
    id: number;
    name: string;
    file_name: string;
    size: string;
    url: string;
    ext: string;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    excerpt: string | null;
    visibility: 'public' | 'members_only';
    published_at: string;
    cover_url: string | null;
    author: string;
}

interface Props {
    announcement: Announcement;
    documents: Document[];
}

export default function Show({ announcement, documents }: Props) {
    const sanitizedContent = DOMPurify.sanitize(announcement.content);

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
            <Head title={announcement.title} />

            <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 space-y-12">
                {/* Back Link */}
                <Link href={route('announcements.index')} className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors font-bold text-sm group uppercase tracking-widest">
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                    Volver a Listado
                </Link>

                {/* Hero Header */}
                <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl min-h-[350px] flex flex-col justify-end p-6 md:p-16">
                    {announcement.cover_url && (
                        <div className="absolute inset-0 opacity-40">
                            <img src={announcement.cover_url} alt={announcement.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
                        </div>
                    )}

                    <div className="relative z-10 space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {announcement.visibility === 'members_only' ? (
                                <Badge className="bg-purple-600/90 text-white border-none px-5 py-1.5 text-[10px] uppercase font-black tracking-widest backdrop-blur-sm">
                                    <ShieldAlert size={12} className="mr-2" /> Exclusivo Asociados
                                </Badge>
                            ) : (
                                <Badge className="bg-blue-600/90 text-white border-none px-5 py-1.5 text-[10px] uppercase font-black tracking-widest backdrop-blur-sm">
                                    <Globe size={12} className="mr-2" /> Información Pública
                                </Badge>
                            )}

                            <Badge className="bg-slate-800/80 text-orange-400 border-slate-700 px-5 py-1.5 text-[10px] uppercase font-black tracking-widest backdrop-blur-sm">
                                <Calendar size={12} className="mr-2" /> {announcement.published_at}
                            </Badge>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-[1.1] uppercase">
                            {announcement.title}
                        </h1>

                        <div className="flex items-center gap-6 text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <User size={14} className="text-orange-500" />
                                <span>Por: {announcement.author}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-16">
                    {/* Main Content */}
                    <article className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-orange-600 prose-img:rounded-xl prose-img:shadow-2xl">
                        <div
                            className="tiptap-content text-justify"
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        />
                    </article>

                    {/* Downloads Section */}
                    {documents.length > 0 && (
                        <Card className="border-none shadow-2xl rounded-xl overflow-hidden bg-white">
                            <CardHeader className="p-8 md:p-12 pb-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-14 w-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                                        <FileText size={28} />
                                    </div>
                                    <CardTitle className="text-xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Documentación Adjunta</CardTitle>
                                </div>
                                <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest">Descarga los documentos oficiales de esta publicación.</p>
                            </CardHeader>
                            <CardContent className="p-8 md:p-12 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {documents.map((doc) => (
                                        <a
                                            key={doc.id}
                                            href={doc.url}
                                            target="_blank"
                                            download
                                            className="group relative bg-slate-50 border border-slate-100 p-6 rounded-xl hover:bg-white hover:border-orange-200 hover:shadow-2xl transition-all duration-500"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="shrink-0 p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                                                    {getFileIcon(doc.ext)}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-black text-slate-900 truncate mb-1 uppercase tracking-tight">
                                                        {doc.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        <span>{doc.ext}</span>
                                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                        <span>{doc.size}</span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 self-center">
                                                    <Download size={20} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>

                                <div className="mt-10 p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-start gap-4">
                                    <ShieldAlert className="text-blue-600 shrink-0" size={24} />
                                    <p className="text-xs text-blue-800 font-medium leading-light tracking-widest text-justify">
                                        Los documentos publicados son exclusivamente para fines informativos institucionales de CAMEP. La redistribución no autorizada está prohibida.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Restricted Message Callout if no documents but members_only (Fallback) */}
                    {announcement.visibility === 'members_only' && documents.length === 0 && (
                        <div className="bg-slate-900 rounded-xl p-12 text-white relative overflow-hidden">
                            <div className="relative z-10 max-w-2xl">
                                <h3 className="text-2xl md:text-4xl font-black mb-6 tracking-tight uppercase leading-tight">
                                    Este anuncio contiene información <span className="text-orange-500">Exclusiva para Asociados</span>
                                </h3>
                                <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed uppercase tracking-widest text-[10px]">
                                    Para ver la documentación completa y pliegos de condiciones, debe iniciar sesión con su cuenta de asociado CAMEP.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href={route('login')}>
                                        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-14 px-8 font-black text-xs uppercase tracking-widest transition-all">
                                            Iniciar Sesión
                                        </Button>
                                    </Link>
                                    <Link href={route('register')}>
                                        <Button variant="outline" className="border-slate-700 text-white hover:bg-white hover:text-slate-900 rounded-xl h-14 px-8 font-black text-xs uppercase tracking-widest transition-all">
                                            Solicitar Afiliación
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <ShieldAlert className="absolute -right-12 -bottom-12 text-white/5 w-64 h-64 -rotate-12" strokeWidth={1} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
