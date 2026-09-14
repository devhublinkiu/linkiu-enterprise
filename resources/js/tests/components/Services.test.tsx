import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    router: { post: vi.fn() },
    useForm: () => ({
        data: { description: '', service_ids: [1] },
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
        setError: vi.fn(),
        clearErrors: vi.fn(),
    }),
}));

import Services from '@/Pages/Associate/Company/Services/Index';

const availableServices = [
    {
        id: 1,
        name: 'Consultoría ambiental',
        category_id: 2,
        category: { id: 2, name: 'Medio ambiente' },
    },
    {
        id: 2,
        name: 'Transporte de carga',
        category_id: 3,
        category: { id: 3, name: 'Logística' },
    },
];
const serviceCategories = [
    { id: 2, name: 'Medio ambiente', slug: 'ma', order: 0 },
    { id: 3, name: 'Logística', slug: 'lo', order: 1 },
];

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

describe('Services (asociado)', () => {
    it('en borrador muestra la selección como chip y pide filtrar antes de listar', () => {
        render(
            <Services
                initialAssociate={{
                    section_reviews: { services: { status: 'draft' } },
                }}
                availableServices={availableServices}
                serviceCategories={serviceCategories}
            />,
        );
        // El servicio 1 está seleccionado → aparece como chip con botón "Quitar".
        expect(
            screen.getByRole('button', {
                name: /quitar consultoría ambiental/i,
            }),
        ).toBeInTheDocument();
        // Catálogo grande: no se lista hasta buscar/filtrar.
        expect(
            screen.getByText(/busca por nombre o elige una categoría/i),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /enviar a revisión/i }),
        ).toBeInTheDocument();
    });

    it('en aprobado muestra el botón Editar y no permite enviar', () => {
        render(
            <Services
                initialAssociate={{
                    section_reviews: { services: { status: 'approved' } },
                }}
                availableServices={availableServices}
                serviceCategories={serviceCategories}
            />,
        );
        expect(
            screen.getByRole('button', { name: /editar/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /enviar a revisión/i }),
        ).not.toBeInTheDocument();
    });
});
