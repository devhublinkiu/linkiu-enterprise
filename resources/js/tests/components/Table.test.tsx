import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/base/Table';

describe('Table (base)', () => {
    it('renderiza encabezados, celdas y caption con la semántica de tabla', () => {
        render(
            <Table>
                <TableCaption>Servicios</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Servicio</TableHead>
                        <TableHead>Categoría</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Consultoría</TableCell>
                        <TableCell>Ambiental</TableCell>
                    </TableRow>
                </TableBody>
            </Table>,
        );

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(
            screen.getByRole('columnheader', { name: 'Servicio' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('cell', { name: 'Consultoría' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Servicios')).toBeInTheDocument();
    });
});
