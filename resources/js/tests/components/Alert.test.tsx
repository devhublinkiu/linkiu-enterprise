import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from '@/Components/base/Alert';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Alert (base)', () => {
    it('renderiza con role alert y sus data-slot', () => {
        render(
            <Alert>
                <AlertTitle>Título</AlertTitle>
                <AlertDescription>Detalle</AlertDescription>
            </Alert>,
        );
        expect(screen.getByRole('alert')).toHaveAttribute('data-slot', 'alert');
        expect(screen.getByText('Título')).toHaveAttribute(
            'data-slot',
            'alert-title',
        );
        expect(screen.getByText('Detalle')).toHaveAttribute(
            'data-slot',
            'alert-description',
        );
    });

    it('la variante destructive aplica el color de error', () => {
        render(<Alert variant="destructive">x</Alert>);
        expect(screen.getByRole('alert').className).toContain(
            'text-destructive',
        );
    });

    it('AlertAction expone su data-slot', () => {
        render(
            <Alert>
                <AlertTitle>t</AlertTitle>
                <AlertAction>
                    <button>Activar</button>
                </AlertAction>
            </Alert>,
        );
        expect(
            screen.getByRole('button', { name: 'Activar' }).parentElement,
        ).toHaveAttribute('data-slot', 'alert-action');
    });
});
