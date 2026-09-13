import { Skeleton } from '@/Components/base/Skeleton';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('Skeleton (base)', () => {
    it('renderiza con data-slot y respeta className', () => {
        const { container } = render(<Skeleton className="h-4 w-10" />);
        const el = container.querySelector('[data-slot="skeleton"]');
        expect(el).not.toBeNull();
        expect(el).toHaveClass('animate-pulse', 'h-4', 'w-10');
    });
});
