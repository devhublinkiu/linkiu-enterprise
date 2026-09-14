import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/base/Pagination';

describe('Pagination (base)', () => {
    it('marca la página activa con aria-current y navega con etiquetas en español', () => {
        render(
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="/p/1" />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="/p/2" isActive>
                            2
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="/p/3" />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>,
        );

        expect(
            screen.getByRole('navigation', { name: 'Paginación' }),
        ).toBeInTheDocument();
        expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
        expect(
            screen.getByRole('link', { name: 'Ir a la página anterior' }),
        ).toHaveAttribute('href', '/p/1');
        expect(
            screen.getByRole('link', { name: 'Ir a la página siguiente' }),
        ).toHaveAttribute('href', '/p/3');
    });
});
