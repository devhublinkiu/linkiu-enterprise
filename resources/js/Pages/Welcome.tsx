import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Building2,
    ArrowRight,
    ShieldCheck,
    Zap,
    Globe,
    Star,
    Layout,
    Users,
    Eye,
    BookOpen,
    Network,
    Info,
    ChevronLeft,
    ChevronRight,
    Truck,
    HeartPulse,
    AlertTriangle,
    Hammer,
    Settings,
    ClipboardList,
    Leaf,
    Wrench,
    Briefcase,
    Stethoscope,
    HardHat,
    Image as ImageIcon,
    Calendar,
    Megaphone
} from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import PublicLayout from '@/Layouts/PublicLayout';
import HeroGallery from '@/Components/HeroGallery';
import { cn } from '@/lib/utils';

interface WelcomeProps extends PageProps {
    sliders: any[];
    service_categories: Array<{
        id: number;
        name: string;
        slug: string;
        services_count: number;
    }>;
    associates: Array<{
        id: number;
        name: string;
        logo: string | null;
        cover: string | null;
    }>;
    associates_count: number;
    all_associates: Array<{
        id: number;
        name: string;
        logo: string | null;
        cover: string | null;
        is_verified: boolean;
    }>;
    latest_announcements: Array<{
        id: number;
        title: string;
        slug: string;
        excerpt: string | null;
        published_at: string;
        cover_url: string | null;
    }>;
    latest_posts: Array<{
        id: number;
        title: string;
        slug: string;
        excerpt: string | null;
        published_at: string;
        category: string;
        cover_url: string | null;
    }>;
}

