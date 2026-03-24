import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { PageProps } from '@/types';
import {
    ArrowLeft,
    ChevronRight,
    Truck,
    HeartPulse,
    AlertTriangle,
    Hammer,
    Settings,
    ClipboardList,
    Leaf,
    Wrench,
    HardHat,
    Briefcase,
    Zap,
    LayoutGrid,
    Building2
} from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/utils';

interface CategoryShowProps extends PageProps {
    category: {
        id: number;
        name: string;
        slug: string;
        services: Array<{
            id: number;
            name: string;
            slug: string;
        }>;
    };
}

export default function CategoryShow({ category }: CategoryShowProps) {
    const { tenant } = usePage<PageProps>().props;

    // Icon logic consistent with the rest of the app
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
        return Briefcase;
    };

    const CategoryIcon = getIcon(category.slug);

    return (
        <PublicLayout>
            <Head title={`Categoría ${category.name}`} />

            {/* Hero Header */}
            <div className="relative bg-white border-b border-slate-100 py-16 md:py-24 overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none">
                    <svg className="h-full w-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
                    <Link
                        href={route('welcome')}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-600 transition-colors mb-8 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Volver al inicio</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full mb-4 border border-orange-100/50">
                                <CategoryIcon size={14} strokeWidth={2.5} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Ecosistema Empresarial</span>
                            </div>
                            <h1 className="text-lg md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                <span className="text-slate-400 block text-base md:text-lg mb-2 font-bold tracking-normal">Explora la categoría:</span>
                                {category.name}
                            </h1>
                        </div>
                        <div className="hidden lg:block">
                            <div className="h-32 w-32 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 rotating-slow">
                                <CategoryIcon size={64} strokeWidth={1} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 md:py-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="max-w-2xl text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">Servicios Especializados</h2>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            Selecciona uno de nuestros servicios especializados dentro de <span className="text-orange-600 font-black">{category.name}</span> para conocer las empresas verificadas que pueden suplir tus necesidades.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.services.map((service, i) => (
                        <Link
                            key={service.id}
                            href={route('services.show', service.slug)}
                            className="group relative bg-white p-10 rounded-xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:border-orange-100 transition-all duration-700 flex flex-col items-start gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="relative">
                                <div className="h-16 w-16 rounded-xl bg-slate-900 flex items-center justify-center text-white group-hover:bg-orange-500 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-slate-900/10 group-hover:shadow-orange-500/20">
                                    <Zap size={28} strokeWidth={2.5} fill="currentColor" className="opacity-20" />
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10 w-full">
                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors duration-300 leading-tight">
                                    {service.name}
                                </h3>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2">
                                    Empresas que ofrecen soluciones profesionales en el área de {service.name.toLowerCase()}.
                                </p>
                            </div>

                            <div className="w-full pt-4 mt-auto">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100/50">
                                        Explorar empresas
                                        <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Empty State */}
                    {category.services.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-6">
                                <Briefcase size={40} strokeWidth={1} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No hay servicios disponibles</h3>
                            <p className="text-slate-500">Estamos trabajando para añadir empresas a esta categoría muy pronto.</p>
                        </div>
                    )}
                </div>
            </main>
        </PublicLayout>
    );
}
