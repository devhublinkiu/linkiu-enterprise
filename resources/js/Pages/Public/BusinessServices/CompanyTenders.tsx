import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import {
    Calendar,
    ArrowRight,
    MapPin,
    Briefcase,
    Building2,
    Clock,
    Globe,
    ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Tender {
    id: number;
    titulo: string;
    slug: string;
    extracto: string | null;
    publico_objetivo: 'abierto' | 'exclusivo_asociados';
    estado: 'borrador' | 'publicado' | 'cerrado';
    fecha_publicacion: string | null;
    fecha_cierre: string | null;
    featured_image_url: string | null;
}

interface Company {
    id: number;
    nombre: string;
    slug: string;
    logo_url: string | null;
    departamento: string | null;
    ciudad: string | null;
}

interface Props {
    company: Company;
    tenders: Tender[];
}

export default function CompanyTenders({ company, tenders }: Props) {
    return (
        <PublicLayout>
            <Head title={`Licitaciones - ${company.nombre}`} />

            {/* Company Header */}
            <div className="bg-slate-900 border-b border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 md:py-20 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-40 h-40 bg-white rounded-3xl p-6 shadow-2xl flex items-center justify-center shrink-0"
                        >
                            {company.logo_url ? (
                                <img src={company.logo_url} alt={company.nombre} className="max-w-full max-h-full object-contain" />
                            ) : (
                                <Building2 size={64} className="text-slate-200" />
                            )}
                        </motion.div>

                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full mb-4 border border-green-500/20">
                                    <Building2 size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Empresa Aliada</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                                    {company.nombre}
                                </h1 >
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 font-medium">
                                    {(company.ciudad || company.departamento) && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-green-500" />
                                            <span>{company.ciudad}{company.ciudad && company.departamento ? ', ' : ''}{company.departamento}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={16} className="text-green-500" />
                                        <span>{tenders.length} Convocatorias Vigentes</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="hidden lg:block shrink-0">
                            <Link href={route('bienes-servicios.index')}>
                                <Button variant="outline" className="bg-green-500 text-white hover:bg-green-600 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                                    Volver al Bienes y Servicios
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Tenders Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-24">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl font-black text-slate-900 uppercase border-l-8 border-green-500 pl-6">
                        Licitaciones y Convocatorias
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tenders.map((tender, i) => (
                        <motion.div
                            key={tender.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="h-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 rounded-2xl overflow-hidden bg-white group">
                                <Link href={route('bienes-servicios.tender', [company.slug, tender.slug])}>
                                    <div className="aspect-[16/9] overflow-hidden relative bg-slate-100">
                                        {tender.featured_image_url ? (
                                            <img
                                                src={tender.featured_image_url}
                                                alt={tender.titulo}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <Briefcase size={48} strokeWidth={1} />
                                            </div>
                                        )}
                                        {/* Target Audience Badge */}
                                        <div className="absolute top-4 right-4">
                                            {tender.publico_objetivo === 'exclusivo_asociados' ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                    <ShieldAlert size={12} />
                                                    Exclusivo para Asociados
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                    <Globe size={12} />
                                                    Abierto
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        {tender.estado === 'cerrado' && (
                                            <div className="absolute top-4 left-4">
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                    <Clock size={12} />
                                                    Cerrado
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} className="text-green-500" />
                                            <span>{tender.fecha_publicacion || 'N/A'}</span>
                                        </div>
                                        {tender.fecha_cierre && (
                                            <div className="flex items-center gap-1 text-red-500">
                                                <Clock size={12} />
                                                <span>Cierre: {tender.fecha_cierre}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Link href={route('bienes-servicios.tender', [company.slug, tender.slug])}>
                                        <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-green-600 transition-colors uppercase">
                                            {tender.titulo}
                                        </h3>
                                    </Link>

                                    <p className="text-slate-500 text-sm line-clamp-3 mb-8 font-medium leading-relaxed">
                                        {tender.extracto || "Consulte los detalles y requisitos para participar en esta convocatoria de bienes y servicios."}
                                    </p>

                                    <div className="mt-auto">
                                        <Link href={route('bienes-servicios.tender', [company.slug, tender.slug])} className="w-full">
                                            <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest transition-all gap-2 group-hover:shadow-lg group-hover:shadow-green-500/20">
                                                Ver Detalles <ArrowRight size={16} />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                    {tenders.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm">
                                <Briefcase size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">Sin convocatorias vigentes</h3>
                            <p className="text-slate-500 font-medium">Esta empresa no tiene licitaciones abiertas en este momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
