import { render, screen } from '@testing-library/react';
import { Building, type LucideIcon } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import {
    hrefToPath,
    matchBreadcrumbs,
} from '@/Components/AppSidebar/parts/breadcrumbs';
import type { NavItem } from '@/Components/AppSidebar/parts/nav-items';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/Components/base/Breadcrumb';

const icon = Building as LucideIcon;

const items: NavItem[] = [
    { name: 'Dashboard', icon, href: '/panel' },
    {
        name: 'Mi empresa',
        icon,
        children: [
            { name: 'Información Básica', href: '/company/basic' },
            { name: 'Contactos', href: '/company/contacts' },
        ],
    },
    { name: 'Galería de Fotos', icon, href: '/company/gallery' },
    { name: 'Sin ruta', icon, href: '#' },
];

describe('matchBreadcrumbs', () => {
    it('devuelve grupo + página para una ruta hija', () => {
        expect(matchBreadcrumbs('/company/contacts', items, '/panel')).toEqual([
            { label: 'Mi empresa' },
            { label: 'Contactos' },
        ]);
    });

    it('devuelve solo la página para un ítem de primer nivel', () => {
        expect(matchBreadcrumbs('/company/gallery', items, '/panel')).toEqual([
            { label: 'Galería de Fotos' },
        ]);
    });

    it('ignora la query string y la barra final', () => {
        expect(
            matchBreadcrumbs('/company/contacts/?x=1', items, '/panel'),
        ).toEqual([{ label: 'Mi empresa' }, { label: 'Contactos' }]);
    });

    it('excluye el destino de Inicio (no se repite como sección)', () => {
        expect(matchBreadcrumbs('/panel', items, '/panel')).toEqual([]);
    });

    it('sin coincidencia devuelve vacío', () => {
        expect(matchBreadcrumbs('/otra/cosa', items, '/panel')).toEqual([]);
    });

    it('empareja páginas de detalle por prefijo', () => {
        expect(matchBreadcrumbs('/company/gallery/9', items, '/panel')).toEqual(
            [{ label: 'Galería de Fotos' }],
        );
    });

    it('hrefToPath normaliza URL absoluta, query y barra final', () => {
        expect(hrefToPath('https://camepg.test/company/basic/?a=1')).toBe(
            '/company/basic',
        );
    });
});

describe('Breadcrumb (render)', () => {
    it('renderiza enlaces, separador y página actual', () => {
        render(
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/panel">Inicio</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Contactos</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>,
        );
        expect(screen.getByText('Inicio')).toHaveAttribute('href', '/panel');
        expect(screen.getByText('Contactos')).toHaveAttribute(
            'aria-current',
            'page',
        );
    });
});
