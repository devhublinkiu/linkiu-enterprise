import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// AppLayout arrastra toda la app (sidebar, topbar…); lo sustituimos por un contenedor.
vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

// Inertia: form controlado y router mínimos para renderizar la página aislada.
vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    router: { post: vi.fn() },
    useForm: () => ({
        data: {
            contacts: [
                { area: '', name: '', position: '', email: '', phone: '' },
            ],
            main_ciiu: '',
            secondary_ciiu: '',
            billing_email: '',
            company_type: [],
            references: [
                {
                    type: 'commercial',
                    name: '',
                    contact_person: '',
                    position: '',
                    email: '',
                    phone: '',
                },
            ],
            social_instagram: '',
            social_facebook: '',
            social_linkedin: '',
            social_other: '',
        },
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
        setError: vi.fn(),
        clearErrors: vi.fn(),
    }),
}));

import Contacts from '@/Pages/Associate/Company/Contacts/Index';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

describe('Contacts (asociado)', () => {
    it('en aprobado muestra el banner y el botón Editar, sin enviar', () => {
        render(
            <Contacts
                initialAssociate={{
                    section_reviews: { contacts: { status: 'approved' } },
                }}
            />,
        );
        expect(screen.getByText('Sección aprobada')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /editar/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /enviar a revisión/i }),
        ).not.toBeInTheDocument();
    });

    it('en rechazado muestra el motivo y permite enviar', () => {
        render(
            <Contacts
                initialAssociate={{
                    section_reviews: {
                        contacts: {
                            status: 'rejected',
                            rejected_reason: 'Faltan referencias.',
                        },
                    },
                }}
            />,
        );
        expect(screen.getByText(/Faltan referencias\./)).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /enviar a revisión/i }),
        ).toBeInTheDocument();
    });

    it('en borrador muestra los repetidores con su botón Agregar', () => {
        render(
            <Contacts
                initialAssociate={{
                    section_reviews: { contacts: { status: 'draft' } },
                }}
            />,
        );
        expect(
            screen.getByRole('button', { name: /agregar contacto/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /agregar referencia/i }),
        ).toBeInTheDocument();
    });
});
