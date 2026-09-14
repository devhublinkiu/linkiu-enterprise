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
            company_name: '',
            initials: '',
            nit: '',
            legal_status: '',
            legal_status_other: '',
            constitution_date: '',
            country_origin: 'Colombia',
            phone: '',
            website: '',
            department: '',
            department_id: null,
            city: '',
            city_id: null,
            address: '',
            rep_name: '',
            rep_position: '',
            rep_doc_type: '',
            rep_doc: '',
        },
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
        setError: vi.fn(),
        clearErrors: vi.fn(),
    }),
}));

import BasicInfo from '@/Pages/Associate/Company/BasicInfo/Index';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [] }));
});

describe('BasicInfo (asociado)', () => {
    it('en aprobado muestra el banner y el botón Editar', () => {
        render(
            <BasicInfo
                initialAssociate={{
                    section_reviews: { basicinfo: { status: 'approved' } },
                }}
            />,
        );
        expect(screen.getByText('Sección aprobada')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /editar/i }),
        ).toBeInTheDocument();
        // Aprobado no es editable → sin botón de envío.
        expect(
            screen.queryByRole('button', { name: /enviar a revisión/i }),
        ).not.toBeInTheDocument();
    });

    it('en rechazado muestra el motivo y permite enviar', () => {
        render(
            <BasicInfo
                initialAssociate={{
                    section_reviews: {
                        basicinfo: {
                            status: 'rejected',
                            rejected_reason: 'Corrige el NIT.',
                        },
                    },
                }}
            />,
        );
        expect(screen.getByText(/Corrige el NIT\./)).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /enviar a revisión/i }),
        ).toBeInTheDocument();
    });
});
