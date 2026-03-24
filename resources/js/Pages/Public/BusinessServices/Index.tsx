import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { motion } from 'framer-motion';

interface Company {
    id: number;
    nombre: string;
    slug: string;
    logo_url: string | null;
}

interface Props {
    companies: Company[];
}

export default function Index({ companies }: Props) {
    const benefits = [
        "Acceso exclusivo a información sobre licitaciones y proyectos.",
        "Fortalecimiento de relaciones con operadoras y la red empresarial local.",
        "¡Oportunidades concretas para el crecimiento y desarrollo económico de tu negocio!"
    ];

    return (
        <PublicLayout>
            <Head title="Bienes y Servicios" />

            {/* Banner Section */}
            <div className="relative h-[300px] md:h-[450px] overflow-hidden">
                <img
                    src="/images/camep/img_bienes_y_servicios_cover.webp"
                    alt="Bienes y Servicios"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-white p-4"
                    >
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                            Bienes y Servicios
                        </h1>
                        <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-90">
                            Conectamos a las empresas locales con las mejores oportunidades de negocio.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Companies Logos Grid */}
            <div className="mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 border-l-8 border-green-500 pl-6 mb-12 uppercase">
                    Nuestras Empresas Aliadas
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center">
                    {companies.map((company, i) => (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: (i % 5) * 0.1 }}
                        >
                            <Link
                                href={route('bienes-servicios.company', company.slug)}
                                className="group block bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-green-200 transition-all duration-500 aspect-square flex flex-col items-center justify-center relative overflow-hidden"
                            >
                                {company.logo_url ? (
                                    <img
                                        src={company.logo_url}
                                        alt={company.nombre}
                                        className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <span className="text-slate-400 font-bold text-center group-hover:text-green-600 transition-colors uppercase text-sm">
                                        {company.nombre}
                                    </span>
                                )}

                                <div className="absolute inset-x-0 bottom-0 py-2 bg-green-600 text-white text-[10px] font-black uppercase text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    Ver Licitaciones
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {companies.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">Próximamente más empresas aliadas.</p>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="h-1.5 w-24 bg-green-500 mx-auto rounded-full mb-12"></div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                            En <span className="text-green-700 font-black uppercase">Camep</span>, impulsamos el desarrollo económico local vinculando la oferta de bienes y servicios de Puerto Gaitán con la demanda de las grandes operadoras y empresas del sector.
                        </p>

                        <div className="text-left bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-green-700 uppercase tracking-widest mb-6">
                                Beneficios para tu empresa:
                            </h3>
                            <ul className="space-y-4">
                                {benefits.map((benefit, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-3 text-slate-700 font-medium md:text-lg"
                                    >
                                        <div className="mt-1.5">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                        {benefit}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </PublicLayout>
    );
}
