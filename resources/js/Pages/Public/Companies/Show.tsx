import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/Button';
import {
    Building2,
    Globe,
    Facebook,
    Instagram,
    Linkedin,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Briefcase,
    User,
    ArrowLeft,
    ArrowRight,
    X,
    Tag,
    Image as ImageIcon,
    Maximize2,
    ExternalLink,
    Clock,
    ShieldCheck,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyProps {
    company: {
        id: number;
        name: string;
        nit: string;
        description: string;
        logo: string | null;
        cover: string | null;
        gallery: string[];
        is_verified: boolean;
        website: string | null;
        phone: string | null;
        facebook: string | null;
        instagram: string | null;
        linkedin: string | null;
        billing_email: string | null;
        address: string | null;
        department: string | null;
        city: string | null;
        rep_name: string | null;
        constitution_date: string | null;
        main_ciiu: string | null;
        company_type: string[] | string | null;
        categories: {
            id: number;
            name: string;
            services: string[];
        }[];
    }
}

export default function Show({ company }: CompanyProps) {
    const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeImageIndex === null) return;
        setActiveImageIndex((activeImageIndex + 1) % company.gallery.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeImageIndex === null) return;
        setActiveImageIndex((activeImageIndex - 1 + company.gallery.length) % company.gallery.length);
    };

    const displayType = Array.isArray(company.company_type)
        ? company.company_type.join(', ')
        : company.company_type;

    return (
        <PublicLayout>
            <Head title={`${company.name} | Directorio`} />

            <main className="pt-20 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Minimal Navigation */}
                    <div className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-500">
                        <Link href={route('companies.index')} className="hover:text-orange-600 transition-colors">Directorio</Link>
                        <ChevronRight size={14} />
                        <span className="text-slate-900 truncate">{company.name}</span>
                    </div>

                    {/* Hero Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                        {/* Cover Image */}
                        <div className="h-64 md:h-80 w-full relative group">
                            {company.cover ? (
                                <img src={company.cover} alt={company.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                    <Building2 size={64} className="text-slate-200" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                            <div className="absolute bottom-6 right-6 flex items-center gap-3">
                                {company.is_verified && (
                                    <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg border border-emerald-400">
                                        <ShieldCheck size={14} />
                                        Verificada
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Header */}
                        <div className="p-8 md:px-12 md:pb-12 relative">
                            {/* Logo Overlap - Round with Border (Card Style) */}
                            <div className="absolute -top-16 left-8 md:left-12">
                                <div className="p-1 h-28 w-28 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-red-500 via-orange-600 to-green-600 shadow-xl">
                                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden border border-slate-50">
                                        {company.logo ? (
                                            <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-4xl font-black text-orange-500">{company.name.charAt(0)}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 md:mt-0 md:pl-40 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        NIT: {company.nit}
                                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                        {company.city}, {company.department}
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                        {company.name}
                                    </h1>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {company.website && (
                                        <a href={company.website} target="_blank">
                                            <Button variant="outline" className="rounded-xl font-bold flex gap-2 border-slate-200">
                                                <Globe size={16} />
                                                Sitio Web
                                                <ExternalLink size={14} className="opacity-40" />
                                            </Button>
                                        </a>
                                    )}
                                    <div className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">
                                        Empresa vinculada
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Non-Intrusive Gallery - Precision 1+4 Grid (Pixel-Perfect Reference Match) */}
                    {company.gallery && company.gallery.length > 0 && (
                        <section className="mb-12 relative group/gallery overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 h-[450px] lg:h-[550px]">
                                {/* 1. Large Main Photo (Left Half) */}
                                <div className="col-span-1 lg:col-span-2 row-span-1 lg:row-span-2 cursor-pointer overflow-hidden border-r lg:border-r-0 border-slate-100" onClick={() => setActiveImageIndex(0)}>
                                    <img src={company.gallery[0]} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Gallery highlight" />
                                </div>
                                
                                {/* 2. Second Photo (Top Mid-Right) */}
                                <div className="col-span-1 row-span-1 cursor-pointer overflow-hidden" onClick={() => setActiveImageIndex(1 % company.gallery.length)}>
                                    {company.gallery[1] ? (
                                        <img src={company.gallery[1]} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Gallery detail 2" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200"><Building2 /></div>
                                    )}
                                </div>

                                {/* 3. Third Photo (Top Far-Right) - Desktop Only */}
                                <div className="hidden lg:block lg:col-span-1 lg:row-span-1 cursor-pointer overflow-hidden" onClick={() => setActiveImageIndex(2 % company.gallery.length)}>
                                    {company.gallery[2] ? (
                                        <img src={company.gallery[2]} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Gallery detail 3" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50" />
                                    )}
                                </div>

                                {/* 4. Fourth Photo (Bottom Left on Mobile, Bottom Mid on Desktop) */}
                                <div className="col-span-1 lg:col-span-1 row-span-1 lg:row-span-1 cursor-pointer overflow-hidden" onClick={() => setActiveImageIndex(3 % company.gallery.length)}>
                                    {company.gallery[3] ? (
                                        <img src={company.gallery[3]} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Gallery detail 4" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50" />
                                    )}
                                </div>

                                {/* 5. Fifth Photo (Bottom Far-Right) - Desktop Only */}
                                <div className="hidden lg:block lg:col-span-1 lg:row-span-1 cursor-pointer overflow-hidden" onClick={() => setActiveImageIndex(4 % company.gallery.length)}>
                                    {company.gallery[4] ? (
                                        <img src={company.gallery[4]} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Gallery detail 5" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50" />
                                    )}
                                </div>
                            </div>

                            {/* Floating "Mostrar todas las fotos" Pill Action - Exact style match */}
                            <button 
                                onClick={() => setActiveImageIndex(0)}
                                className="absolute bottom-6 right-6 bg-white hover:bg-slate-50 text-slate-800 px-5 py-2.5 rounded-xl shadow-2xl border border-slate-200 flex items-center gap-2.5 transition-all active:scale-95 group z-10"
                            >
                                <LayoutGrid size={18} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                                <span className="text-sm font-black tracking-tight">Mostrar todas las fotos ({company.gallery.length})</span>
                            </button>
                        </section>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Column 1: Main Data */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Description */}
                            <section className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-slate-200">
                                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="h-6 w-1 rounded-full bg-orange-500"></div>
                                    Sobre la empresa
                                </h2>
                                <p className="text-slate-600 font-medium leading-relaxed text-lg whitespace-pre-wrap">
                                    {company.description}
                                </p>
                            </section>

                            {/* Services List Grouped */}
                            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                                <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <div className="h-6 w-1 rounded-full bg-orange-500"></div>
                                    Servicios y Portafolio
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {company.categories.map(cat => (
                                        <div key={cat.id} className="p-6 rounded-xl border border-slate-100 bg-slate-50/30">
                                            <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Tag size={12} strokeWidth={3} />
                                                {cat.name}
                                            </h3>
                                            <div className="space-y-3">
                                                {cat.services.map((service, i) => (
                                                    <div key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                                                        {service}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar: Details */}
                        <div className="space-y-8">
                            {/* Contact Card - Unified Design with Legal Details */}
                            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                                <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                                    <div className="h-5 w-1 rounded-full bg-orange-500"></div>
                                    Información de Contacto
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Teléfono Público</div>
                                        <div className="font-bold text-slate-700 flex items-center gap-2">
                                            <Phone size={14} className="text-slate-400" />
                                            {company.phone || 'No disponible'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correo Electrónico</div>
                                        <div className="font-bold text-slate-700 flex items-center gap-2">
                                            <Mail size={14} className="text-slate-400" />
                                            <span className="break-all">{company.billing_email || 'No disponible'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ubicación</div>
                                        <div className="font-bold text-slate-700 flex items-center gap-3 italic">
                                            <MapPin size={14} className="text-slate-400 shrink-0" />
                                            <span>{company.address || 'Sin dirección registrada'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-2">
                                    {company.facebook && (
                                        <a href={company.facebook} target="_blank" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1877F2] hover:bg-white hover:shadow-md transition-all border border-slate-100">
                                            <Facebook size={18} />
                                        </a>
                                    )}
                                    {company.instagram && (
                                        <a href={company.instagram} target="_blank" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#E4405F] hover:bg-white hover:shadow-md transition-all border border-slate-100">
                                            <Instagram size={18} />
                                        </a>
                                    )}
                                    {company.linkedin && (
                                        <a href={company.linkedin} target="_blank" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#0A66C2] hover:bg-white hover:shadow-md transition-all border border-slate-100">
                                            <Linkedin size={18} />
                                        </a>
                                    )}
                                </div>
                            </section>

                            {/* Business Details */}
                            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                                <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                                    <div className="h-5 w-1 rounded-full bg-orange-500"></div>
                                    Datos Legales
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Representante Legal</div>
                                        <div className="font-bold text-slate-700 flex items-center gap-2">
                                            <User size={14} className="text-slate-400" />
                                            {company.rep_name || 'No especificado'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actividad Económica (CIIU)</div>
                                        <div className="font-bold text-slate-700 flex items-center gap-2">
                                            <Briefcase size={14} className="text-slate-400" />
                                            {company.main_ciiu || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Constitución</div>
                                        <div className="font-bold text-slate-700 flex items-center gap-2">
                                            <Clock size={14} className="text-slate-400" />
                                            {company.constitution_date || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Entidad</div>
                                        <div className="font-bold text-slate-700 flex items-center gap-2">
                                            <Building2 size={14} className="text-slate-400" />
                                            <span className="capitalize">{displayType || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            {/* Lightbox with Navigation */}
            {activeImageIndex !== null && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 transition-all duration-300" onClick={() => setActiveImageIndex(null)}>
                    {/* Header: Counter & Close */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between text-white z-[110] bg-gradient-to-b from-black/50 to-transparent">
                        <div className="font-bold text-lg opacity-80 backdrop-blur-sm bg-black/20 px-4 py-1.5 rounded-full">
                            {activeImageIndex + 1} / {company.gallery.length}
                        </div>
                        <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm" onClick={() => setActiveImageIndex(null)}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation Buttons */}
                    <button 
                        className="absolute left-4 md:left-8 p-4 md:p-6 bg-white/5 hover:bg-orange-600 text-white rounded-full transition-all z-[110] active:scale-90 border border-white/5 group"
                        onClick={handlePrev}
                    >
                        <ArrowLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <button 
                        className="absolute right-4 md:right-8 p-4 md:p-6 bg-white/5 hover:bg-orange-600 text-white rounded-full transition-all z-[110] active:scale-90 border border-white/5 group"
                        onClick={handleNext}
                    >
                        <ArrowRight size={32} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Main Image Container */}
                    <div className="relative max-w-full max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        {activeImageIndex !== null && (
                            <img 
                                key={activeImageIndex}
                                src={company.gallery[activeImageIndex]} 
                                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain border border-white/10 animate-in fade-in zoom-in-95 duration-300" 
                                alt={`Gallery image ${activeImageIndex + 1}`}
                            />
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">
                        Usa las flechas para navegar
                    </div>
                </div>
            )}

        </PublicLayout>
    );
}

const ChevronRight = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
);
