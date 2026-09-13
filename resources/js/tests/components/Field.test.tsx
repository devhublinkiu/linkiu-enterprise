import { Field, FieldError, FieldLabel } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Field (base)', () => {
    it('Field expone role group y data-orientation', () => {
        render(
            <Field orientation="horizontal">
                <FieldLabel htmlFor="x">Etiqueta</FieldLabel>
                <Input id="x" />
            </Field>,
        );
        const group = screen.getByRole('group');
        expect(group).toHaveAttribute('data-orientation', 'horizontal');
        expect(group).toHaveAttribute('data-slot', 'field');
    });

    it('FieldError muestra el mensaje (children) con role alert', () => {
        render(<FieldError>Campo obligatorio</FieldError>);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Campo obligatorio');
    });

    it('FieldError no renderiza nada sin children ni errores', () => {
        const { container } = render(<FieldError />);
        expect(container).toBeEmptyDOMElement();
    });

    it('FieldError deduplica y lista múltiples errores', () => {
        render(
            <FieldError
                errors={[
                    { message: 'Muy corto' },
                    { message: 'Muy corto' },
                    { message: 'Sin números' },
                ]}
            />,
        );
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
});
