import { Link, Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    Target
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Purpose() {
    const sections = [
        {
            text: "Como empresarios locales del municipio de Puerto Gaitán hemos sentido por años la ausencia de un interlocutor único y confiable frente al Gobierno, la opinión pública y las Industrias presentes en el municipio que defienda nuestros intereses legítimos de oportunidad de crecimiento empresarial, participación, inclusión y respeto a la libre competencia.",
            image: "/images/camep/img_nuestro_proposito_01.webp",
            imageLeft: false
        },
        {
            text: "Ante este panorama se crea la Cámara Empresarial de Puerto Gaitán CAMEP el 17 de octubre de 2024, como resultado de la fusión de varios sectores empresariales tales como de servicios logísticos, de consultoría, construcción de infraestructura, obras civiles, mecánicas, eléctricas, metalmecánicos, ambientales, eventos, publicidad, transporte, entre otros.",
            image: "/images/camep/img_nuestro_proposito_02.webp",
            imageLeft: true
        },
        {
            text: "CAMEP, está conformado por empresas con más de 15 años de experiencia, que vimos la necesidad de unir fuerzas para consolidar un sector integrado por las empresas vinculadas a la cadena de valor de la industria, y tener un mayor reconocimiento, donde las oportunidades de negocio se multipliquen para todos.",
            image: "/images/camep/img_nuestro_proposito_03.webp",
            imageLeft: false
        },
        {
            text: "CAMEP es más que la cámara empresarial Portogaitanense de Bienes y Servicios para las diversas industrias del municipio, más que un gremio, CAMEP es el motor de crecimiento de sus afiliados. Trabajamos para crear un mejor entorno de negocios, para dinamizar la economía municipal, ponerle velocidad, gestionando cambios garantizando el crecimiento del sector en un marco de sostenibilidad y equilibrio en las relaciones contractuales.",
            image: "/images/camep/img_nuestro_proposito_04.webp",
            imageLeft: true
        },
        {
            text: "Somos los que hacen que las cosas pasen, representando un grupo de empresas, conectadas entre sí, a un sector, a un municipio. Hacer en conjunto lo que individualmente sería imposible. Hay una gran diferencia entre oír y escuchar... Sabemos escuchar, entendemos.",
            image: "/images/camep/img_nuestro_proposito_05.webp",
            imageLeft: false
        },
        {
            text: "Juntamos las necesidades de nuestros afiliados en una sola Voz, una voz que vibra y resuena al unísono, una gran voz que llega más lejos, hasta donde deben escucharnos. Somos el portavoz de un mensaje en común de oportunidad, fortalecimiento, consolidación y crecimiento empresarial. ¡No creemos en la individualidad, creemos en el trabajo colectivo lado a lado, llegar juntos y mantenernos juntos!",
            image: "/images/camep/img_nuestro_proposito_06.webp",
            imageLeft: true
        }
    ];

    return (
        <PublicLayout>
            <Head title="Nuestro Propósito" />

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
                        <Target size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Compromiso</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight uppercase mb-4">
                        NUESTRO PROPÓSITO
                    </h1>
                    <div className="h-1.5 w-24 bg-green-500 mx-auto rounded-full"></div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="bg-white">
                {sections.map((section, index) => (
                    <section key={index} className={`py-20 ${index % 2 !== 0 ? 'bg-slate-50/50' : ''}`}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <motion.div 
                                    initial={{ opacity: 0, x: section.imageLeft ? 30 : -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className={`space-y-6 ${section.imageLeft ? 'order-1 lg:order-2' : ''}`}
                                >
                                    <p className="text-lg md:text-xl font-medium text-slate-600 leading-relaxed text-left">
                                        {section.text}
                                    </p>
                                    <div className="h-1 w-20 bg-green-600/30 rounded-full"></div>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className={`relative ${section.imageLeft ? 'order-2 lg:order-1' : ''}`}
                                >
                                    <img 
                                        src={section.image} 
                                        alt={`Propósito CAMEP ${index + 1}`} 
                                        className="w-full h-auto rounded-xl shadow-2xl border border-white/10"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
            
            {/* Final CTA Section */}
            <section className="py-24 bg-[#0a0a0a] text-white overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-600/5 rounded-full blur-[120px] -z-0"></div>
                
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-10 uppercase tracking-widest leading-tight">
                            JUNTOS SOMOS <span className="text-green-500">MÁS FUERTES</span>
                        </h2>
                        <Link href={route('register')}>
                            <button className="bg-green-600 hover:bg-green-500 text-white font-black py-5 px-16 rounded-xl transition-all shadow-2xl uppercase tracking-widest transform hover:scale-105">
                                Únete a la Cámara
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
}
