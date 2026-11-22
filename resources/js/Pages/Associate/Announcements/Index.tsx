import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    Calendar,
    Clock,
    FileText,
    Globe,
    Megaphone,
    Search,
    ShieldAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function Index({ announcements }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAnnouncements = useMemo(() => {
        return announcements.data.filter(
            (item) =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.excerpt &&
                    item.excerpt
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())),
        );
    }, [searchTerm, announcements.data]);

    return (
        <AppLayout>
            <Head title="Anuncios y Licitaciones" />

            <div className="mx-auto max-w-7xl space-y-10 pb-20">
                {/* Premium Banner */}
                <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-8 shadow-xl md:p-10">
                    <div className="relative z-10 max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                            <Bell
                                size={14}
                                className="fill-emerald-400/20 text-emerald-400"
                            />
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                                Comunicados Oficiales
                            </span>
                        </div>

                        <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
                            Anuncios, Noticias <br />
                            <span className="text-emerald-500">
                                y Licitaciones
                            </span>
                        </h1>

                        <p className="max-w-xl text-base font-medium leading-relaxed text-slate-400">
                            Accede a convocatorias oficiales, pliegos de
                            condiciones y las últimas actualizaciones del
                            ecosistema CAMEP.
                        </p>
                    </div>

                    {/* Background Decorative Elements */}
                    <div className="pointer-events-none absolute right-0 top-0 -mr-48 -mt-48 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[140px]" />
                    <div className="pointer-events-none absolute bottom-0 left-0 -mb-24 -ml-24 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />

                    <div className="absolute bottom-0 right-12 hidden translate-y-1/4 transform opacity-10 lg:block">
                        <Megaphone
                            size={300}
                            strokeWidth={0.5}
                            className="-rotate-12 text-white"
                        />
                    </div>
                </div>

                {/* Search and Navigation Bar */}
                <div className="sticky top-4 z-20 flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white bg-white/90 p-4 shadow-sm backdrop-blur-md md:flex-row">
                    <div className="group relative w-full md:w-96">
                        <Search
                            className={cn(
                                'absolute left-4 top-1/2 -translate-y-1/2 transition-colors',
                                searchTerm
                                    ? 'text-slate-900'
                                    : 'text-slate-400 group-focus-within:text-slate-900',
                            )}
                            size={18}
                        />
                        <Input
                            placeholder="Buscar comunicado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-12 text-sm font-medium transition-all focus:bg-white focus:ring-slate-950/5"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 shadow-inner">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {filteredAnnouncements.length} Publicaciones
                                encontradas
                            </span>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredAnnouncements.map((item) => (
                        <Card
                            key={item.id}
                            className="group relative overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                        >
                            {/* Image Header */}
                            <div className="relative aspect-[16/10] overflow-hidden border-b border-slate-100 bg-slate-50">
                                {item.cover_url ? (
                                    <img
                                        src={item.cover_url}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-200">
                                        <Megaphone size={48} strokeWidth={1} />
                                    </div>
                                )}

                                {/* Visibility Overlay */}
                                <div className="absolute left-3 top-3">
                                    {item.visibility === 'members_only' ? (
                                        <Badge className="border-none bg-slate-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                                            <ShieldAlert
                                                size={10}
                                                className="mr-1.5 text-emerald-400"
                                            />{' '}
                                            Miembros
                                        </Badge>
                                    ) : (
                                        <Badge className="border-none bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-lg">
                                            <Globe
                                                size={10}
                                                className="mr-1.5 text-blue-500"
                                            />{' '}
                                            Público
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <CardContent className="flex flex-col space-y-4 p-6">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Calendar
                                            size={12}
                                            className="text-emerald-500"
                                        />
                                        <span>{item.published_at}</span>
                                    </div>

                                    <Link
                                        href={route(
                                            'associate.announcements.show',
                                            item.slug,
                                        )}
                                    >
                                        <h3 className="line-clamp-2 text-lg font-black uppercase leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-emerald-600">
                                            {item.title}
                                        </h3>
                                    </Link>

                                    <p className="line-clamp-2 text-xs font-bold leading-relaxed text-slate-500">
                                        {item.excerpt ||
                                            'Accede para conocer los detalles, requisitos y plazos de esta publicación oficial.'}
                                    </p>
                                </div>

                                <div className="space-y-4 border-t border-slate-100 pt-4">
                                    <div className="flex items-center justify-between">
                                        {item.documents_count > 0 ? (
                                            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                                <FileText size={12} />
                                                <span>
                                                    {item.documents_count}{' '}
                                                    Adjuntos
                                                </span>
                                            </div>
                                        ) : (
                                            <div />
                                        )}

                                        {item.expires_at && (
                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500">
                                                <Clock size={12} />
                                                <span>
                                                    Expira {item.expires_at}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        href={route(
                                            'associate.announcements.show',
                                            item.slug,
                                        )}
                                        className="group/link block"
                                    >
                                        <Button className="h-11 w-full gap-2 rounded-lg bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-900 transition-all duration-300 group-hover/link:bg-slate-950 group-hover/link:text-white">
                                            Leer Publicación
                                            <ArrowRight
                                                size={14}
                                                className="transition-transform group-hover/link:translate-x-1"
                                            />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredAnnouncements.length === 0 && (
                        <div className="col-span-full flex flex-col items-center space-y-6 py-32 text-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-slate-100 bg-slate-50 text-slate-100 shadow-inner">
                                <Search size={48} strokeWidth={1} />
                            </div>
                            <div className="max-w-md">
                                <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">
                                    Sin coincidencias
                                </h2>
                                <p className="mt-2 text-sm font-bold uppercase tracking-wide text-slate-400">
                                    No encontramos anuncios que coincidan con tu
                                    búsqueda. Intenta con otros términos.
                                </p>
                            </div>
                            <Button
                                onClick={() => setSearchTerm('')}
                                variant="outline"
                                className="rounded-xl border-slate-200 px-8 text-[10px] font-bold uppercase tracking-widest"
                            >
                                Mostrar todo
                            </Button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {announcements.links && announcements.links.length > 3 && (
                    <div className="mt-12 flex justify-center rounded-3xl border border-slate-100 bg-slate-50/50 py-8">
                        {/* Pagination component logic or simplified link rendering */}
                        <div className="flex gap-2">
                            {announcements.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={cn(
                                        'flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl border px-3 text-xs font-black uppercase tracking-widest transition-all',
                                        link.active
                                            ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400',
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
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
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
