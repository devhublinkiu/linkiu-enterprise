import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    useSidebar,
} from '@/Components/base/Sidebar';
import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Sidebar (base)', () => {
    it('renderiza un menú con el botón activo dentro del provider', () => {
        render(
            <SidebarProvider>
                <Sidebar collapsible="none">
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton isActive>
                                        Inicio
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            </SidebarProvider>,
        );
        const btn = screen.getByRole('button', { name: 'Inicio' });
        expect(btn).toHaveAttribute('data-slot', 'sidebar-menu-button');
        expect(btn).toHaveAttribute('data-active', 'true');
    });

    it('useSidebar lanza si se usa fuera del provider', () => {
        expect(() => renderHook(() => useSidebar())).toThrow(/SidebarProvider/);
    });
});
