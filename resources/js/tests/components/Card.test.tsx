import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Card (base)', () => {
    it('renderiza la composición con sus data-slot', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Título</CardTitle>
                    <CardDescription>Descripción</CardDescription>
                </CardHeader>
                <CardContent>Contenido</CardContent>
                <CardFooter>Pie</CardFooter>
            </Card>,
        );
        expect(screen.getByText('Título')).toHaveAttribute(
            'data-slot',
            'card-title',
        );
        expect(screen.getByText('Contenido').parentElement).toHaveAttribute(
            'data-slot',
            'card',
        );
    });

    it('refleja el tamaño en data-size', () => {
        render(<Card size="sm">contenido</Card>);
        expect(screen.getByText('contenido')).toHaveAttribute(
            'data-size',
            'sm',
        );
    });

    it('data-size por defecto es "default"', () => {
        render(<Card>x</Card>);
        expect(screen.getByText('x')).toHaveAttribute('data-size', 'default');
    });
});
