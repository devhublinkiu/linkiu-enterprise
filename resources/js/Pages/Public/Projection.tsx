import { Link, Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import {
    Rocket
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Projection() {
    return (
        <PublicLayout>
            <Head title="Proyección 2030" />

            {/* Hero Header */}
            <div className="relative bg-white border-b border-slate-100 py-16 md:py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                    <svg className="h-full w-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full mb-6 border border-green-100/50">
                        <Rocket size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Futuro y Visión</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight uppercase mb-4">
                        PROYECCIÓN 2030
                    </h1>
                    <div className="h-1.5 w-24 bg-green-500 mx-auto rounded-full"></div>
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white">
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <p className="text-xl md:text-2xl font-medium text-slate-600 leading-relaxed text-left">
                                    Para el <span className="text-green-700 font-black">2030</span>, la Cámara Empresarial de Puerto Gaitán será un gremio líder y representativo, reconocido por su solidez organizativa y su capacidad para generar iniciativas empresariales innovadoras. Estaremos en permanente interacción con nuestros afiliados, el gobierno y las industrias, protegiendo los intereses de nuestros miembros y brindando información técnica oportuna y relevante para los públicos de interés.
                                </p>

                                <div className="h-1.5 w-24 bg-green-600 rounded-full"></div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <div className="relative group">
                                    {/* Decorative subtle background gradient */}
                                    <div className="absolute -inset-4 bg-gradient-to-tr from-green-100/30 to-slate-100/30 rounded-[2rem] -z-10 opacity-70"></div>

                                    <img
                                        src="/images/camep/img_proyeccion_2030_01.webp"
                                        alt="Proyección 2030 CAMEP"
                                        className="w-full h-auto rounded-3xl shadow-2xl relative z-10 border border-slate-100"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Values / Focus Section */}
            <section className="py-20 bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Liderazgo', desc: 'Ser el gremio referente y la voz unificada del sector empresarial.' },
                            { title: 'Innovación', desc: 'Generar iniciativas que impulsen la transformación y competitividad.' },
                            { title: 'Protección', desc: 'Defender los intereses legítimos de nuestros afiliados ante cualquier instancia.' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    </div>
                                    {item.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dark CTA Section */}
            <section className="py-20 bg-[#0a0a0a] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-8 uppercase tracking-widest leading-tight">
                            CONSTRUYENDO EL <span className="text-green-500">MAÑANA</span> JUNTO A TI
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={route('register')}>
                                <button className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-black py-4 px-12 rounded-xl transition-all shadow-xl uppercase tracking-widest">
                                    Únete a CAMEP
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
}
