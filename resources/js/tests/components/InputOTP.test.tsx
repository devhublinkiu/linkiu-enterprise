import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/Components/base/InputOTP';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('InputOTP (base)', () => {
    it('renderiza el contenedor, los slots y el separador', () => {
        const { container } = render(
            <InputOTP maxLength={4}>
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                </InputOTPGroup>
            </InputOTP>,
        );

        expect(
            container.querySelector('[data-slot="input-otp"]'),
        ).not.toBeNull();
        expect(
            container.querySelectorAll('[data-slot="input-otp-slot"]'),
        ).toHaveLength(4);
        expect(
            container.querySelector('[data-slot="input-otp-separator"]'),
        ).not.toBeNull();
    });
});
