import { Separator } from '@/Components/base/Separator';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Separator (base)', () => {
    it('por defecto es horizontal y decorativo (data-slot)', () => {
        const { container } = render(<Separator />);
        const sep = container.querySelector('[data-slot="separator"]');
        expect(sep).not.toBeNull();
        expect(sep).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('acepta orientación vertical', () => {
        render(<Separator orientation="vertical" decorative={false} />);
        // decorative=false → expone role separator accesible
        const sep = screen.getByRole('separator');
        expect(sep).toHaveAttribute('data-orientation', 'vertical');
    });
});
