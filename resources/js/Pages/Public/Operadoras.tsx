import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { motion } from 'framer-motion';

export default function Operadoras() {
    const logos = [
        "/images/camep/logo_bienes_y_servicios_01.webp",
        "/images/camep/logo_bienes_y_servicios_02.webp",
        "/images/camep/logo_bienes_y_servicios_03.webp",
        "/images/camep/logo_bienes_y_servicios_04.webp",
        "/images/camep/logo_bienes_y_servicios_05.webp",
        "/images/camep/logo_bienes_y_servicios_06.webp",
        "/images/camep/logo_bienes_y_servicios_07.webp",
        "/images/camep/logo_bienes_y_servicios_08.webp",
    ];

    const benefits = [
        "Acceso exclusivo a información sobre licitaciones y proyectos.",
        "Fortalecimiento de relaciones con operadoras y la red empresarial local.",
        "¡Oportunidades concretas para el crecimiento y desarrollo económico de tu negocio!"
    ];

    return (
        <PublicLayout>
            <Head title="Operadoras" />

            {/* Banner Section */}
            <div className="relative h-[300px] md:h-[450px] overflow-hidden">
                <img
                    src="/images/camep/img_bienes_y_servicios_cover.webp"
                    alt="Operadoras de Hidrocarburos"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-8">
                        Operadoras
                    </h1>
                    <div className="h-1.5 w-24 bg-green-500 mx-auto rounded-full mb-12"></div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                            En <span className="text-green-700 font-black uppercase">Camep</span>, impulsamos el desarrollo económico local conectando a las empresas de Puerto Gaitán con oportunidades de negocio directas de las operadoras de hidrocarburos.
                        </p>

                        <div className="text-left bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-green-700 uppercase tracking-widest mb-6">
                                Con nosotros, encuentras:
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

                {/* Logos Grid */}
                <div className="mt-20 md:max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-4 items-center justify-items-center">
                        {logos.map((logo, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="w-full max-w-[380px] aspect-video flex items-center justify-center p-2 transition-transform duration-500 hover:scale-105"
                            >
                                <img
                                    src={logo}
                                    alt={`Operadora ${i + 1}`}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
