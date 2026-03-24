import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Button } from '@/Components/ui/Button';
import { 
    ArrowLeft, 
    Lock, 
    ShieldAlert, 
    UserPlus,
    LogIn,
    ArrowRight,
    Megaphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    title: string;
    excerpt: string | null;
    cover_url: string | null;
}

export default function Restricted({ title, excerpt, cover_url }: Props) {
    return (
        <PublicLayout>
            <Head title={`Acceso Restringido | ${title}`} />

            <div className="max-w-7xl mx-auto px-4 py-16 md:py-32 flex flex-col items-center">
                
                {/* Back Link */}
                <div className="w-full max-w-4xl mb-12">
                    <Link href={route('announcements.index')} className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors font-bold text-sm group uppercase tracking-widest">
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        Volver a Licitaciones Públicas
                    </Link>
                </div>

                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100 p-8 md:p-16">
                    
                    {/* Left: Restricted Content Info */}
                    <div className="space-y-8 relative z-10">
                        <div className="h-20 w-20 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shadow-xl shadow-orange-500/10 mb-10">
                            <Lock size={40} strokeWidth={2.5} />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] uppercase">
                                Contenido <span className="text-orange-500">Exclusivo</span> <br />
                                para Asociados
                            </h1>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed uppercase tracking-tight text-justify">
                                Estás intentando acceder a una publicación de carácter privado. Para ver los pliegos de condiciones y la documentación técnica, debes estar afiliado a CAMEP.
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <Megaphone size={16} className="text-orange-500" />
                                {title}
                            </h3>
                            {excerpt && (
                                <p className="text-xs text-slate-400 font-medium line-clamp-2 uppercase tracking-tight">
                                    {excerpt}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href={route('login')} className="flex-1">
                                <Button className="w-full bg-slate-900 hover:bg-orange-500 text-white rounded-xl h-16 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 gap-3">
                                    <LogIn size={18} /> Iniciar Sesión
                                </Button>
                            </Link>
                            <Link href={route('register')} className="flex-1">
                                <Button variant="outline" className="w-full border-slate-200 hover:border-orange-500 hover:text-orange-500 rounded-xl h-16 font-black text-xs uppercase tracking-widest transition-all gap-3">
                                    <UserPlus size={18} /> Afiliarse Hoy
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Visual Element */}
                    <div className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative shadow-2xl">
                            {cover_url ? (
                                <img src={cover_url} alt={title} className="w-full h-full object-cover blur-[10px] scale-110 opacity-60" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                    <ShieldAlert size={120} strokeWidth={1} />
                                </div>
                            )}
                            
                            {/* Overlay message on blurred image */}
                            <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/10 backdrop-blur-[4px]">
                                <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-2xl text-center max-w-xs transform -rotate-2 group-hover:rotate-0 transition-transform duration-700">
                                    <ShieldAlert size={48} className="text-orange-500 mx-auto mb-6" />
                                    <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Documentación Protegida</h4>
                                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
                                        Solo los asociados con credenciales activas pueden descargar los archivos adjuntos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-6 -right-6 h-24 w-24 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce duration-[3s]">
                            <ArrowRight size={32} />
                        </div>
                    </div>
                </div>

                {/* Benefits Teaser */}
                <div className="max-w-4xl w-full mt-24 text-center">
                    <h2 className="text-2xl font-black text-slate-900 mb-12 uppercase tracking-tight">¿Por qué afiliarse a CAMEP?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                            { title: "Licitaciones", desc: "Acceso prioritario a convocatorias privadas." },
                            { title: "Networking", desc: "Conexión directa con operadoras del sector." },
                            { title: "Respaldo", desc: "Defensa gremial y representación oficial." }
                        ].map((b, i) => (
                            <div key={i} className="space-y-4">
                                <div className="h-12 w-12 bg-white rounded-xl shadow-md mx-auto flex items-center justify-center text-orange-500 border border-slate-50">
                                    <ShieldAlert size={20} />
                                </div>
                                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{b.title}</h4>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
