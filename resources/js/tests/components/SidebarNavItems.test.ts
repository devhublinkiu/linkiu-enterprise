import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildAssociateItems } from '@/Components/AppSidebar/parts/nav-items';

beforeEach(() => {
    vi.stubGlobal('route', (name: string) => `/${name}`);
});

const locks = {
    isCompanyLocked: false,
    isGeneralLocked: false,
    isBillingLocked: false,
    isAfiliacionLocked: false,
    bienesServiciosLocked: false,
    anunciosLocked: false,
    unreadInvoices: 0,
};

describe('buildAssociateItems', () => {
    it('ya no incluye Soporte Técnico', () => {
        const items = buildAssociateItems(locks);
        expect(items.some((i) => i.name === 'Soporte Técnico')).toBe(false);
    });

    it('marca EmpleAmep, Reseñas y Ranking como próximamente (soon)', () => {
        const items = buildAssociateItems(locks);
        const empleamep = items.find((i) => i.name === 'EmpleAmep');
        const resenas = items.find((i) => i.name === 'Reseñas');
        const ranking = items.find((i) => i.name === 'Mi Ranking');

        expect(empleamep?.soon).toBe(true);
        expect(resenas?.soon).toBe(true);
        expect(ranking?.soon).toBe(true);
        // Un "próximamente" no debe quedar además marcado como bloqueado.
        expect(empleamep?.locked).toBeFalsy();
    });

    it('bloquea "Anuncios y Licitaciones" cuando el plan no incluye anuncios', () => {
        const abierto = buildAssociateItems(locks);
        expect(
            abierto.find((i) => i.name === 'Anuncios y Licitaciones')?.locked,
        ).toBe(false);

        const bloqueado = buildAssociateItems({
            ...locks,
            anunciosLocked: true,
        });
        expect(
            bloqueado.find((i) => i.name === 'Anuncios y Licitaciones')?.locked,
        ).toBe(true);
    });
});
