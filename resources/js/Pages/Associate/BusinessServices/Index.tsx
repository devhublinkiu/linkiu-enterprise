import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent } from '@/Components/ui/Card';
import { 
    Building2, 
    ArrowRight,
    MapPin,
    Briefcase,
    Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Input } from '@/Components/ui/Input';

interface Company {
    id: number;
    nombre: string;
    slug: string;
    logo_url: string | null;
    departamento: string | null;
    ciudad: string | null;
}

interface Props {
    companies: Company[];
}

export default function Index({ companies }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = companies.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.ciudad && c.ciudad.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AppLayout>
            <Head title="Bienes y Servicios - Directorio" />

            <div className="max-w-7xl mx-auto space-y-10 pb-20">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-8 md:p-12">
                    <div className="relative z-10 max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
                            <Building2 size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ecosistema Empresarial</span>
                        </div>
                        
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase">
                            Bienes y <span className="text-green-500">Servicios</span>
                        </h1>
                        
                        <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed max-w-xl">
                            Explora el directorio de empresas aliadas y accede a todas sus convocatorias y licitaciones vigentes de forma exclusiva.
                        </p>
                    </div>

                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
                    <Building2 size={280} strokeWidth={0.5} className="absolute right-8 bottom-0 transform translate-y-1/4 hidden lg:block opacity-5 text-white -rotate-12" />
                </div>

                {/* Search Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-4 z-20">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={18} />
                        <Input
                            placeholder="Buscar empresa por nombre o ciudad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                        />
                    </div>
                    
                    <div className="h-10 px-5 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {filteredCompanies.length} Empresas registradas
                        </span>
                    </div>
                </div>

                {/* Companies Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredCompanies.map((company, i) => (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-2xl overflow-hidden bg-white group border border-slate-100">
                                <CardContent className="p-0">
                                    <Link 
                                        href={route('associate.company.bienes-servicios.company', company.slug)}
                                        className="block p-8 aspect-square relative flex items-center justify-center overflow-hidden bg-slate-50/50"
                                    >
                                        {company.logo_url ? (
                                            <img
                                                src={company.logo_url}
                                                alt={company.nombre}
                                                className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <Building2 size={48} className="text-slate-200" />
                                        )}
                                        
                                        <div className="absolute inset-x-0 bottom-0 py-2 bg-slate-900 text-white text-[10px] font-black uppercase text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            Ver Convocatorias
                                        </div>
                                    </Link>
                                    
                                    <div className="p-4 border-t border-slate-50 text-center">
                                        <Link href={route('associate.company.bienes-servicios.company', company.slug)}>
                                            <h3 className="font-black text-slate-900 text-sm uppercase leading-tight line-clamp-1 group-hover:text-green-600 transition-colors">
                                                {company.nombre}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <MapPin size={10} className="text-green-500" />
                                            <span>{company.ciudad || company.departamento || 'No definida'}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                    {filteredCompanies.length === 0 && (
                        <div className="col-span-full py-40 flex flex-col items-center text-center space-y-6 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                            <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center text-slate-100 shadow-sm">
                                <Search size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Sin resultados</h2>
                                <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-wide">
                                    No hay empresas que coincidan con "{searchTerm}".
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
