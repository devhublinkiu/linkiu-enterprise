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
            employees_tech: 0,
            employees_prof: 0,
            employees_admin: 0,
            employees_exec: 0,
            employees_other: 0,
            employees_other_desc: '',
            employees_direct_count: 0,
            hydrocarbons_participation: null,
            hydrocarbons_level: '',
            pep_declaration: null,
            pep_name: '',
            pep_doc_type: '',
            pep_entity: '',
            capacitation_plan: null,
            capacitation_level: '',
            capacitation_no_reason: '',
            company_classification: '',
            public_income_pct: 0,
            private_income_pct: 0,
            other_guilds: '',
        },
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
        setError: vi.fn(),
        clearErrors: vi.fn(),
    }),
}));

import Characterization from '@/Pages/Associate/Company/Characterization/Index';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

describe('Characterization (asociado)', () => {
    it('en aprobado muestra el banner y el botón Editar, sin enviar', () => {
        render(
            <Characterization
                initialAssociate={{
                    section_reviews: {
                        characterization: { status: 'approved' },
                    },
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
            <Characterization
                initialAssociate={{
                    section_reviews: {
                        characterization: {
                            status: 'rejected',
                            rejected_reason: 'Revisa los ingresos.',
                        },
                    },
                }}
            />,
        );
        expect(screen.getByText(/Revisa los ingresos\./)).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /enviar a revisión/i }),
        ).toBeInTheDocument();
    });

    it('en borrador muestra el indicador de suma de ingresos', () => {
        render(
            <Characterization
                initialAssociate={{
                    section_reviews: { characterization: { status: 'draft' } },
                }}
            />,
        );
        expect(screen.getByText(/Suma actual: 0%/)).toBeInTheDocument();
    });
});
