import HeroGallery, { type GalleryItem } from '@/Components/HeroGallery';
import { Button } from '@/Components/ui/Button';
import PublicLayout from '@/Layouts/PublicLayout';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Facebook,
    Filter,
    Globe,
    Instagram,
    Phone,
    Search,
    SearchX,
    Tag,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Associate {
    id: number;
    name: string;
    nit: string | null;
    description: string | null;
    logo: string | null;
    cover: string | null;
    is_verified: boolean;
    website: string | null;
    phone: string | null;
    facebook: string | null;
    instagram: string | null;
    linkedin: string | null;
    categories: Array<{ id: number; name: string; slug: string }>;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

// Ventana de páginas estilo [1, …, 4, 5, 6, …, 12] para no pintar cientos de botones.
function getPageWindow(current: number, last: number): Array<number | '…'> {
    const pages: Array<number | '…'> = [];
    const edge = 1; // páginas visibles a cada lado de la actual
    for (let p = 1; p <= last; p++) {
        if (
            p === 1 ||
            p === last ||
            (p >= current - edge && p <= current + edge)
        ) {
            pages.push(p);
        } else if (pages[pages.length - 1] !== '…') {
            pages.push('…');
        }
    }
    return pages;
}

interface Props {
    associates: Paginator<Associate>;
    categories: Array<{ id: number; name: string }>;
    services: Array<{ id: number; name: string; category_id: number }>;
    sliders: GalleryItem[];
    filters: {
        search?: string;
        category_id?: string;
        service_id?: string;
    };
}

export default function Index({
    associates,
    categories,
    services,
    sliders,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [serviceId, setServiceId] = useState(filters.service_id || '');

    const filteredServices = useMemo(() => {
        if (!categoryId) return services;
        return services.filter((s) => s.category_id === parseInt(categoryId));
    }, [categoryId, services]);

    const handleSearch = () => {
        router.get(
            route('companies.index'),
            {
                search,
                category_id: categoryId,
                service_id: serviceId,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryId('');
        setServiceId('');
        router.get(route('companies.index'), {}, { replace: true });
    };

    // Cambia de página conservando los filtros actuales (withQueryString en el back).
    const goToPage = (page: number) => {
        router.get(
            route('companies.index'),
            { ...filters, page },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    // Auto-search when filters change (debounced for text, immediate for selects)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) handleSearch();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (
            categoryId !== (filters.category_id || '') ||
            serviceId !== (filters.service_id || '')
        ) {
            handleSearch();
        }
    }, [categoryId, serviceId]);

    return (
        <PublicLayout>
            <Head title="Directorio de Empresas" />

            <HeroGallery items={sliders} />

            <section className="py-12 md:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
                    <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                        <div>
                            <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                                Directorio de Empresas
                            </h1>
                            <p className="text-lg font-medium text-slate-500">
                                Explora nuestra red de asociados confiables y
                                profesionales.
                            </p>
                        </div>
                    </div>

                    {/* Search and Filters Bar */}
                    <div className="mb-16 rounded-xl border border-slate-100 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* Search Input */}
                            <div className="space-y-2">
                                <label className="block px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Buscar por empresa
                                </label>
                                <div className="group flex h-14 items-center rounded-xl border border-transparent bg-slate-50 transition-all focus-within:border-orange-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-50/50">
                                    <div className="pl-4 pr-2 text-slate-400 transition-colors group-focus-within:text-orange-500">
                                        <Search size={20} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Nombre..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="h-full w-full flex-1 border-none bg-transparent text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-0"
                                    />
                                </div>
                            </div>

                            {/* Category Selector */}
                            <div className="space-y-2">
                                <label className="block px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Categoría
                                </label>
                                <div className="group relative flex h-14 items-center rounded-xl border border-transparent bg-slate-50 transition-all focus-within:border-orange-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-50/50">
                                    <div className="pl-4 pr-2 text-slate-400 transition-colors group-focus-within:text-orange-500">
                                        <Filter size={20} strokeWidth={2.5} />
                                    </div>
                                    <select
                                        className="h-full w-full flex-1 cursor-pointer appearance-none border-none bg-transparent !bg-none pr-10 text-sm font-bold text-slate-700 focus:ring-0"
                                        value={categoryId}
                                        onChange={(e) => {
                                            setCategoryId(e.target.value);
                                            setServiceId('');
                                        }}
                                    >
                                        <option value="">
                                            Todas las categorías
                                        </option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 text-slate-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Service Selector */}
                            <div className="space-y-2">
                                <label className="block px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Servicio
                                </label>
                                <div className="group relative flex h-14 items-center rounded-xl border border-transparent bg-slate-50 transition-all focus-within:border-orange-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-50/50">
                                    <div className="pl-4 pr-2 text-slate-400 transition-colors group-focus-within:text-orange-500">
                                        <Tag size={20} strokeWidth={2.5} />
                                    </div>
                                    <select
                                        className="h-full w-full flex-1 cursor-pointer appearance-none border-none bg-transparent !bg-none pr-10 text-sm font-bold text-slate-700 focus:ring-0 disabled:opacity-50"
                                        value={serviceId}
                                        onChange={(e) =>
                                            setServiceId(e.target.value)
                                        }
                                        disabled={!categoryId}
                                    >
                                        <option value="">
                                            {categoryId
                                                ? 'Todos los servicios'
                                                : 'Selecciona categoría'}
                                        </option>
                                        {filteredServices.map((ser) => (
                                            <option key={ser.id} value={ser.id}>
                                                {ser.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-4 text-slate-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Clear Filters Button */}
                            <div className="flex h-14">
                                <Button
                                    onClick={clearFilters}
                                    variant="ghost"
                                    className="h-full w-full gap-3 rounded-xl text-sm font-bold text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                                >
                                    <X size={18} />
                                    Limpiar Filtros
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Companies Grid */}
                    {associates.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                                {associates.data.map((assoc, i) => (
                                    <div
                                        key={assoc.id}
                                        className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
                                        style={{
                                            animationDelay: `${i * 50}ms`,
                                        }}
                                    >
                                        {/* Cover Image */}
                                        <div className="relative h-48 w-full overflow-hidden">
                                            {assoc.cover ? (
                                                <img
                                                    src={assoc.cover}
                                                    alt={assoc.name}
                                                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-100 transition-transform duration-1000 group-hover:scale-110">
                                                    <Building2
                                                        size={48}
                                                        className="text-slate-200"
                                                    />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                                            {/* Status Badge */}
                                            <div className="absolute right-6 top-6">
                                                <div
                                                    className={cn(
                                                        'rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm',
                                                        assoc.is_verified
                                                            ? 'border-emerald-400 bg-emerald-500 text-white'
                                                            : 'border-slate-400 bg-slate-500 text-white',
                                                    )}
                                                >
                                                    {assoc.is_verified
                                                        ? 'Verificada'
                                                        : 'Estándar'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Logo Overlay - Moved outside overflow-hidden to stay on top */}
                                        <div className="absolute left-8 top-[192px] z-20 h-20 w-20 -translate-y-[60%] rounded-full bg-gradient-to-br from-red-500 via-orange-600 to-green-600 p-[3px] shadow-2xl transition-all duration-500 group-hover:rotate-3 group-hover:scale-110">
                                            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                                                {assoc.logo ? (
                                                    <img
                                                        src={assoc.logo}
                                                        alt={assoc.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-2xl font-black text-orange-500">
                                                        {assoc.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex h-full flex-1 flex-col px-8 pb-8 pt-12">
                                            <div className="mb-1">
                                                <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    NIT:{' '}
                                                    {assoc.nit || 'En trámite'}
                                                </div>
                                                <h3 className="text-2xl font-black leading-tight text-slate-900 transition-colors group-hover:text-orange-600">
                                                    {assoc.name}
                                                </h3>
                                            </div>

                                            {assoc.description && (
                                                <p className="mb-2 line-clamp-3 text-sm font-medium leading-relaxed text-slate-500">
                                                    {assoc.description}
                                                </p>
                                            )}

                                            {/* Categories Badges */}
                                            <div className="mb-4 mt-auto flex flex-wrap gap-2">
                                                {assoc.categories.map((cat) => (
                                                    <span
                                                        key={cat.id}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-orange-100/50 bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-600"
                                                    >
                                                        <Tag size={10} />
                                                        {cat.name}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Social and Contact row */}
                                            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                                                <div className="flex gap-4">
                                                    {assoc.website && (
                                                        <a
                                                            href={assoc.website}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-xl bg-slate-50 p-2 text-slate-400 transition-all hover:bg-orange-50 hover:text-orange-600"
                                                        >
                                                            <Globe size={18} />
                                                        </a>
                                                    )}
                                                    {assoc.facebook && (
                                                        <a
                                                            href={
                                                                assoc.facebook
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-xl bg-slate-50 p-2 text-slate-400 transition-all hover:bg-orange-50 hover:text-orange-600"
                                                        >
                                                            <Facebook
                                                                size={18}
                                                            />
                                                        </a>
                                                    )}
                                                    {assoc.instagram && (
                                                        <a
                                                            href={
                                                                assoc.instagram
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-xl bg-slate-50 p-2 text-slate-400 transition-all hover:bg-orange-50 hover:text-orange-600"
                                                        >
                                                            <Instagram
                                                                size={18}
                                                            />
                                                        </a>
                                                    )}
                                                    {assoc.phone && (
                                                        <a
                                                            href={`tel:${assoc.phone}`}
                                                            className="rounded-xl bg-slate-50 p-2 text-slate-400 transition-all hover:bg-orange-50 hover:text-orange-600"
                                                        >
                                                            <Phone size={18} />
                                                        </a>
                                                    )}
                                                </div>

                                                <Link
                                                    href={route(
                                                        'companies.show',
                                                        assoc.id,
                                                    )}
                                                >
                                                    <Button
                                                        size="sm"
                                                        className="rounded-xl bg-slate-900 px-5 font-bold transition-all duration-300 hover:bg-orange-500"
                                                    >
                                                        Ver Perfil
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Paginación */}
                            {associates.last_page > 1 && (
                                <nav
                                    className="mt-16 flex flex-col items-center gap-4"
                                    aria-label="Paginación"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() =>
                                                goToPage(
                                                    associates.current_page - 1,
                                                )
                                            }
                                            disabled={
                                                associates.current_page <= 1
                                            }
                                            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-all hover:border-orange-200 hover:text-orange-600 disabled:pointer-events-none disabled:opacity-40"
                                        >
                                            <ChevronLeft size={16} />
                                            Anterior
                                        </button>

                                        {getPageWindow(
                                            associates.current_page,
                                            associates.last_page,
                                        ).map((p, idx) =>
                                            p === '…' ? (
                                                <span
                                                    key={`gap-${idx}`}
                                                    className="inline-flex h-11 w-11 select-none items-center justify-center font-bold text-slate-300"
                                                >
                                                    …
                                                </span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    onClick={() => goToPage(p)}
                                                    aria-current={
                                                        p ===
                                                        associates.current_page
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                    className={cn(
                                                        'inline-flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black transition-all',
                                                        p ===
                                                            associates.current_page
                                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                            : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-orange-600',
                                                    )}
                                                >
                                                    {p}
                                                </button>
                                            ),
                                        )}

                                        <button
                                            onClick={() =>
                                                goToPage(
                                                    associates.current_page + 1,
                                                )
                                            }
                                            disabled={
                                                associates.current_page >=
                                                associates.last_page
                                            }
                                            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-all hover:border-orange-200 hover:text-orange-600 disabled:pointer-events-none disabled:opacity-40"
                                        >
                                            Siguiente
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    {associates.total > 0 && (
                                        <p className="text-xs font-bold text-slate-400">
                                            Mostrando {associates.from}–
                                            {associates.to} de{' '}
                                            {associates.total} empresas
                                        </p>
                                    )}
                                </nav>
                            )}
                        </>
                    ) : (
                        <div className="rounded-[3rem] border border-dashed border-slate-200 bg-white p-20 text-center shadow-sm duration-700 animate-in fade-in">
                            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-200">
                                <SearchX size={48} />
                            </div>
                            <h3 className="mb-4 text-2xl font-black text-slate-900">
                                No encontramos empresas
                            </h3>
                            <p className="mx-auto mb-10 max-w-sm font-medium text-slate-500">
                                Intenta ajustar tus filtros de búsqueda o
                                categoría para encontrar lo que buscas.
                            </p>
                            <Button
                                onClick={clearFilters}
                                className="h-14 rounded-xl bg-orange-500 px-10 font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-slate-900"
                            >
                                Mostrar todas las empresas
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
