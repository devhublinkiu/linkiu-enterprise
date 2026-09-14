import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    usePage: () => ({ props: { flash: {} } }),
    router: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
    useForm: () => ({
        data: {
            key: '',
            label: '',
            icon: 'FileText',
            accepts: ['pdf'],
            is_required: true,
            is_active: true,
            legend: '',
            template_file: null,
            remove_template: false,
        },
        setData: vi.fn(),
        post: vi.fn(),
        processing: false,
        errors: {},
        clearErrors: vi.fn(),
    }),
}));

import Index from '@/Pages/Admin/DocumentRequirements/Index';

const props = {
    documents: [
        {
            id: 1,
            key: 'rut',
            label: 'RUT',
            icon: 'FileText',
            accepts: ['pdf'],
            is_required: true,
            is_active: true,
            legend: null,
            template_path: null,
            template_url: null,
            display_order: 0,
            in_use: false,
        },
        {
            id: 2,
            key: 'camara_comercio',
            label: 'Cámara de comercio',
            icon: 'Building2',
            accepts: ['pdf', 'jpg'],
            is_required: false,
            is_active: true,
            legend: 'Del año más reciente',
            template_path: null,
            template_url: null,
            display_order: 1,
            in_use: false,
        },
    ],
    allowedIcons: ['FileText', 'Building2'],
    allowedMimes: ['pdf', 'jpg', 'png', 'docx', 'xlsx'],
};

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

describe('Admin/DocumentRequirements Index', () => {
    it('lista los documentos en una sola tabla con su obligatoriedad', () => {
        render(<Index {...props} />);

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('RUT')).toBeInTheDocument();
        expect(screen.getByText('Cámara de comercio')).toBeInTheDocument();
        // 'Obligatorio' aparece en el encabezado de columna y como badge de la fila.
        expect(
            screen.getAllByText('Obligatorio').length,
        ).toBeGreaterThanOrEqual(2);
        expect(screen.getByText('Opcional')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /nuevo documento/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('switch', { name: /activo: rut/i }),
        ).toBeInTheDocument();
    });
});
