import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/DropdownMenu";
import { ChevronDown, Menu, X, Building2, Users, Info, Lightbulb, Rocket, Target, Grid, List, Bell, Newspaper, Mail } from 'lucide-react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const { tenant, auth, service_categories } = usePage<PageProps>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Inicio', href: route('welcome') },
        {
            name: 'Nosotros',
            submenu: [
                { name: 'Acerca de nosotros', href: route('about') },
                { name: 'Nuestra historia', href: route('history') },
                { name: 'Que nos inspira', href: route('inspiration') },
                { name: 'Proyección 2030', href: route('projection') },
                { name: 'Nuestro propósito', href: route('purpose') },
            ]
        },
        { name: 'Bienes y servicios', href: route('bienes-servicios.index') },
        {
            name: 'Nuestras empresas',
            submenu: [
                { name: 'Ver todas las empresas', href: route('companies.index') },
                ...(service_categories || []).map((cat: any) => ({
                    name: `Categoría ${cat.name}`,
                    href: route('categories.show', cat.slug),
                }))
            ]
        },
        {
            name: 'Enterate',
            submenu: [
                { name: 'Anuncios Camep', href: route('announcements.index') },
                { name: 'Blog', href: route('blog.index') },
            ]
        },
        { name: 'Contacto', href: route('contact.index') },
    ];

    return (
        <>
            <nav className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                scrolled ? "bg-white/95 shadow-xl py-2" : "bg-white/90 backdrop-blur-md py-4 border-b border-slate-100"
            )}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 relative">
                    {/* Logo Section - Pushed to the left */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center transition-transform hover:scale-105 z-[60]">
                            <img
                                src="/images/camep/logo_camep_horizontal_sidebar.svg"
                                alt="CAMEP Logo"
                                className={cn("w-auto transition-all duration-300", scrolled ? "h-9 sm:h-11" : "h-11 sm:h-14")}
                            />
                        </Link>
                    </div>

                    {/* Desktop Menu - Centered with good separation */}
                    <div className="hidden xl:flex items-center gap-2 xl:gap-6 h-full absolute left-1/2 -translate-x-1/2">
                        {navItems.map((item) => (
                            <div 
                                key={item.name} 
                                className="relative h-full flex items-center"
                                onMouseEnter={() => setHoveredItem(item.name)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                {item.submenu ? (
                                    <>
                                        <button className="flex items-center gap-1.5 px-3 py-2 text-base font-bold text-slate-600 hover:text-orange-500 transition-colors tracking-tight outline-none group whitespace-nowrap">
                                            {item.name}
                                            <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-200", hoveredItem === item.name && "rotate-180 text-orange-500")} />
                                        </button>
                                        
                                        {/* Hover Submenu */}
                                        {hoveredItem === item.name && (
                                            <div className="absolute top-[100%] left-0 w-64 pt-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[70]">
                                                <div className="bg-white border border-slate-100 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-3 backdrop-blur-xl">
                                                    {item.submenu.map((sub) => (
                                                        <Link
                                                            key={sub.name}
                                                            href={sub.href}
                                                            className="flex items-center gap-4 px-4 py-2 text-[14px] font-bold text-slate-600 hover:text-orange-500 hover:bg-orange-50/50 rounded-xl transition-all group"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="px-3 py-2 text-base font-bold text-slate-600 hover:text-orange-500 transition-colors tracking-tight whitespace-nowrap"
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Side Actions - Pushed to the right */}
                    <div className="flex items-center gap-2 sm:gap-6">
                        <div className="hidden sm:flex items-center gap-4">
                            {auth.user ? (
                                <Link href={route('dashboard')}>
                                    <Button className="bg-slate-900 hover:bg-orange-500 text-white rounded-xl px-6 h-11 font-bold tracking-tight text-sm transition-all shadow-xl hover:-translate-y-0.5">
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')}>
                                        <Button variant="ghost" className="text-slate-900 font-bold tracking-tight text-sm hover:text-orange-500 hover:bg-orange-50 rounded-xl px-5 h-11 transition-all">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href={route('register')}>
                                        <Button className="bg-orange-500 hover:bg-slate-900 shadow-xl shadow-orange-500/20 text-white rounded-xl px-6 h-11 font-bold tracking-tight text-sm transition-all hover:-translate-y-0.5 whitespace-nowrap">
                                            Afiliate
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile/Tablet Toggle */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="xl:hidden p-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors z-[60]"
                            aria-label="Menu"
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile/Tablet Menu Popup */}
            {isMobileMenuOpen && (
                <div 
                    className="xl:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div 
                        className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 flex items-center justify-between border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Navegación</span>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 flex-1">
                            {navItems.map((item) => (
                                <div key={item.name} className="space-y-4">
                                    {item.submenu ? (
                                        <>
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500/50 px-4">
                                                {item.name}
                                            </h3>
                                            <div className="grid grid-cols-1 gap-1">
                                                {item.submenu.map((sub) => (
                                                    <Link
                                                        key={sub.name}
                                                        href={sub.href}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="flex items-center gap-4 px-4 py-4 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all active:scale-95 group"
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-4 py-4 text-sm font-bold text-slate-900 hover:bg-orange-50 hover:text-orange-500 rounded-xl transition-all"
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            ))}

                            <div className="pt-8 space-y-4">
                                {!auth.user ? (
                                    <>
                                        <Link href={route('login')} onClick={() => setIsMobileMenuOpen(false)} className="block w-full">
                                            <Button variant="outline" className="w-full h-14 rounded-xl font-bold tracking-tight text-sm border-slate-200 text-slate-900 hover:bg-slate-50 transition-all">
                                                Iniciar sesión
                                            </Button>
                                        </Link>
                                        <Link href={route('register')} onClick={() => setIsMobileMenuOpen(false)} className="block w-full">
                                            <Button className="w-full h-14 rounded-xl font-bold tracking-tight text-sm bg-orange-500 text-white shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all">
                                                Afiliate ahora
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <Link href={route('dashboard')} onClick={() => setIsMobileMenuOpen(false)} className="block w-full">
                                        <Button className="w-full h-14 rounded-xl font-bold tracking-tight text-sm bg-slate-900 text-white shadow-xl hover:scale-[1.02] transition-all">
                                            Ir al dashboard
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-50 opacity-40 grayscale flex items-center justify-center gap-2">
                             <img src="/images/camep/logo_camep_horizontal_sidebar.svg" className="h-6" alt="" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Separate icon fix for history removed as it's no longer used

// Separate icon fix for history removed as it's no longer used


