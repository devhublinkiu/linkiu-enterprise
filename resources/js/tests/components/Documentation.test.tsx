import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    router: { post: vi.fn(), delete: vi.fn() },
    useForm: () => ({
        data: {
            files: {},
            rep_name: '',
            rep_doc: '',
            membership_interest: [],
            membership_interest_other: '',
            funds_origin_declaration: false,
        },
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
        setError: vi.fn(),
        clearErrors: vi.fn(),
    }),
}));

import Documentation from '@/Pages/Associate/Company/Documentation/Index';

const documentCatalog = {
    mandatory: [
        {
            key: 'rut',
            label: 'RUT',
            icon: 'FileText',
            accepts: ['pdf'],
            legend: null,
            template: null,
        },
    ],
    optional: [
        {
            key: 'camara',
            label: 'Cámara de comercio',
            icon: 'Building2',
            accepts: ['pdf'],
            legend: 'Del año más reciente',
            template: null,
        },
    ],
};

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

describe('Documentation (asociado)', () => {
    it('en borrador muestra documentos, interés y declaración con botón de envío', () => {
        render(
            <Documentation
                initialAssociate={{
                    section_reviews: { documentation: { status: 'draft' } },
                    document_urls: {},
                }}
                documentCatalog={documentCatalog}
            />,
        );

        expect(screen.getByText('RUT')).toBeInTheDocument();
        expect(screen.getByText('Cámara de comercio')).toBeInTheDocument();
        expect(screen.getByText('Interés de afiliación')).toBeInTheDocument();
        expect(screen.getByText('Declaración jurada')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /enviar a revisión/i }),
        ).toBeInTheDocument();
    });

    it('aprobada ofrece "Editar" y oculta el envío', () => {
        render(
            <Documentation
                initialAssociate={{
                    section_reviews: { documentation: { status: 'approved' } },
                    document_urls: {},
                }}
                documentCatalog={documentCatalog}
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
