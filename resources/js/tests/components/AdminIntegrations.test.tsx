import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    usePage: () => ({ props: { flash: {} } }),
    useForm: () => ({
        data: {
            is_active: true,
            environment: 'test',
            test_api_key: '',
            test_secret_key: '',
            production_api_key: '',
            production_secret_key: '',
            webhook_secret: '',
        },
        setData: vi.fn(),
        patch: vi.fn(),
        processing: false,
        errors: {},
    }),
}));

import IntegrationsIndex from '@/Pages/Admin/Integrations/Index';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

const bold = (over = {}) => ({
    is_active: true,
    enabled: true,
    environment: 'test' as const,
    has: {
        test_api_key: true,
        test_secret_key: true,
        production_api_key: false,
        production_secret_key: false,
        webhook_secret: false,
    },
    webhook_url: 'https://camepg.test/webhooks/bold',
    currency: 'COP',
    ...over,
});

describe('Admin/Integrations · Bold', () => {
    it('muestra el estado, las pestañas de entorno y la URL del webhook', () => {
        render(<IntegrationsIndex bold={bold()} />);

        expect(screen.getByText(/bold · pago en línea/i)).toBeInTheDocument();
        expect(screen.getByText('Activo')).toBeInTheDocument();
        // Pestañas de entorno.
        expect(
            screen.getByRole('button', { name: 'Pruebas' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Producción' }),
        ).toBeInTheDocument();
        // La URL del webhook se muestra para copiarla.
        expect(
            screen.getByDisplayValue('https://camepg.test/webhooks/bold'),
        ).toBeInTheDocument();
    });

    it('marca inactivo cuando Bold no está habilitado', () => {
        render(<IntegrationsIndex bold={bold({ enabled: false })} />);
        expect(screen.getByText('Inactivo')).toBeInTheDocument();
    });
});
