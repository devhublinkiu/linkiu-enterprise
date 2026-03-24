import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { PageProps } from '@/types';
import {
    ArrowLeft,
    ChevronRight,
    Building2,
    ShieldCheck,
    SearchX,
    MapPin,
    ArrowRight,
    Zap,
    Globe,
    Facebook,
    Instagram,
    Phone,
    Tag
} from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/utils';

interface ServiceShowProps extends PageProps {
    service: {
        id: number;
        name: string;
        slug: string;
        category: {
            id: number;
            name: string;
            slug: string;
        };
    };
    associates: Array<{
        id: number;
        name: string;
        nit: string | null;
        logo: string | null;
        cover: string | null;
        is_verified: boolean;
        description: string;
        phone: string | null;
        website: string | null;
        facebook: string | null;
        instagram: string | null;
        linkedin: string | null;
        categories: Array<{
            id: number;
            name: string;
            slug: string;
        }>;
    }>;
}

export default function ServiceShow({ service, associates }: ServiceShowProps) {
    const { tenant } = usePage<PageProps>().props;

    return (
        <PublicLayout>
            <Head title={service.name} />

            {/* Hero Header */}
            <div className="relative bg-slate-900 py-16 md:py-24 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500 rounded-full blur-[220px] -mr-64 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-500 rounded-full blur-[220px] -ml-64 -mb-32"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
                    <Link
                        href={route('categories.show', service.category.slug)}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-300">Volver a {service.category.name}</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 text-orange-400 rounded-full mb-4 border border-white/10 backdrop-blur-sm">
                                <Zap size={14} strokeWidth={2.5} fill="currentColor" className="opacity-40" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Servicio Especializado</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                                {service.name}
                            </h1>
                            <p className="mt-4 text-slate-400 font-medium max-w-xl text-lg">
                                Conoce las empresas aliadas a CAMEP que cuentan con la capacidad técnica y operativa para prestar el servicio de {service.name.toLowerCase()}.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white backdrop-blur-md">
                                <Building2 size={32} strokeWidth={1.5} />
                            </div>
                            <div className="text-left">
                                <div className="text-3xl font-black text-white">{associates.length}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">Empresas Encontradas</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Companies List - Standardized Cards (Matching Index.tsx) */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20">
                {associates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {associates.map((assoc, i) => (
                            <div
                                key={assoc.id}
                                className="group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 duration-700 h-full"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                {/* Cover Image */}
                                <div className="relative h-48 w-full overflow-hidden">
                                    {assoc.cover ? (
                                        <img
                                            src={assoc.cover}
                                            alt={assoc.name}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center transition-transform duration-1000 group-hover:scale-110">
                                            <Building2 size={48} className="text-slate-200" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                                    {/* Status Badge */}
                                    <div className="absolute top-6 right-6">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                            assoc.is_verified
                                                ? "bg-emerald-500 text-white border-emerald-400"
                                                : "bg-slate-500 text-white border-slate-400"
                                        )}>
                                            {assoc.is_verified ? 'Verificada' : 'Estándar'}
                                        </div>
                                    </div>
                                </div>

                                {/* Logo Overlay */}
                                <div className="absolute top-[192px] -translate-y-[60%] left-8 z-20 p-[3px] h-20 w-20 rounded-full bg-gradient-to-br from-red-500 via-orange-600 to-green-600 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                        {assoc.logo ? (
                                            <img src={assoc.logo} alt={assoc.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-2xl font-black text-orange-500">{assoc.name.charAt(0)}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="pt-12 pb-8 px-8 flex flex-col flex-1 h-full">
                                    <div className="mb-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                            NIT: {assoc.nit || 'En trámite'}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
                                            {assoc.name}
                                        </h3>
                                    </div>

                                    {assoc.description && (
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3 mb-2">
                                            {assoc.description}
                                        </p>
                                    )}

                                    {/* Categories Badges */}
                                    <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                                        {assoc.categories.map(cat => (
                                            <span
                                                key={cat.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100/50"
                                            >
                                                <Tag size={10} />
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Social and Contact row */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                        <div className="flex gap-4">
                                            {assoc.website && (
                                                <a href={assoc.website} target="_blank" className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-all">
                                                    <Globe size={18} />
                                                </a>
                                            )}
                                            {assoc.facebook && (
                                                <a href={assoc.facebook} target="_blank" className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-all">
                                                    <Facebook size={18} />
                                                </a>
                                            )}
                                            {assoc.instagram && (
                                                <a href={assoc.instagram} target="_blank" className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-all">
                                                    <Instagram size={18} />
                                                </a>
                                            )}
                                            {assoc.phone && (
                                                <a href={`tel:${assoc.phone}`} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition-all">
                                                    <Phone size={18} />
                                                </a>
                                            )}
                                        </div>

                                        <Link href={route('companies.show', assoc.id)}>
                                            <Button size="sm" className="rounded-xl bg-slate-900 hover:bg-orange-500 transition-all duration-300 font-bold px-5">
                                                Ver Perfil
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-white rounded-xl border border-dashed border-slate-200">
                        <div className="inline-flex h-24 w-24 items-center justify-center rounded-xl bg-slate-50 text-slate-300 mb-8 animate-pulse">
                            <SearchX size={48} strokeWidth={1} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4">No se encontraron empresas</h3>
                        <p className="text-slate-500 max-w-md mx-auto font-medium">
                            Actualmente no contamos con empresas verificadas que ofrezcan el servicio de <span className="font-black text-slate-900">{service.name}</span>. Por favor, intenta con otro servicio relacionado.
                        </p>
                        <div className="mt-12 flex justify-center gap-4">
                            <Link href={route('categories.show', service.category.slug)}>
                                <Button variant="outline" className="rounded-xl font-bold gap-3 h-12 px-8">
                                    <ArrowLeft size={18} />
                                    Ver otros servicios
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </PublicLayout>
    );
}
