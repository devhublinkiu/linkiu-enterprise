import { Link, usePage } from '@inertiajs/react';
import { 
    Facebook, 
    Instagram, 
    Linkedin, 
    Youtube, 
    Mail, 
    MapPin, 
    Phone, 
    ArrowRight,
    ExternalLink
} from 'lucide-react';
import { PageProps } from '@/types';
import { cn } from '@/lib/utils';

export default function Footer() {
    const { tenant } = usePage<PageProps>().props;
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: Instagram, href: 'https://www.instagram.com/camep_pg/', label: 'Instagram' },
        { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=100072352563081', label: 'Facebook' },
        { icon: Linkedin, href: 'https://www.linkedin.com/in/camep-puerto-gait%C3%A1n-19736b355/', label: 'LinkedIn' },
        { icon: Youtube, href: 'https://www.youtube.com/@CAMEP_G', label: 'YouTube' },
    ];

    const navigation = [
        {
            title: 'Nosotros',
            links: [
                { name: 'Acerca de CAMEP', href: route('about') },
                { name: 'Nuestra Historia', href: route('history') },
                { name: 'Que nos Inspira', href: route('inspiration') },
                { name: 'Nuestro Propósito', href: route('purpose') },
            ]
        },
        {
            title: 'Directorio',
            links: [
                { name: 'Nuestras Empresas', href: route('companies.index') },
                { name: 'Bienes y Servicios', href: route('bienes-servicios.index') },
                { name: 'Categorías Especializadas', href: route('companies.index') },
            ]
        },
        {
            title: 'Comunidad',
            links: [
                { name: 'Anuncios y Licitaciones', href: route('announcements.index') },
                { name: 'Blog Gremial', href: route('blog.index') },
                { name: 'Solicitud de Afiliación', href: route('register') },
                { name: 'Portal de Asociados', href: route('login') },
            ]
        }
    ];

    return (
        <footer className="bg-slate-900 pt-20 pb-10 text-slate-400 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-green-600"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link href="/" className="inline-block transition-transform hover:scale-105">
                            <img 
                                src="/images/camep/logo_camep_horizontal_sidebar.svg" 
                                alt="CAMEP Logo" 
                                className="h-16 w-auto brightness-0 invert" 
                            />
                        </Link>
                        <p className="text-base leading-relaxed text-slate-400 max-w-sm">
                            Impulsando el desarrollo económico y social de Puerto Gaitán a través de la unión estratégica y el fortalecimiento empresarial.
                        </p>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-orange-600 hover:border-orange-600 hover:-translate-y-1 transition-all duration-300"
                                    aria-label={social.label}
                                >
                                    <social.icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
                        {navigation.map((group) => (
                            <div key={group.title} className="space-y-6">
                                <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">
                                    {group.title}
                                </h4>
                                <ul className="space-y-4">
                                    {group.links.map((link) => (
                                        <li key={link.name}>
                                            <Link 
                                                href={link.href}
                                                className="text-sm font-medium hover:text-white hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2 group"
                                            >
                                                <span className="h-1 w-0 bg-orange-500 rounded-full transition-all group-hover:w-1.5"></span>
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-3 space-y-8">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">
                            Atención al Socio
                        </h4>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 flex-shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase text-white tracking-widest">Dirección</p>
                                    <p className="text-sm leading-snug">MZ 8 CA 813 APTO 202<br />Flor Amarillo, Puerto Gaitán</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 flex-shrink-0">
                                    <Mail size={18} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase text-white tracking-widest">Correo Electrónico</p>
                                    <a href="mailto:info@camepg.org" className="text-sm hover:text-white transition-colors">info@camepg.org</a>
                                </div>
                            </div>

                            <div className="flex gap-4 group/item">
                                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 flex-shrink-0 group-hover/item:bg-orange-500 group-hover/item:text-white transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase text-white tracking-widest">WhatsApp / Celular</p>
                                    <a 
                                        href="https://wa.me/573507880664" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        +57 350 788 0664
                                        <ExternalLink size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-xs font-medium space-y-2 text-center md:text-left">
                        <p>© {currentYear} Cámara Empresarial de Puerto Gaitán - CAMEP</p>
                        <p className="text-slate-600">Representando el motor del cambio en nuestra región.</p>
                    </div>
                    <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
                        <Link href={route('contact.index')} className="hover:text-white transition-colors">PQRF</Link>
                        <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
                        <Link href="#" className="hover:text-white transition-colors">Términos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
