import { Link, Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    History as HistoryIcon,
    FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function History() {
    return (
        <PublicLayout>
            <Head title="Nuestra Historia" />

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
                        <HistoryIcon size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Desde 2024</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight uppercase mb-4">
                        NUESTRA HISTORIA
                    </h1>
                    <div className="h-1.5 w-24 bg-green-500 mx-auto rounded-full"></div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="bg-white">
                {/* Section 1: Introduction */}
                <section className="py-20 border-b border-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-6"
                            >
                                <p className="text-lg md:text-xl font-bold text-green-700 leading-relaxed uppercase tracking-tight">
                                    Trabajamos por el fortalecimiento empresarial sostenible y estratégico de la región.
                                </p>
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                                    Como empresarios locales del municipio de Puerto Gaitán hemos sentido por años la ausencia de un interlocutor único y confiable frente al Gobierno, la opinión pública y las Industrias presentes en el municipio que defienda nuestros intereses legítimos de oportunidad de crecimiento empresarial, participación, inclusión y respeto a la libre competencia.
                                </p>
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
                                    Ante este panorama se crea la Cámara Empresarial de Puerto Gaitán CAMEP el 17 de octubre de 2024, como resultado de la fusión de varios sectores empresariales tales como de servicios logísticos, de consultoría, construcción de infraestructura, obras civiles, mecánicas, eléctricas, metalmecánicos, ambientales, eventos, publicidad, transporte, entre otros.
                                </p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <img 
                                    src="/images/camep/img_nuestra_historia_01.webp" 
                                    alt="Inicio de CAMEP" 
                                    className="w-full h-auto rounded-xl shadow-2xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Consolidation */}
                <section className="py-20 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative order-2 lg:order-1"
                            >
                                <img 
                                    src="/images/camep/img_nuestra_historia_02.webp" 
                                    alt="CAMEP Experiencia" 
                                    className="w-full h-auto rounded-xl shadow-2xl"
                                />
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-6 order-1 lg:order-2"
                            >
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                                    CAMEP, está conformado por empresas con más de 15 años de experiencia, que vimos la necesidad de unir fuerzas para consolidar un sector integrado por las empresas vinculadas a la cadena de valor de la industria, y tener un mayor reconocimiento, donde las oportunidades de negocio se multipliquen para todos.
                                </p>
                                <p className="text-base md:text-lg text-green-700 leading-relaxed font-bold">
                                    CAMEP es más que la cámara empresarial Portogaitanense de Bienes y Servicios para las diversas industrias del municipio, más que un gremio, CAMEP es el motor de crecimiento de sus afiliados.
                                </p>
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                                    Trabajamos para crear un mejor entorno de negocios, para dinamizar la economía municipal, ponerle velocidad, gestionando cambios garantizando el crecimiento del sector en un marco de sostenibilidad y equilibrio en las relaciones contractuales.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Vision and Unity */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-6"
                            >
                                <p className="text-lg md:text-xl text-green-700 leading-relaxed font-bold uppercase">
                                    Somos los que hacen que las cosas pasen.
                                </p>
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                                    Representando un grupo de empresas, conectadas entre sí, a un sector, a un municipio. Hacer en conjunto lo que individualmente sería imposible. Hay una gran diferencia entre oír y escuchar ...
                                </p>
                                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                                    Sabemos escuchar, entendemos. Juntamos las necesidades de nuestros afiliados en una sola Voz, una voz que vibra y resuena al unísono, una gran voz que llega más lejos, hasta donde deben escucharnos. Somos el portavoz de un mensaje en común de oportunidad, fortalecimiento, consolidación y crecimiento empresarial.
                                </p>
                                <div className="p-6 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
                                    <p className="text-lg font-black text-green-800 leading-relaxed">
                                        ¡No creemos en la individualidad, creemos en el trabajo colectivo lado a lado, llegar juntos y mantenernos juntos!
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <img 
                                    src="/images/camep/img_nuestra_historia_03.webp" 
                                    alt="CAMEP Unidad" 
                                    className="w-full h-auto rounded-xl shadow-2xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
            
            {/* CTA Section */}
            <section className="py-20 bg-[#0a0a0a] text-white">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-black mb-8 uppercase tracking-widest">¿Quieres ser parte de nuestra historia?</h2>
                    <Link href={route('register')}>
                        <button className="bg-green-600 hover:bg-green-500 text-white font-black py-4 px-12 rounded-xl transition-all transform hover:scale-105 uppercase tracking-widest shadow-xl">
                            Afíliate Ahora
                        </button>
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
