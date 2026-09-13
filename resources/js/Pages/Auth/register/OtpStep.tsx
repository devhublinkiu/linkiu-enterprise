import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Field, FieldDescription, FieldError } from '@/Components/base/Field';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/Components/base/InputOTP';
import { Spinner } from '@/Components/base/Spinner';
import axios from 'axios';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { RefreshCw } from 'lucide-react';
import * as React from 'react';

// Paso 2 del registro: verificar el código OTP. Reenvío con cooldown.
export function OtpStep({
    email,
    onVerified,
    onBack,
}: {
    email: string;
    onVerified: () => void;
    onBack: () => void;
}) {
    const [code, setCode] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [resending, setResending] = React.useState(false);
    const [cooldown, setCooldown] = React.useState(30);

    React.useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const verify: React.FormEventHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(route('register.otp.verify'), { email, code });
            onVerified();
        } catch {
            setError('El código es inválido o venció. Solicita uno nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        setResending(true);
        setError(null);
        try {
            await axios.post(route('register.otp'), { email });
            setCooldown(30);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 429) {
                setCooldown(err.response.data?.cooldown ?? 1800);
                setError(
                    'Alcanzaste el límite de envíos. Espera para volver a intentar.',
                );
            } else {
                setError('No pudimos reenviar el código.');
            }
        } finally {
            setResending(false);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Verifica tu correo</CardTitle>
                <CardDescription>
                    Escribe el código que enviamos a{' '}
                    <span className="font-medium">{email}</span>.
                </CardDescription>
            </CardHeader>
            <form
                onSubmit={verify}
                className="flex flex-col gap-[var(--card-spacing)]"
            >
                <CardContent>
                    <Field>
                        <InputOTP
                            maxLength={6}
                            value={code}
                            onChange={setCode}
                            pattern={REGEXP_ONLY_DIGITS}
                            autoFocus
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                        {error && <FieldError>{error}</FieldError>}
                        <FieldDescription>
                            <button
                                type="button"
                                onClick={resend}
                                disabled={resending || cooldown > 0}
                                className="inline-flex items-center gap-1 underline underline-offset-4 disabled:no-underline disabled:opacity-60"
                            >
                                <RefreshCw className="size-3.5" />
                                {cooldown > 0
                                    ? `Reenviar código (${cooldown}s)`
                                    : 'Reenviar código'}
                            </button>
                        </FieldDescription>
                    </Field>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || code.length < 6}
                    >
                        {loading && <Spinner data-icon="inline-start" />}
                        Verificar
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={onBack}
                    >
                        Usar otro correo
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