export default function Welcome({ 
    sliders, 
    service_categories, 
    associates, 
    associates_count, 
    all_associates,
    latest_announcements,
    latest_posts
}: WelcomeProps) {
    const { tenant, auth } = usePage<PageProps>().props;

    return (
        <PublicLayout>
            <Head title="Bienvenido" />

            <HeroGallery items={sliders} />

            {/* Featured Companies Section */}
            <section className="bg-white py-16 md:py-24 overflow-hidden border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Empresas destacadas</h2>
                        <div className="h-1.5 w-16 bg-red-500 mx-auto rounded-full mb-6"></div>
                        <p className="text-lg text-slate-500 font-medium mb-10">Conoce las empresas que hacen parte de Camep</p>
                        <div className="flex justify-center">
                            <Link href={route('companies.index')}>
                                <Button className="group/all rounded-xl bg-slate-900 text-white hover:bg-orange-500 transition-all duration-500 gap-3 px-8 h-14 shadow-2xl hover:shadow-orange-500/20">
                                    <span className="text-sm font-bold uppercase tracking-[0.2em]">Ver todas las empresas</span>
                                    <ArrowRight size={18} className="group-hover/all:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative group/carousel">
                        {/* Custom Horizontal Scroll/Carousel for featured companies */}
                        <div className="flex overflow-x-auto pb-8 gap-8 no-scrollbar snap-x snap-mandatory">
                            {all_associates.slice(0, 6).map((assoc, i) => (
                                <div
                                    key={assoc.id}
                                    className="min-w-[250px] md:min-w-[300px] snap-center animate-in fade-in zoom-in duration-700"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="group relative flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-2">
                                        {/* Main Company Image (Cover) */}
                                        <div className="relative h-48 w-full overflow-hidden">
                                            {assoc.cover ? (
                                                <img
                                                    src={assoc.cover}
                                                    alt={assoc.name}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className={cn(
                                                    "w-full h-full transition-transform duration-1000 group-hover:scale-110",
                                                    ["bg-slate-200", "bg-orange-50", "bg-slate-100", "bg-amber-50"][i % 4]
                                                )}>
                                                    <div className="w-full h-full flex items-center justify-center opacity-20">
                                                        <ImageIcon size={48} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        </div>

                                        {/* Overlapping Logo - Outside the overflow-hidden container */}
                                        <div className="absolute top-[52%] -translate-y-1/2 left-8 z-30 pb-16">
                                            {/* Gradient Border Wrapper */}
                                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-500 via-orange-600 to-green-600 p-[3px] shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-orange-200/50">
                                                <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                    {assoc.logo ? (
                                                        <img src={assoc.logo} alt={assoc.name} className="w-full h-full object-cover rounded-full shadow-inner" />
                                                    ) : (
                                                        <div className={cn(
                                                            "w-full h-full rounded-full flex items-center justify-center text-white font-black text-2xl shadow-inner",
                                                            ["bg-orange-500", "bg-amber-400", "bg-green-600", "bg-slate-400", "bg-yellow-500", "bg-teal-600"][i % 6]
                                                        )}>
                                                            {assoc.name.substring(0, 1)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-10 pb-8 px-8 flex flex-col items-start text-left flex-1 bg-gradient-to-b from-white to-slate-50/30">
                                            {/* Verification Badge */}
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 border",
                                                assoc.is_verified
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100/50"
                                                    : "bg-slate-100 text-slate-400 border-slate-200"
                                            )}>
                                                <ShieldCheck size={12} className={cn(assoc.is_verified ? "fill-emerald-600/10" : "opacity-40")} />
                                                <span className="text-[9px] font-black uppercase tracking-wider">
                                                    {assoc.is_verified ? 'Empresa Verificada' : 'Empresa No Verificada'}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                                                {assoc.name}
                                            </h3>

                                            <div className="w-full flex items-center justify-between gap-4">
                                                <Link href={route('companies.show', assoc.id)}>
                                                    <Button variant="ghost" className="rounded-xl bg-slate-900 text-white hover:bg-orange-500 hover:text-white transition-all duration-500 gap-3 px-6 h-10 shadow-lg shadow-slate-900/10">
                                                        <span className="text-xs font-bold uppercase tracking-[0.2em]">Ver empresa</span>
                                                        <ArrowRight size={14} className="group-hover/btn:translate-x-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Arrows (Visual only for now since it's native scroll) */}
                        <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -left-6 -right-6 justify-between pointer-events-none">
                            <button className="h-12 w-12 bg-slate-900 text-white rounded-xl shadow-2xl flex items-center justify-center pointer-events-auto hover:bg-orange-500 transition-all opacity-0 group-hover/carousel:opacity-100">
                                <ChevronLeft size={20} />
                            </button>
                            <button className="h-12 w-12 bg-slate-900 text-white rounded-xl shadow-2xl flex items-center justify-center pointer-events-auto hover:bg-orange-500 transition-all opacity-0 group-hover/carousel:opacity-100">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services categories section */}
            <section className="py-16 md:py-20 bg-slate-50 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full mb-4 border border-orange-100/50">
                                <span className="text-[10px] font-black uppercase tracking-widest">Nuestra Oferta</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                                Categorias de servicios: <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">que ofrece CAMEP</span>
                            </h2>
                        </div>
                        <div className="hidden md:block pb-2">
                            <div className="h-1.5 w-20 bg-orange-500 rounded-full"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {service_categories.map((category) => {
                            const getIcon = (slug: string) => {
                                const s = slug.toLowerCase();
                                if (s.includes('transporte')) return Truck;
                                if (s.includes('salud')) return HeartPulse;
                                if (s.includes('senalizacion')) return AlertTriangle;
                                if (s.includes('soldadura')) return Hammer;
                                if (s.includes('ingenieria')) return Settings;
                                if (s.includes('papeleria')) return ClipboardList;
                                if (s.includes('reforestacion') || s.includes('ambiental')) return Leaf;
                                if (s.includes('mantenimiento')) return Wrench;
                                if (s.includes('construccion')) return HardHat;
                                if (s.includes('educacion') || s.includes('capacitacion')) return BookOpen;
                                if (s.includes('tecnologia')) return Network;
                                return Briefcase;
                            };
                            const Icon = getIcon(category.slug);

                            return (
                                <Link
                                    key={category.id}
                                    href={route('categories.show', category.slug)}
                                    className="group relative bg-white p-8 rounded-xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] hover:border-orange-100 transition-all duration-500 flex flex-col items-start gap-6"
                                >
                                    <div className="relative">
                                        <div className="h-16 w-16 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-all duration-500">
                                            <Icon size={32} strokeWidth={1.5} />
                                        </div>
                                        {category.services_count > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-in zoom-in duration-500">
                                                {category.services_count}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors duration-300 leading-tight">
                                            {category.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-orange-600 text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-all duration-300">
                                            Ver categoría
                                            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>

                                    {/* Hover decoration */}
                                    <div className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                                        <ArrowRight size={14} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-12 flex flex-col items-center gap-6">
                        <Link href={route('companies.index')}>
                            <Button className="rounded-xl bg-slate-900 text-white hover:bg-orange-500 h-14 px-10 text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all duration-500 flex items-center gap-3 w-full sm:w-auto">
                                Ver todas las empresas
                                <ArrowRight size={18} />
                            </Button>
                        </Link>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Más de {service_categories.length} categorías especializadas</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="bg-white py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full mb-8 border border-orange-100">
                                <Star size={14} className="fill-orange-600" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Haz parte de la comunidad que crece contigo</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-4 md:mb-8">
                                Fortalece tu negocio con el respaldo de una <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">comunidad que crece contigo</span>
                            </h1>
                            <p className="text-lg text-slate-500 leading-[1.1] mb-10 max-w-xl">
                                <span className="block font-bold text-slate-900 mb-2">Cámara Empresarial de Puerto Gaitán</span>
                                En Camep nos dedicamos activamente a promover el desarrollo económico y social, no solo a través del fortalecimiento individual de cada empresa, sino también impulsando una colaboración estratégica y un diálogo abierto y constructivo que beneficie a toda la comunidad.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Link href={route('register')}>
                                    <Button className="w-full sm:w-auto bg-slate-900 hover:bg-orange-500 text-white rounded-xl px-8 py-6 text-sm font-bold uppercase tracking-[0.2em] shadow-2xl transition-all group overflow-hidden relative">
                                        <span className="relative z-10 flex items-center gap-3">
                                            Solicitar Afiliación
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Button>
                                </Link>
                                <div className="flex -space-x-3">
                                    {associates.map((assoc, i) => (
                                        <div
                                            key={assoc.id}
                                            className={cn(
                                                "h-12 w-12 rounded-full border-2 border-white flex items-center justify-center overflow-hidden transition-transform hover:scale-110 shadow-sm",
                                                !assoc.logo && [
                                                    "bg-orange-500",
                                                    "bg-amber-400",
                                                    "bg-green-600",
                                                    "bg-slate-400",
                                                    "bg-yellow-500",
                                                    "bg-teal-600"
                                                ][i % 6]
                                            )}
                                            title={assoc.name}
                                        >
                                            {assoc.logo ? (
                                                <img src={assoc.logo} alt={assoc.name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <span className="text-white font-bold text-[10px] uppercase">
                                                    {assoc.name.substring(0, 2)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {associates_count > associates.length && (
                                        <div className="h-10 w-12 rounded-xl border-2 border-white bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold z-10 transition-transform hover:scale-110 shadow-sm">
                                            +{associates_count - associates.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="relative animate-in fade-in zoom-in duration-1000 delay-300">
                            {/* YouTube Video Embed */}
                            <div className="relative bg-white border border-slate-100 rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden aspect-video">
                                <iframe
                                    className="w-full h-full"
                                    src="https://www.youtube.com/embed/X41vWJZisT0?autoplay=0&rel=0"
                                    title="CAMEP Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Affiliated Companies Section */}
            <section className="bg-slate-50 py-16 border-t border-slate-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-orange-600 mb-4 tracking-tight">Empresas Afiliadas</h2>
                        <div className="h-1.5 w-20 bg-gradient-to-r from-orange-500 to-yellow-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="relative">
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
                            {all_associates.map((assoc, i) => (
                                <div
                                    key={assoc.id}
                                    className="group relative transition-all duration-300 transform hover:-translate-y-1"
                                    title={assoc.name}
                                >
                                    {assoc.logo ? (
                                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center transition-shadow hover:shadow-md">
                                            <img
                                                src={assoc.logo}
                                                alt={assoc.name}
                                                className="max-h-[100px] max-w-full rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <div className={cn(
                                            "h-20 md:h-28 w-32 md:w-44 lg:w-48 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm transition-all duration-300",
                                            [
                                                "bg-orange-500",
                                                "bg-amber-400",
                                                "bg-green-600",
                                                "bg-slate-400",
                                                "bg-yellow-500",
                                                "bg-teal-600"
                                            ][i % 6]
                                        )}>
                                            <span className="text-center">{assoc.name}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {all_associates.length === 0 && (
                                <div className="text-slate-400 font-medium italic">Se parte de nuestro ecosistema empresarial</div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Announcements Section */}
            {latest_announcements && latest_announcements.length > 0 && (
                <section className="bg-white py-20 md:py-24 border-t border-slate-100 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full mb-4 border border-orange-100/50">
                                    <Megaphone size={14} strokeWidth={2.5} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Información Oficial</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                                    Anuncios <br />
                                    <span className="text-orange-500">y Licitaciones</span>
                                </h2>
                            </div>
                            <Link href={route('announcements.index')}>
                                <Button variant="outline" className="rounded-xl border-slate-200 h-14 px-8 text-xs font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-500 flex items-center gap-2">
                                    Ver todas las convocatorias <ArrowRight size={18} />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {latest_announcements.map((item) => (
                                <Link 
                                    key={item.id} 
                                    href={route('announcements.show', item.slug)}
                                    className="group bg-slate-50 rounded-xl overflow-hidden border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                                >
                                    <div className="aspect-[16/10] overflow-hidden relative">
                                        {item.cover_url ? (
                                            <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                                <Megaphone size={48} strokeWidth={1} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                                                    <Calendar size={12} className="text-orange-500" />
                                                    {item.published_at}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-sm font-black text-slate-900 mb-3 line-clamp-2 uppercase tracking-tight group-hover:text-orange-600 transition-colors h-10">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed mb-4">
                                            {item.excerpt || "Consulte los detalles oficiales de esta publicación."}
                                        </p>
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-orange-600">
                                            Leer detalles <ArrowRight size={12} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    {/* Decorative Background */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-orange-100/20 rounded-full blur-[80px]" />
                </section>
            )}

            {/* Benefits Section */}
            <section className="bg-white py-16 md:py-24 relative overflow-hidden">
                {/* Abstract background elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-[100px] -mr-64 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-50/50 rounded-full blur-[100px] -ml-64 -mb-32"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-green-600 mb-6 flex items-center justify-center gap-3">
                            <div className="h-px w-8 bg-green-200" />
                            Crecimiento y Respaldo
                            <div className="h-px w-8 bg-green-200" />
                        </h2>
                        <h3 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
                            CONOCE NUESTROS <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">BENEFICIOS</span> Y AFÍLIATE
                        </h3>
                        <p className="text-lg text-slate-500 leading-[1.1] text-justify">
                            Únete a nuestra comunidad empresarial y hagamos de esta una oportunidad de crecimiento para todos.
                            Ser aliado estratégico, generando opinión, relacionamiento, visibilidad, coadyuvando en la toma de decisiones,
                            representatividad, garantizando la vocería de sus afiliados.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                num: "1",
                                title: "Representación Influyente",
                                desc: "Tu voz se une a una fuerza gremial que influye directamente en entidades gubernamentales y operadoras de hidrocarburos.",
                                icon: Users,
                                color: "orange"
                            },
                            {
                                num: "2",
                                title: "Acceso a Oportunidades",
                                desc: "Te conectamos con los planes y programas de las grandes empresas del sector, de manera prioritaria.",
                                icon: Zap,
                                color: "amber"
                            },
                            {
                                num: "3",
                                title: "Difusión y Visibilidad",
                                desc: "Presencia destacada en el Directorio Empresarial, revista anual de CAMEP, y en todos los contenidos multimedia (vídeos, infografías, entrevistas).",
                                icon: Eye,
                                color: "yellow"
                            },
                            {
                                num: "4",
                                title: "Capacitación de Alto Nivel",
                                desc: "Accede a mesas de trabajo y jornadas técnicas sobre costos, modelos de abastecimiento y plataformas de contratación.",
                                icon: BookOpen,
                                color: "emerald"
                            },
                            {
                                num: "5",
                                title: "Networking Estratégico",
                                desc: "Conéctate con una red de empresarios locales y gremios nacionales para generar alianzas y proyectos conjuntos.",
                                icon: Network,
                                color: "green"
                            },
                            {
                                num: "6",
                                title: "Defensa Gremial",
                                desc: "Protegemos tus derechos y buscamos soluciones efectivas en casos de incumplimiento por parte de terceros.",
                                icon: ShieldCheck,
                                color: "slate"
                            }
                        ].map((benefit, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-500 flex flex-col items-start overflow-hidden"
                            >
                                {/* Big background number */}
                                <div className="absolute -bottom-12 right-2 text-[200px] font-black text-slate-100 group-hover:text-orange-100 transition-colors pointer-events-none select-none italic leading-none">
                                    {benefit.num}
                                </div>

                                <div className={cn(
                                    "w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3",
                                    {
                                        "bg-orange-100 text-orange-600": benefit.color === "orange",
                                        "bg-amber-100 text-amber-600": benefit.color === "amber",
                                        "bg-yellow-100 text-yellow-600": benefit.color === "yellow",
                                        "bg-emerald-100 text-emerald-600": benefit.color === "emerald",
                                        "bg-green-100 text-green-600": benefit.color === "green",
                                        "bg-slate-100 text-slate-600": benefit.color === "slate",
                                    }
                                )}>
                                    <benefit.icon size={28} />
                                </div>

                                <h4 className="text-lg font-bold text-slate-900 mb-4 tracking-tight group-hover:text-orange-600 transition-colors">
                                    {benefit.title}
                                </h4>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium relative z-10">
                                    {benefit.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <Link href={route('register')}>
                            <Button className="w-full sm:w-auto bg-slate-900 hover:bg-orange-500 text-white rounded-xl px-8 py-6 text-sm font-bold uppercase tracking-[0.2em] shadow-2xl transition-all group overflow-hidden relative">
                                <span className="relative z-10 flex items-center gap-3">
                                    Quiero ser parte de CAMEP
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            {latest_posts && latest_posts.length > 0 && (
                <section className="bg-slate-50 py-20 border-t border-slate-100 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                            <div className="max-w-2xl text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-orange-600 rounded-full mb-4 border border-slate-200 shadow-sm">
                                    <BookOpen size={14} strokeWidth={2.5} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Actualidad Gremial</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                                    Últimas <br />
                                    <span className="text-orange-500">Noticias y Blog</span>
                                </h2>
                            </div>
                            <Link href={route('blog.index')}>
                                <Button variant="ghost" className="rounded-xl border-slate-200 text-slate-600 h-14 px-8 text-xs font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all duration-500 flex items-center gap-2">
                                    Ir al blog completo <ArrowRight size={18} />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {latest_posts.map((post) => (
                                <Link 
                                    key={post.id} 
                                    href={route('blog.show', post.slug)}
                                    className="group flex flex-col h-full rounded-xl overflow-hidden bg-white border border-slate-100 hover:shadow-xl hover:border-orange-100 transition-all duration-500"
                                >
                                    <div className="aspect-[16/9] overflow-hidden relative">
                                        {post.cover_url ? (
                                            <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                                <BookOpen size={48} strokeWidth={1} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-white/90 backdrop-blur-sm text-slate-900 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 transition-all group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600">
                                                {post.category}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 transition-colors group-hover:text-orange-600">
                                            <Calendar size={14} />
                                            {post.published_at}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 mb-4 line-clamp-2 transition-colors uppercase leading-tight tracking-tight">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed font-medium transition-colors">
                                            {post.excerpt || "Lea nuestra última publicación sobre el sector empresarial de Puerto Gaitán."}
                                        </p>
                                        <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 group-hover:translate-x-1 transition-transform">
                                            Continuar leyendo <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
