import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Download,
    ExternalLink,
    FileCheck,
    FileText,
    Globe,
    Info,
    Lock,
    Megaphone,
    ShieldAlert,
    User,
} from 'lucide-react';

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
        if (['doc', 'docx'].includes(e))
            return <FileText className="text-blue-500" />;
        if (['xls', 'xlsx'].includes(e))
            return <FileCheck className="text-emerald-500" />;
        return <FileText className="text-slate-400" />;
    };

    return (
        <AppLayout>
            <Head title={announcement.title} />

            <div className="mx-auto mt-4 max-w-5xl space-y-8 pb-20">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between">
                    <Link
                        href={route('associate.announcements.index')}
                        className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:text-emerald-600"
                    >
                        <ArrowLeft
                            size={14}
                            className="transition-transform group-hover:-translate-x-1"
                        />
                        Volver al Portal
                    </Link>

                    <div className="hidden items-center gap-2 sm:flex">
                        <Badge className="border-none bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                            {announcement.published_at}
                        </Badge>
                    </div>
                </div>

                {/* Hero Feature */}
                <div className="relative flex min-h-[350px] flex-col justify-end overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-8 shadow-xl md:p-12">
                    {announcement.cover_url && (
                        <div className="absolute inset-0">
                            <img
                                src={announcement.cover_url}
                                alt={announcement.title}
                                className="h-full w-full object-cover opacity-30"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                        </div>
                    )}

                    <div className="relative z-10 max-w-3xl space-y-6">
                        <div className="flex flex-wrap gap-2">
                            {announcement.visibility === 'members_only' ? (
                                <Badge className="border-none bg-emerald-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                    <ShieldAlert size={12} className="mr-1.5" />{' '}
                                    Exclusivo Asociados
                                </Badge>
                            ) : (
                                <Badge className="border-none bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                    <Globe size={12} className="mr-1.5" />{' '}
                                    Información Pública
                                </Badge>
                            )}

                            {announcement.expires_at && (
                                <Badge className="border-none bg-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                    <Clock size={12} className="mr-1.5" />{' '}
                                    Plazo: {announcement.expires_at}
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
                            {announcement.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 border-t border-white/10 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-emerald-400">
                                    <User size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-white/40">
                                        Autor
                                    </span>
                                    <span className="text-sm font-bold uppercase text-white">
                                        {announcement.author}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-blue-400">
                                    <Calendar size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="mb-1 text-[10px] font-black uppercase leading-none tracking-widest text-white/40">
                                        Publicado
                                    </span>
                                    <span className="text-sm font-bold uppercase text-white">
                                        {announcement.published_at}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Main Content */}
                    <div className="space-y-8 lg:col-span-8">
                        <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
                            <div
                                className="tiptap-content prose prose-slate prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-img:rounded-lg prose-a:text-emerald-600 prose-a:font-black max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizedContent,
                                }}
                            />
                        </article>

                        {/* Support Center Bar */}
                        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-xl bg-slate-900 p-8 text-white shadow-lg md:flex-row">
                            <div className="relative z-10 space-y-1">
                                <h4 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                                    <Megaphone
                                        size={20}
                                        className="text-emerald-500"
                                    />
                                    ¿Necesitas ayuda?
                                </h4>
                                <p className="max-w-md text-sm font-medium text-slate-400">
                                    Contáctanos si tienes dudas sobre los
                                    términos o el proceso de esta publicación.
                                </p>
                            </div>

                            <Link
                                href={route('associate.messages.index')}
                                className="relative z-10 shrink-0"
                            >
                                <Button className="h-12 rounded-lg bg-emerald-500 px-8 text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg transition-all hover:bg-emerald-400">
                                    <ExternalLink size={16} className="mr-2" />{' '}
                                    Soporte CAMEP
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar: Downloads & Metadata */}
                    <div className="space-y-6 lg:col-span-4">
                        <section className="sticky top-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white shadow-md">
                                    <FileText size={16} />
                                </div>
                                <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">
                                    Documentos
                                </h2>
                            </div>

                            <div className="space-y-4 p-5">
                                {documents.length > 0 ? (
                                    <div className="space-y-2">
                                        {documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className={cn(
                                                    'group relative flex items-center justify-between gap-3 rounded-xl border p-3 transition-all',
                                                    doc.is_locked
                                                        ? 'border-slate-100 bg-slate-50 opacity-80'
                                                        : 'border-slate-200 bg-white shadow-sm hover:border-emerald-300',
                                                )}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white">
                                                        {doc.is_locked ? (
                                                            <Lock
                                                                size={14}
                                                                className="text-slate-300"
                                                            />
                                                        ) : (
                                                            getFileIcon(doc.ext)
                                                        )}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p
                                                            className={cn(
                                                                'mb-1 truncate text-xs font-black uppercase leading-none tracking-tight',
                                                                doc.is_locked
                                                                    ? 'text-slate-400'
                                                                    : 'text-slate-900',
                                                            )}
                                                        >
                                                            {doc.name}
                                                        </p>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                            {doc.ext} •{' '}
                                                            {doc.size}
                                                        </span>
                                                    </div>
                                                </div>

                                                {!doc.is_locked ? (
                                                    <a
                                                        href={doc.url!}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        download
                                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white transition-all hover:bg-emerald-500"
                                                    >
                                                        <Download size={14} />
                                                    </a>
                                                ) : (
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                                        <Lock size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-slate-200 py-10 text-center">
                                        <FileText
                                            size={24}
                                            className="text-slate-200"
                                            strokeWidth={1}
                                        />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Sin documentos
                                        </p>
                                    </div>
                                )}

                                {!can_download && (
                                    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                        <div className="flex items-center gap-2 text-amber-700">
                                            <ShieldAlert
                                                size={16}
                                                className="shrink-0"
                                            />
                                            <h5 className="text-[10px] font-black uppercase tracking-widest">
                                                Sin permiso
                                            </h5>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-amber-700">
                                            Tu plan no permite descargar estos
                                            archivos.
                                        </p>
                                        <Link
                                            href={route(
                                                'associate.company.billing',
                                            )}
                                            className="block"
                                        >
                                            <Button className="h-9 w-full rounded-lg bg-amber-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-700">
                                                Mejorar Plan
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {announcement.visibility === 'members_only' && (
                                    <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3">
                                        <Info
                                            size={14}
                                            className="mt-0.5 shrink-0 text-blue-500"
                                        />
                                        <p className="text-[9px] font-bold uppercase leading-relaxed tracking-wider text-blue-800">
                                            Información exclusiva para asociados
                                            CAMEP.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
