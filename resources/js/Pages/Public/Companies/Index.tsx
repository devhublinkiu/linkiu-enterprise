import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import HeroGallery from '@/Components/HeroGallery';
import { Button } from '@/Components/ui/Button';
import {
    Search,
    Filter,
    Building2,
    ChevronRight,
    ChevronDown,
    Facebook,
    Instagram,
    Globe,
    Phone,
    ShieldCheck,
    Tag,
    X,
    SearchX
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface Props {
    associates: Associate[];
    categories: Array<{ id: number; name: string }>;
    services: Array<{ id: number; name: string; category_id: number }>;
    sliders: any[];
    filters: {
        search?: string;
        category_id?: string;
        service_id?: string;
    };
}

export default function Index({ associates, categories, services, sliders, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [serviceId, setServiceId] = useState(filters.service_id || '');

    const filteredServices = useMemo(() => {
        if (!categoryId) return services;
        return services.filter(s => s.category_id === parseInt(categoryId));
    }, [categoryId, services]);

    const handleSearch = () => {
        router.get(route('companies.index'), {
            search,
            category_id: categoryId,
            service_id: serviceId
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryId('');
        setServiceId('');
        router.get(route('companies.index'), {}, { replace: true });
    };

    // Auto-search when filters change (debounced for text, immediate for selects)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) handleSearch();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (categoryId !== (filters.category_id || '') || serviceId !== (filters.service_id || '')) {
            handleSearch();
        }
    }, [categoryId, serviceId]);

    return (
        <PublicLayout>
            <Head title="Directorio de Empresas" />

            <HeroGallery items={sliders} />

            <section className="py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                                Directorio de Empresas
                            </h1>
                            <p className="text-lg text-slate-500 font-medium">
                                Explora nuestra red de asociados confiables y profesionales.
                            </p>
                        </div>
                    </div>

                    {/* Search and Filters Bar */}
                    <div className="bg-white rounded-xl p-8 mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                            {/* Search Input */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Buscar por empresa</label>
                                <div className="flex items-center h-14 bg-slate-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-50/50 transition-all group">
                                    <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <Search size={20} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Nombre..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-300 h-full w-full"
                                    />
                                </div>
                            </div>

                            {/* Category Selector */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Categoría</label>
                                <div className="flex items-center h-14 bg-slate-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-50/50 transition-all group relative">
                                    <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <Filter size={20} strokeWidth={2.5} />
                                    </div>
                                    <select
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 appearance-none h-full w-full pr-10 cursor-pointer !bg-none"
                                        value={categoryId}
                                        onChange={(e) => {
                                            setCategoryId(e.target.value);
                                            setServiceId('');
                                        }}
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 pointer-events-none text-slate-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Service Selector */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Servicio</label>
                                <div className="flex items-center h-14 bg-slate-50 rounded-xl border border-transparent focus-within:bg-white focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-50/50 transition-all group relative">
                                    <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                                        <Tag size={20} strokeWidth={2.5} />
                                    </div>
                                    <select
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 appearance-none h-full w-full pr-10 disabled:opacity-50 cursor-pointer !bg-none"
                                        value={serviceId}
                                        onChange={(e) => setServiceId(e.target.value)}
                                        disabled={!categoryId}
                                    >
                                        <option value="">{categoryId ? 'Todos los servicios' : 'Selecciona categoría'}</option>
                                        {filteredServices.map(ser => (
                                            <option key={ser.id} value={ser.id}>{ser.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 pointer-events-none text-slate-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Clear Filters Button */}
                            <div className="flex h-14">
                                <Button
                                    onClick={clearFilters}
                                    variant="ghost"
                                    className="w-full h-full rounded-xl hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all gap-3 font-bold text-sm"
                                >
                                    <X size={18} />
                                    Limpiar Filtros
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Companies Grid */}
                    {associates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {associates.map((assoc, i) => (
                                <div
                                    key={assoc.id}
                                    className="group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 duration-700"
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

                                    {/* Logo Overlay - Moved outside overflow-hidden to stay on top */}
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
                        <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200 shadow-sm animate-in fade-in duration-700">
                            <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                                <SearchX size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">No encontramos empresas</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">
                                Intenta ajustar tus filtros de búsqueda o categoría para encontrar lo que buscas.
                            </p>
                            <Button
                                onClick={clearFilters}
                                className="bg-orange-500 hover:bg-slate-900 rounded-xl h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-orange-500/20"
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
