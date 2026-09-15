import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children, ...rest }: { children: ReactNode }) => (
        <a {...rest}>{children}</a>
    ),
}));

import Show from '@/Pages/Public/Companies/Show';
import type { Company } from '@/Pages/Public/Companies/Show/types';

beforeEach(() => {
    vi.stubGlobal('route', () => '/empresas');
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    );
});

const company = (over: Partial<Company> = {}): Company => ({
    id: 1,
    name: 'Perforaciones del Llano',
    slug: 'perforaciones-del-llano',
    nit: '900123456-7',
    is_verified: true,
    logo: null,
    cover: null,
    facades: [],
    about_story: 'Somos una empresa con 20 años de experiencia.',
    about_image: null,
    description: null,
    legal: {
        rep_name: 'Ana Ruiz',
        main_ciiu: '0910',
        constitution_date: '19/10/2005',
        company_type: ['SAS'],
        address: 'Calle 1',
        department: 'Meta',
        city: 'Villavicencio',
    },
    contact: {
        phone: '3001234567',
        whatsapp: '3001234567',
        email: 'contacto@empresa.co',
        website: null,
        address: 'Calle 1',
        facebook: null,
        instagram: null,
        linkedin: null,
    },
    services: [],
    projects: [],
    gallery: [],
    certifications: [],
    team: [],
    clients: [],
    ...over,
});

describe('Public/Companies/Show (micrositio)', () => {
    it('oculta las secciones vacías del menú y muestra Quiénes somos y Contacto', () => {
        render(<Show company={company()} />);

        expect(
            screen.getByRole('button', { name: 'Quiénes somos' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Contacto' }),
        ).toBeInTheDocument();
        // Vacías → no aparecen en el menú.
        expect(screen.queryByRole('button', { name: 'Servicios' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Proyectos' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Galería' })).toBeNull();
        // Ficha legal (franja) con NIT y representante.
        expect(screen.getByText('900123456-7')).toBeInTheDocument();
        expect(screen.getByText('Ana Ruiz')).toBeInTheDocument();
    });

    it('muestra las secciones con contenido en el menú', () => {
        render(
            <Show
                company={company({
                    services: [
                        {
                            id: 1,
                            name: 'Perforación',
                            category: 'Minería',
                            description: null,
                            cover: null,
                        },
                    ],
                    projects: [
                        {
                            id: 1,
                            title: 'Pozo Norte',
                            description: null,
                            client: 'Ecopetrol',
                            images: [],
                        },
                    ],
                    gallery: ['/g1.jpg', '/g2.jpg'],
                })}
            />,
        );

        expect(
            screen.getByRole('button', { name: 'Servicios' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Proyectos' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Galería' }),
        ).toBeInTheDocument();
    });
});
