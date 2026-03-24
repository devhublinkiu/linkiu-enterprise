import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { Badge } from '@/Components/ui/Badge';
import { 
    Calendar, 
    ArrowRight,
    MapPin,
    Briefcase,
    Building2,
    Clock,
    Globe,
    ShieldAlert,
    ArrowLeft
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
        <AppLayout>
            <Head title={`Licitaciones - ${company.nombre}`} />

            <div className="max-w-7xl mx-auto space-y-10 pb-20">
                {/* Company Header Card */}
                <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative">
                    <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                        <Link href={route('associate.company.bienes-servicios.index')} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        
                        <div className="w-40 h-40 bg-white rounded-3xl p-6 shadow-2xl flex items-center justify-center shrink-0 mt-8 md:mt-0">
                            {company.logo_url ? (
                                <img src={company.logo_url} alt={company.nombre} className="max-w-full max-h-full object-contain" />
                            ) : (
                                <Building2 size={64} className="text-slate-200" />
                            )}
                        </div>
                        
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">
                                <Building2 size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Empresa Aliada</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
                                {company.nombre}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 font-medium text-sm">
                                {(company.ciudad || company.departamento) && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-green-500" />
                                        <span>{company.ciudad}{company.ciudad && company.departamento ? ', ' : ''}{company.departamento}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Briefcase size={16} className="text-green-500" />
                                    <span>{tenders.length} Convocatorias Disponibles</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
                </div>

                {/* Tenders Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 uppercase border-l-4 border-green-500 pl-4">
                            Licitaciones Vigentes
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tenders.map((tender, i) => (
                            <motion.div
                                key={tender.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-2xl overflow-hidden bg-white group border border-slate-100 flex flex-col">
                                    <Link href={route('associate.company.bienes-servicios.tender', [company.slug, tender.slug])}>
                                        <div className="aspect-[16/9] overflow-hidden relative bg-slate-50 border-b border-slate-50">
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

                                            {/* Status Badge */}
                                            {tender.estado === 'cerrado' && (
                                                <div className="absolute top-4 left-4">
                                                    <Badge className="bg-red-600 text-white border-none px-3 py-1 text-[10px] uppercase font-black tracking-widest shadow-lg">
                                                        <Clock size={12} className="mr-1.5" />
                                                        Cerrado
                                                    </Badge>
                                                </div>
                                            )}

                                            {/* Audience Badge */}
                                            <div className="absolute top-4 right-4">
                                                {tender.publico_objetivo === 'exclusivo_asociados' ? (
                                                    <Badge className="bg-slate-950 text-white border-none py-1 px-3 text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                        <ShieldAlert size={12} className="mr-1.5 text-emerald-400" /> Exclusivo
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-white text-slate-900 border-none py-1 px-3 text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                        <Globe size={12} className="mr-1.5 text-blue-500" /> Público
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </Link>

                                    <CardContent className="p-8 flex flex-col flex-1">
                                        <div className="flex items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} className="text-green-500" />
                                                <span>{tender.fecha_publicacion || 'N/A'}</span>
                                            </div>
                                            {tender.fecha_cierre && (
                                                <div className="flex items-center gap-1 text-red-500">
                                                    <Clock size={12} />
                                                    <span>Expira: {tender.fecha_cierre}</span>
                                                </div>
                                            )}
                                        </div>

                                        <Link href={route('associate.company.bienes-servicios.tender', [company.slug, tender.slug])}>
                                            <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-green-600 transition-colors uppercase tracking-tight line-clamp-2">
                                                {tender.titulo}
                                            </h3>
                                        </Link>

                                        <p className="text-slate-500 text-xs font-bold leading-relaxed line-clamp-3 mb-8">
                                            {tender.extracto || "Consulta los detalles completos y la documentación técnica de esta licitación exclusiva para asociados."}
                                        </p>

                                        <div className="mt-auto">
                                            <Link href={route('associate.company.bienes-servicios.tender', [company.slug, tender.slug])}>
                                                <Button className="w-full bg-slate-50 group-hover:bg-slate-950 group-hover:text-white text-slate-900 rounded-xl h-12 font-black text-xs uppercase tracking-widest transition-all gap-2">
                                                    Ver Detalles <ArrowRight size={14} />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {tenders.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm">
                                    <Briefcase size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">Sin convocatorias</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Próximamente nuevas oportunidades de negocio.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
