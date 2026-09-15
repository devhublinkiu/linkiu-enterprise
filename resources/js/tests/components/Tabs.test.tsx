import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/base/Tabs';

describe('base/Tabs', () => {
    it('renderiza los triggers y el contenido activo por defecto', () => {
        render(
            <Tabs defaultValue="a">
                <TabsList>
                    <TabsTrigger value="a">Uno</TabsTrigger>
                    <TabsTrigger value="b">Dos</TabsTrigger>
                </TabsList>
                <TabsContent value="a">Contenido A</TabsContent>
                <TabsContent value="b">Contenido B</TabsContent>
            </Tabs>,
        );

        expect(screen.getByRole('tab', { name: 'Uno' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Dos' })).toBeInTheDocument();
        // El contenido activo se muestra; el inactivo no se monta.
        expect(screen.getByText('Contenido A')).toBeInTheDocument();
        expect(screen.queryByText('Contenido B')).toBeNull();
    });
});
