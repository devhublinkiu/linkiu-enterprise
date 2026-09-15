import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import AboutSection from './Show/Parts/AboutSection';
import ContactSection from './Show/Parts/ContactSection';
import Factbar from './Show/Parts/Factbar';
import GallerySection from './Show/Parts/GallerySection';
import Hero from './Show/Parts/Hero';
import ProjectsSection from './Show/Parts/ProjectsSection';
import ServicesSection from './Show/Parts/ServicesSection';
import Topbar from './Show/Parts/Topbar';
import type { Company } from './Show/types';

const TOPBAR_H = 62;

export default function Show({
    company,
    preview = false,
}: {
    company: Company;
    preview?: boolean;
}) {
    const sections = [
        { id: 'quienes', label: 'Quiénes somos', visible: true },
        {
            id: 'servicios',
            label: 'Servicios',
            visible: company.services.length > 0,
        },
        {
            id: 'proyectos',
            label: 'Proyectos',
            visible: company.projects.length > 0,
        },
        {
            id: 'galeria',
            label: 'Galería',
            visible: company.gallery.length > 0,
        },
        { id: 'contacto', label: 'Contacto', visible: true },
    ].filter((s) => s.visible);

    const [active, setActive] = useState(sections[0].id);
    const metaDesc = (company.about_story || company.description || '').slice(
        0,
        180,
    );

    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActive(e.target.id);
                });
            },
            { rootMargin: '-45% 0px -50% 0px' },
        );
        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) obs.observe(el);
        });
        return () => obs.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const navigate = (id: string) => {
        if (id === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const el = document.getElementById(id);
        if (!el) return;
        const y = el.getBoundingClientRect().top + window.scrollY - TOPBAR_H;
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#f4f1ea] font-sans text-[#16130e] antialiased">
            <Head title={`${company.name} | Directorio CAMEP`}>
                {metaDesc && <meta name="description" content={metaDesc} />}
                <meta property="og:title" content={company.name} />
                {metaDesc && (
                    <meta property="og:description" content={metaDesc} />
                )}
                {company.cover && (
                    <meta property="og:image" content={company.cover} />
                )}
            </Head>

            {preview && (
                <div className="sticky top-0 z-50 bg-[#d9531e] px-4 py-2 text-center text-[0.82rem] font-semibold text-white">
                    Vista previa — tu micrositio está en borrador. Publícalo
                    desde «Mi Página › Contacto» para que sea visible.
                </div>
            )}

            <Topbar
                company={company}
                sections={sections}
                active={active}
                onNavigate={navigate}
            />
            <Hero company={company} />
            <Factbar company={company} />

            <AboutSection company={company} />
            {company.services.length > 0 && (
                <ServicesSection company={company} />
            )}
            {company.projects.length > 0 && (
                <ProjectsSection company={company} />
            )}
            {company.gallery.length > 0 && <GallerySection company={company} />}
            <ContactSection company={company} />

            <footer className="bg-[#211c16] text-[#9a9287]">
                <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-3 px-7 py-6 text-[0.82rem]">
                    <Link
                        href={route('companies.index')}
                        className="transition-colors hover:text-[#ece6db]"
                    >
                        ← Directorio CAMEP
                    </Link>
                    {company.slug && (
                        <span className="font-medium text-[#d9531e]">
                            camep.org/{company.slug}
                        </span>
                    )}
                </div>
            </footer>
        </div>
    );
}
