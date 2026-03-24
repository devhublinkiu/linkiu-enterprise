import { Link, Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    Lightbulb
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Inspiration() {
    return (
        <PublicLayout>
            <Head title="Que nos inspira" />

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
                        <Lightbulb size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Nuestra esencia</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight uppercase mb-4">
                        QUE NOS INSPIRA
                    </h1>
                    <div className="h-1.5 w-24 bg-green-500 mx-auto rounded-full"></div>
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white">
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="lg:col-span-5 space-y-8"
                            >
                                <p className="text-xl md:text-2xl font-medium text-slate-600 leading-relaxed text-left">
                                    <span className="text-green-700 font-black">CAMEP</span> es una asociación gremial empresarial que promueve el desarrollo socioeconómico, defiende la institucionalidad, los principios éticos y la transparencia, busca ser el aliado estratégico de sus afiliados, con el fin de promover el desarrollo regional, el crecimiento del sector en un marco de sostenibilidad, el equilibrio en las relaciones contractuales, propende por el fortalecimiento de las empresas que intervienen en la cadena de valor y su recurso humano.
                                </p>
                                
                                <div className="h-1.5 w-24 bg-green-600 rounded-full"></div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="lg:col-span-7 relative"
                            >
                                <div className="relative group">
                                    {/* Decorative background element */}
                                    <div className="absolute -inset-4 bg-green-50 rounded-[2rem] transform rotate-1 transition-transform group-hover:rotate-0 duration-500 -z-10 opacity-50"></div>
                                    
                                    <img 
                                        src="/images/camep/img_que_nos_inspira_01.webp" 
                                        alt="Que nos inspira CAMEP" 
                                        className="w-full h-auto rounded-3xl shadow-2xl relative z-10"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
            
            {/* Visual Quote Section */}
            <section className="py-20 bg-[#0a0a0a] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
                
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl md:text-4xl font-light italic text-slate-300 leading-tight mb-8">
                            "Impulsando el desarrollo regional a través de la unión y el crecimiento estratégico de nuestras empresas."
                        </h2>
                        <div className="h-px w-16 bg-green-500 mx-auto opacity-50"></div>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
}
