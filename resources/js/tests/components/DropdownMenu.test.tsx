import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/base/DropdownMenu';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('DropdownMenu (base)', () => {
    it('renderiza el trigger cerrado sin mostrar el contenido', () => {
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Abrir</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Mi perfil</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );
        expect(screen.getByText('Abrir')).toBeInTheDocument();
        expect(screen.queryByText('Mi perfil')).not.toBeInTheDocument();
    });

    it('con defaultOpen muestra label, ítems y separador', () => {
        render(
            <DropdownMenu defaultOpen>
                <DropdownMenuTrigger>Cuenta</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                    <DropdownMenuItem>Mi perfil</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                        Salir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );
        expect(screen.getByText('Mi cuenta')).toBeInTheDocument();
        expect(screen.getByText('Mi perfil')).toBeInTheDocument();

        const salir = screen
            .getByText('Salir')
            .closest('[data-slot="dropdown-menu-item"]');
        expect(salir).toHaveAttribute('data-variant', 'destructive');
    });
});
