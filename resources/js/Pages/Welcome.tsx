import HeroGallery, { type GalleryItem } from '@/Components/HeroGallery';
import PortfolioFlipbook from '@/Components/PortfolioFlipbook';
import { Button } from '@/Components/ui/Button';
import PublicLayout from '@/Layouts/PublicLayout';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Briefcase,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Eye,
    Hammer,
    HardHat,
    HeartPulse,
    Image as ImageIcon,
    Leaf,
    Megaphone,
    Network,
    Settings,
    ShieldCheck,
    Truck,
    Users,
    Wrench,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface WelcomeProps extends PageProps {
    sliders: GalleryItem[];
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
    latest_posts,
}: WelcomeProps) {
    // --- Featured companies carousel ---
    const carouselRef = useRef<HTMLDivElement>(null);
    const [slide, setSlide] = useState(0);
    const [cardWidth, setCardWidth] = useState(0);
    // Tarjetas visibles según el ancho: 1 en móvil, 2 en tablet, 3 en escritorio.
    // Antes era siempre 3 → en móvil salían apretadas.
    const [perView, setPerView] = useState(3);

    useEffect(() => {
        const measure = () => {
            if (!carouselRef.current) return;
            const gap = 32; // gap-8 = 2rem
            const width = carouselRef.current.offsetWidth;
            const pv = width < 640 ? 1 : width < 1024 ? 2 : 3;
            setPerView(pv);
            setCardWidth((width - (pv - 1) * gap) / pv);
            setSlide((s) =>
                Math.min(s, Math.max(0, all_associates.length - pv)),
            );
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [all_associates.length]);

    const totalSlides = all_associates.length;
    const maxSlide = Math.max(0, totalSlides - perView);
    const slideOffset = slide * (cardWidth + 32);

    return (
        <PublicLayout>
            <Head title="Bienvenido" />

            <HeroGallery items={sliders} />

            {/* Featured Companies Section */}
            <section className="overflow-hidden border-b border-slate-100 bg-white py-16 md:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
                    <div className="mb-12 text-center duration-700 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="mb-6 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                            Empresas destacadas
                        </h2>
                        <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-red-500"></div>
                        <p className="mb-10 text-lg font-medium text-slate-500">
                            Conoce las empresas que hacen parte de Camep
                        </p>
                        <div className="flex justify-center">
                            <Link href={route('companies.index')}>
                                <Button className="group/all h-14 gap-3 rounded-xl bg-slate-900 px-8 text-white shadow-2xl transition-all duration-500 hover:bg-orange-500 hover:shadow-orange-500/20">
                                    <span className="text-sm font-bold uppercase tracking-[0.2em]">
                                        Ver todas las empresas
                                    </span>
                                    <ArrowRight
                                        size={18}
                                        className="transition-transform group-hover/all:translate-x-1"
                                    />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        {/* Track */}
                        <div ref={carouselRef} className="overflow-hidden">
                            <div
                                className="flex gap-8 transition-transform duration-500 ease-in-out"
                                style={{
                                    transform: `translateX(-${slideOffset}px)`,
                                }}
                            >
                                {all_associates.map((assoc, i) => (
                                    <div
                                        key={assoc.id}
                                        className="shrink-0"
                                        style={{
                                            width:
                                                cardWidth > 0
                                                    ? `${cardWidth}px`
                                                    : 'calc(33.333% - 1.333rem)',
                                        }}
                                    >
                                        <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
                                            {/* Cover */}
                                            <div className="relative h-48 w-full overflow-hidden">
                                                {assoc.cover ? (
                                                    <img
                                                        src={assoc.cover}
                                                        alt={assoc.name}
                                                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div
                                                        className={cn(
                                                            'flex h-full w-full items-center justify-center opacity-20',
                                                            [
                                                                'bg-slate-200',
                                                                'bg-orange-50',
                                                                'bg-slate-100',
                                                                'bg-amber-50',
                                                            ][i % 4],
                                                        )}
                                                    >
                                                        <ImageIcon size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                            </div>

                                            {/* Overlapping Logo */}
                                            <div className="absolute left-8 top-[52%] z-30 -translate-y-1/2 pb-16">
                                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-500 via-orange-600 to-green-600 p-[3px] shadow-2xl transition-all duration-500 group-hover:-rotate-3 group-hover:scale-110">
                                                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                                                        {assoc.logo ? (
                                                            <img
                                                                src={assoc.logo}
                                                                alt={assoc.name}
                                                                className="h-full w-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div
                                                                className={cn(
                                                                    'flex h-full w-full items-center justify-center rounded-full text-2xl font-black text-white',
                                                                    [
                                                                        'bg-orange-500',
                                                                        'bg-amber-400',
                                                                        'bg-green-600',
                                                                        'bg-slate-400',
                                                                        'bg-yellow-500',
                                                                        'bg-teal-600',
                                                                    ][i % 6],
                                                                )}
                                                            >
                                                                {assoc.name.substring(
                                                                    0,
                                                                    1,
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-1 flex-col items-start bg-gradient-to-b from-white to-slate-50/30 px-8 pb-8 pt-10 text-left">
                                                <div
                                                    className={cn(
                                                        'mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1',
                                                        assoc.is_verified
                                                            ? 'border-emerald-100/50 bg-emerald-50 text-emerald-600'
                                                            : 'border-slate-200 bg-slate-100 text-slate-400',
                                                    )}
                                                >
                                                    <ShieldCheck
                                                        size={12}
                                                        className={cn(
                                                            assoc.is_verified
                                                                ? 'fill-emerald-600/10'
                                                                : 'opacity-40',
                                                        )}
                                                    />
                                                    <span className="text-[9px] font-black uppercase tracking-wider">
                                                        {assoc.is_verified
                                                            ? 'Empresa Verificada'
                                                            : 'Empresa No Verificada'}
                                                    </span>
                                                </div>
                                                <h3 className="line-clamp-2 min-h-[3.5rem] text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-orange-600">
                                                    {assoc.name}
                                                </h3>
                                                <Link
                                                    href={route(
                                                        'companies.show',
                                                        assoc.id,
                                                    )}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        className="h-10 gap-3 rounded-xl bg-slate-900 px-6 text-white shadow-lg shadow-slate-900/10 transition-all duration-500 hover:bg-orange-500 hover:text-white"
                                                    >
                                                        <span className="text-xs font-bold uppercase tracking-[0.2em]">
                                                            Ver empresa
                                                        </span>
                                                        <ArrowRight size={14} />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Controls */}
                        {totalSlides > perView && (
                            <div className="mt-10 flex items-center justify-center gap-4">
                                <button
                                    onClick={() =>
                                        setSlide((s) => Math.max(0, s - 1))
                                    }
                                    disabled={slide === 0}
                                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: maxSlide + 1 }).map(
                                        (_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSlide(i)}
                                                className={cn(
                                                    'rounded-full transition-all duration-300',
                                                    i === slide
                                                        ? 'h-2.5 w-6 bg-orange-500'
                                                        : 'h-2.5 w-2.5 bg-slate-200 hover:bg-slate-300',
                                                )}
                                            />
                                        ),
                                    )}
                                </div>

                                <button
                                    onClick={() =>
                                        setSlide((s) =>
                                            Math.min(maxSlide, s + 1),
                                        )
                                    }
                                    disabled={slide === maxSlide}
                                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Services categories section */}
            <section className="relative overflow-hidden bg-slate-50 py-16 md:py-20">
                {/* Decorative background elements */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50"></div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
                    <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
                                Categorias de servicios: <br />
                                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                    que ofrece CAMEP
                                </span>
                            </h2>
                        </div>
                        <div className="hidden pb-2 md:block">
                            <div className="h-1.5 w-20 rounded-full bg-orange-500"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[...service_categories]
                            .sort(
                                (a, b) =>
                                    (b.services_count ?? 0) -
                                    (a.services_count ?? 0),
                            )
                            .slice(0, 8)
                            .map((category) => {
                                const getIcon = (slug: string) => {
                                    const s = slug.toLowerCase();
                                    if (s.includes('transporte')) return Truck;
                                    if (s.includes('salud')) return HeartPulse;
                                    if (s.includes('senalizacion'))
                                        return AlertTriangle;
                                    if (s.includes('soldadura')) return Hammer;
                                    if (s.includes('ingenieria'))
                                        return Settings;
                                    if (s.includes('papeleria'))
                                        return ClipboardList;
                                    if (
                                        s.includes('reforestacion') ||
                                        s.includes('ambiental')
                                    )
                                        return Leaf;
                                    if (s.includes('mantenimiento'))
                                        return Wrench;
                                    if (s.includes('construccion'))
                                        return HardHat;
                                    if (
                                        s.includes('educacion') ||
                                        s.includes('capacitacion')
                                    )
                                        return BookOpen;
                                    if (s.includes('tecnologia'))
                                        return Network;
                                    return Briefcase;
                                };
                                const Icon = getIcon(category.slug);

                                return (
                                    <Link
                                        key={category.id}
                                        href={route(
                                            'categories.show',
                                            category.slug,
                                        )}
                                        className="group relative flex flex-col items-start gap-6 rounded-xl border border-slate-100 bg-white p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-500 hover:border-orange-100 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]"
                                    >
                                        <div className="relative">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all duration-500 group-hover:bg-orange-50 group-hover:text-orange-600">
                                                <Icon
                                                    size={32}
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                            {category.services_count > 0 && (
                                                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 text-[10px] font-bold text-white shadow-lg duration-500 animate-in zoom-in">
                                                    {category.services_count}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-base font-bold leading-tight text-slate-900 transition-colors duration-300 group-hover:text-orange-600">
                                                {category.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 opacity-60 transition-all duration-300 group-hover:opacity-100">
                                                Ver categoría
                                                <ChevronRight
                                                    size={12}
                                                    className="transition-transform group-hover:translate-x-1"
                                                />
                                            </div>
                                        </div>

                                        {/* Hover decoration */}
                                        <div className="absolute bottom-4 right-4 flex h-8 w-8 scale-50 items-center justify-center rounded-full bg-slate-50 text-slate-300 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                                            <ArrowRight size={14} />
                                        </div>
                                    </Link>
                                );
                            })}
                    </div>

                    <div className="mt-12 flex flex-col items-center gap-6">
                        <Link href={route('companies.index')}>
                            <Button className="flex h-14 w-full items-center gap-3 rounded-xl bg-slate-900 px-10 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/10 transition-all duration-500 hover:bg-orange-500 sm:w-auto">
                                Ver todas las empresas
                                <ArrowRight size={18} />
                            </Button>
                        </Link>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Más de {service_categories.length} categorías
                            especializadas
                        </p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="bg-white py-16 md:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
                    <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
                        <div className="duration-1000 animate-in fade-in slide-in-from-left-8">
                            <h1 className="mb-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:mb-8 md:text-5xl">
                                Fortalece tu negocio con el respaldo de una{' '}
                                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                                    comunidad que crece contigo
                                </span>
                            </h1>
                            <p className="mb-10 max-w-xl text-lg leading-[1.1] text-slate-500">
                                <span className="mb-2 block font-bold text-slate-900">
                                    Cámara Empresarial de Puerto Gaitán
                                </span>
                                En Camep nos dedicamos activamente a promover el
                                desarrollo económico y social, no solo a través
                                del fortalecimiento individual de cada empresa,
                                sino también impulsando una colaboración
                                estratégica y un diálogo abierto y constructivo
                                que beneficie a toda la comunidad.
                            </p>
                            <div className="flex flex-col items-center gap-4 sm:flex-row">
                                <Link href={route('register')}>
                                    <Button className="group relative w-full overflow-hidden rounded-xl bg-slate-900 px-8 py-6 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-orange-500 sm:w-auto">
                                        <span className="relative z-10 flex items-center gap-3">
                                            Solicitar Afiliación
                                            <ArrowRight
                                                size={20}
                                                className="transition-transform group-hover:translate-x-1"
                                            />
                                        </span>
                                    </Button>
                                </Link>
                                <div className="flex -space-x-3">
                                    {associates.map((assoc, i) => (
                                        <div
                                            key={assoc.id}
                                            className={cn(
                                                'flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110',
                                                !assoc.logo &&
                                                    [
                                                        'bg-orange-500',
                                                        'bg-amber-400',
                                                        'bg-green-600',
                                                        'bg-slate-400',
                                                        'bg-yellow-500',
                                                        'bg-teal-600',
                                                    ][i % 6],
                                            )}
                                            title={assoc.name}
                                        >
                                            {assoc.logo ? (
                                                <img
                                                    src={assoc.logo}
                                                    alt={assoc.name}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase text-white">
                                                    {assoc.name.substring(0, 2)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {associates_count > associates.length && (
                                        <div className="z-10 flex h-10 w-12 items-center justify-center rounded-xl border-2 border-white bg-slate-900 text-[10px] font-bold text-white shadow-sm transition-transform hover:scale-110">
                                            +
                                            {associates_count -
                                                associates.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="relative delay-300 duration-1000 animate-in fade-in zoom-in">
                            {/* YouTube Video Embed */}
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                                <iframe
                                    className="h-full w-full"
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
            <section className="overflow-hidden border-t border-slate-100 bg-slate-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-black tracking-tight text-orange-600 md:text-4xl">
                            Empresas Afiliadas
                        </h2>
                        <div className="mx-auto h-1.5 w-20 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500"></div>
                    </div>

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                            {all_associates.map((assoc, i) => (
                                <Link
                                    key={assoc.id}
                                    href={route('companies.show', assoc.id)}
                                    className="group flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-1"
                                    title={assoc.name}
                                >
                                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-md transition-all duration-300 group-hover:border-orange-100 group-hover:shadow-xl">
                                        {assoc.logo ? (
                                            <img
                                                src={assoc.logo}
                                                alt={assoc.name}
                                                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div
                                                className={cn(
                                                    'flex h-full w-full items-center justify-center rounded-full text-xl font-black text-white',
                                                    [
                                                        'bg-orange-500',
                                                        'bg-amber-400',
                                                        'bg-green-600',
                                                        'bg-slate-400',
                                                        'bg-yellow-500',
                                                        'bg-teal-600',
                                                    ][i % 6],
                                                )}
                                            >
                                                {assoc.name
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="line-clamp-2 max-w-[80px] text-center text-[11px] font-bold leading-tight text-slate-500 transition-colors group-hover:text-orange-500">
                                        {assoc.name}
                                    </span>
                                </Link>
                            ))}
                            {all_associates.length === 0 && (
                                <div className="font-medium italic text-slate-400">
                                    Se parte de nuestro ecosistema empresarial
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Portafolio empresarial (flipbook tipo revista) */}
            <PortfolioFlipbook />

            {/* Announcements Section */}
            {latest_announcements && latest_announcements.length > 0 && (
                <section className="relative overflow-hidden border-t border-slate-100 bg-white py-20 md:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
                        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl font-black uppercase leading-tight tracking-tight text-slate-900 md:text-5xl">
                                    Anuncios <br />
                                    <span className="text-orange-500">
                                        y Licitaciones
                                    </span>
                                </h2>
                            </div>
                            <Link href={route('announcements.index')}>
                                <Button
                                    variant="outline"
                                    className="flex h-14 items-center gap-2 rounded-xl border-slate-200 px-8 text-xs font-black uppercase tracking-widest transition-all duration-500 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                                >
                                    Ver todas las convocatorias{' '}
                                    <ArrowRight size={18} />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {latest_announcements.map((item) => (
                                <Link
                                    key={item.id}
                                    href={route(
                                        'announcements.show',
                                        item.slug,
                                    )}
                                    className="group overflow-hidden rounded-xl border border-slate-100 bg-slate-50 transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-2xl"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        {item.cover_url ? (
                                            <img
                                                src={item.cover_url}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
                                                <Megaphone
                                                    size={48}
                                                    strokeWidth={1}
                                                />
                                            </div>
                                        )}
                                        <div className="absolute left-4 top-4">
                                            <div className="rounded-lg bg-white/90 px-3 py-1 shadow-sm backdrop-blur-sm">
                                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                                                    <Calendar
                                                        size={12}
                                                        className="text-orange-500"
                                                    />
                                                    {item.published_at}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="mb-3 line-clamp-2 h-10 text-sm font-black uppercase tracking-tight text-slate-900 transition-colors group-hover:text-orange-600">
                                            {item.title}
                                        </h3>
                                        <p className="mb-4 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">
                                            {item.excerpt ||
                                                'Consulte los detalles oficiales de esta publicación.'}
                                        </p>
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-orange-600">
                                            Leer detalles{' '}
                                            <ArrowRight size={12} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    {/* Decorative Background */}
                    <div className="absolute left-0 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-100/20 blur-[80px]" />
                </section>
            )}

            {/* Benefits Section */}
            <section className="relative overflow-hidden bg-white py-16 md:py-24">
                {/* Abstract background elements */}
                <div className="absolute right-0 top-0 -mr-64 -mt-32 h-[500px] w-[500px] rounded-full bg-orange-50/50 blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 -mb-32 -ml-64 h-[500px] w-[500px] rounded-full bg-green-50/50 blur-[100px]"></div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <h2 className="mb-6 flex items-center justify-center gap-3 text-[12px] font-black uppercase tracking-[0.3em] text-green-600">
                            <div className="h-px w-8 bg-green-200" />
                            Crecimiento y Respaldo
                            <div className="h-px w-8 bg-green-200" />
                        </h2>
                        <h3 className="mb-8 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                            CONOCE NUESTROS{' '}
                            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                                BENEFICIOS
                            </span>{' '}
                            Y AFÍLIATE
                        </h3>
                        <p className="text-justify text-lg leading-[1.1] text-slate-500">
                            Únete a nuestra comunidad empresarial y hagamos de
                            esta una oportunidad de crecimiento para todos. Ser
                            aliado estratégico, generando opinión,
                            relacionamiento, visibilidad, coadyuvando en la toma
                            de decisiones, representatividad, garantizando la
                            vocería de sus afiliados.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                num: '1',
                                title: 'Representación Influyente',
                                desc: 'Tu voz se une a una fuerza gremial que influye directamente en entidades gubernamentales y operadoras de hidrocarburos.',
                                icon: Users,
                                color: 'orange',
                            },
                            {
                                num: '2',
                                title: 'Acceso a Oportunidades',
                                desc: 'Te conectamos con los planes y programas de las grandes empresas del sector, de manera prioritaria.',
                                icon: Zap,
                                color: 'amber',
                            },
                            {
                                num: '3',
                                title: 'Difusión y Visibilidad',
                                desc: 'Presencia destacada en el Directorio Empresarial, revista anual de CAMEP, y en todos los contenidos multimedia (vídeos, infografías, entrevistas).',
                                icon: Eye,
                                color: 'yellow',
                            },
                            {
                                num: '4',
                                title: 'Capacitación de Alto Nivel',
                                desc: 'Accede a mesas de trabajo y jornadas técnicas sobre costos, modelos de abastecimiento y plataformas de contratación.',
                                icon: BookOpen,
                                color: 'emerald',
                            },
                            {
                                num: '5',
                                title: 'Networking Estratégico',
                                desc: 'Conéctate con una red de empresarios locales y gremios nacionales para generar alianzas y proyectos conjuntos.',
                                icon: Network,
                                color: 'green',
                            },
                            {
                                num: '6',
                                title: 'Defensa Gremial',
                                desc: 'Protegemos tus derechos y buscamos soluciones efectivas en casos de incumplimiento por parte de terceros.',
                                icon: ShieldCheck,
                                color: 'slate',
                            },
                        ].map((benefit, idx) => (
                            <div
                                key={idx}
                                className="group relative flex flex-col items-start overflow-hidden rounded-xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:border-orange-100 hover:shadow-xl"
                            >
                                {/* Big background number */}
                                <div className="pointer-events-none absolute -bottom-12 right-2 select-none text-[200px] font-black italic leading-none text-slate-100 transition-colors group-hover:text-orange-100">
                                    {benefit.num}
                                </div>

                                <div
                                    className={cn(
                                        'mb-6 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:rotate-3 group-hover:scale-110',
                                        {
                                            'bg-orange-100 text-orange-600':
                                                benefit.color === 'orange',
                                            'bg-amber-100 text-amber-600':
                                                benefit.color === 'amber',
                                            'bg-yellow-100 text-yellow-600':
                                                benefit.color === 'yellow',
                                            'bg-emerald-100 text-emerald-600':
                                                benefit.color === 'emerald',
                                            'bg-green-100 text-green-600':
                                                benefit.color === 'green',
                                            'bg-slate-100 text-slate-600':
                                                benefit.color === 'slate',
                                        },
                                    )}
                                >
                                    <benefit.icon size={28} />
                                </div>

                                <h4 className="mb-4 text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-orange-600">
                                    {benefit.title}
                                </h4>
                                <p className="relative z-10 text-sm font-medium leading-relaxed text-slate-500">
                                    {benefit.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center duration-1000 animate-in fade-in slide-in-from-bottom-8">
                        <Link href={route('register')}>
                            <Button className="group relative w-full overflow-hidden rounded-xl bg-slate-900 px-8 py-6 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-orange-500 sm:w-auto">
                                <span className="relative z-10 flex items-center gap-3">
                                    Quiero ser parte de CAMEP
                                    <ArrowRight
                                        size={20}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            {latest_posts && latest_posts.length > 0 && (
                <section className="relative overflow-hidden border-t border-slate-100 bg-slate-50 py-20">
                    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
                        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
                            <div className="max-w-2xl text-left">
                                <h2 className="text-3xl font-black uppercase leading-tight tracking-tight text-slate-900 md:text-4xl">
                                    Últimas <br />
                                    <span className="text-orange-500">
                                        Noticias y Blog
                                    </span>
                                </h2>
                            </div>
                            <Link href={route('blog.index')}>
                                <Button
                                    variant="ghost"
                                    className="flex h-14 items-center gap-2 rounded-xl border-slate-200 px-8 text-xs font-black uppercase tracking-widest text-slate-600 transition-all duration-500 hover:bg-orange-500 hover:text-white"
                                >
                                    Ir al blog completo <ArrowRight size={18} />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {latest_posts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={route('blog.show', post.slug)}
                                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white transition-all duration-500 hover:border-orange-100 hover:shadow-xl"
                                >
                                    <div className="relative aspect-[16/9] overflow-hidden">
                                        {post.cover_url ? (
                                            <img
                                                src={post.cover_url}
                                                alt={post.title}
                                                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
                                                <BookOpen
                                                    size={48}
                                                    strokeWidth={1}
                                                />
                                            </div>
                                        )}
                                        <div className="absolute left-4 top-4">
                                            <div className="rounded-lg border border-slate-100 bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm backdrop-blur-sm transition-all group-hover:border-orange-600 group-hover:bg-orange-600 group-hover:text-white">
                                                {post.category}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors group-hover:text-orange-600">
                                            <Calendar size={14} />
                                            {post.published_at}
                                        </div>
                                        <h3 className="mb-4 line-clamp-2 text-lg font-bold uppercase leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-orange-600">
                                            {post.title}
                                        </h3>
                                        <p className="mb-6 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500 transition-colors">
                                            {post.excerpt ||
                                                'Lea nuestra última publicación sobre el sector empresarial de Puerto Gaitán.'}
                                        </p>
                                        <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 transition-transform group-hover:translate-x-1">
                                            Continuar leyendo{' '}
                                            <ArrowRight size={14} />
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
