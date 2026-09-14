import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/Layouts/AppLayout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children, ...props }: { children: ReactNode }) => (
        <a {...props}>{children}</a>
    ),
}));

import BillingIndex from '@/Pages/Associate/Billing/Index';

beforeEach(() => {
    vi.stubGlobal('route', () => '/x');
});

const modules = [
    {
        key: 'galeria',
        name: 'Galería de fotos',
        type: 'limit' as const,
        group: 'contenido',
        coming_soon: false,
        enabled: true,
        limit_value: 10,
    },
    {
        key: 'ranking',
        name: 'Ranking de mi perfil',
        type: 'boolean' as const,
        group: 'visibilidad',
        coming_soon: true,
        enabled: true,
        limit_value: null,
    },
];

const availablePlans = [
    {
        id: 1,
        name: 'Oro',
        color_hex: '#f59e0b',
        description: 'Plan premium',
        price_monthly: '100000',
        price_semiannual: '540000',
        price_annual: '1000000',
        signup_fee: '250000',
        is_popular: true,
        modules,
    },
];

const baseProps = {
    currentPlan: {
        id: 1,
        name: 'Oro',
        color_hex: '#f59e0b',
        description: 'Plan premium',
        modules,
        limits: { services: 5, gallery: 10 },
    },
    daysRemaining: 20,
    planExpiresAt: '19/10/2026',
    billingCycle: 'monthly',
    usage: { services: 2, gallery: 3 },
    availablePlans,
    pendingInvoices: [],
};

describe('Associate/Billing Index', () => {
    it('muestra el plan actual con módulos reales y la cuota inicial', () => {
        render(<BillingIndex {...baseProps} subscriptionStatus="active" />);

        expect(screen.getAllByText('Oro').length).toBeGreaterThanOrEqual(1);
        expect(
            screen.getAllByText('Galería de fotos').length,
        ).toBeGreaterThanOrEqual(1);
        expect(
            screen.getAllByText('Cuota inicial').length,
        ).toBeGreaterThanOrEqual(1);
        // Módulo próximamente marcado.
        expect(screen.getAllByText('Pronto').length).toBeGreaterThanOrEqual(1);
    });

    it('un vencido ve el aviso y el botón de pagar', () => {
        render(
            <BillingIndex
                {...baseProps}
                subscriptionStatus="expired"
                daysRemaining={0}
            />,
        );

        expect(screen.getByText(/tu suscripción venció/i)).toBeInTheDocument();
        expect(
            screen.getAllByRole('link', {
                name: /pagar ahora|renovar mi plan/i,
            }).length,
        ).toBeGreaterThanOrEqual(1);
    });
});
