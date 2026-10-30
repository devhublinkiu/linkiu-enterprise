import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/Components/base/InputOTP';
import { Spinner } from '@/Components/base/Spinner';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import * as React from 'react';

// Paso 3 del registro: nombre y contraseña. Crea la cuenta (correo ya verificado).
export function DetailsStep({ email }: { email: string }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: '',
        email,
        password: '',
        password_confirmation: '',
    });

    // Si el correo quedó sin verificar (p. ej. el código caducó mientras llenaba
    // el formulario), ofrecemos reenviar y verificar de nuevo aquí mismo, sin
    // perder el nombre ni la contraseña (2.A.2).
    const needsReverify =
        errors.email?.toLowerCase().includes('verificar tu correo') ?? false;
    const [otp, setOtp] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [note, setNote] = React.useState<string | null>(null);
    const [sent, setSent] = React.useState(false);
    const [reverified, setReverified] = React.useState(false);

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register.store'));
    };

    const resend = async () => {
        setBusy(true);
        setNote(null);
        try {
            await axios.post(route('register.otp'), { email });
            setSent(true);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 429) {
                setNote('Alcanzaste el límite de envíos. Espera unos minutos.');
            } else {
                setNote('No pudimos reenviar el código.');
            }
        } finally {
            setBusy(false);
        }
    };

    const reverify = async () => {
        setBusy(true);
        setNote(null);
        try {
            await axios.post(route('register.otp.verify'), {
                email,
                code: otp,
            });
            setReverified(true);
            clearErrors('email');
        } catch {
            setNote('El código es inválido o venció. Solicita uno nuevo.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Completa tu registro</CardTitle>
                <CardDescription>
                    Verificamos <span className="font-medium">{email}</span>.
                    Define tus datos de acceso.
                </CardDescription>
            </CardHeader>
            <form
                onSubmit={submit}
                className="flex flex-col gap-[var(--card-spacing)]"
            >
                <CardContent>
                    <FieldGroup>
                        {errors.email && !reverified && (
                            <FieldError>Correo: {errors.email}</FieldError>
                        )}

                        {/* Re-verificación en línea si el correo quedó sin verificar */}
                        {needsReverify && !reverified && (
                            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
                                <p className="text-small text-muted-foreground">
                                    Reenvía el código y verifícalo de nuevo para
                                    continuar. No pierdes lo que ya escribiste.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={resend}
                                    disabled={busy}
                                >
                                    <RefreshCw className="size-4" />
                                    {sent
                                        ? 'Reenviar de nuevo'
                                        : 'Reenviar código'}
                                </Button>
                                {sent && (
                                    <p className="text-small text-muted-foreground">
                                        Te enviamos un código nuevo a tu correo.
                                    </p>
                                )}
                                <div className="flex flex-col items-center gap-2">
                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={setOtp}
                                        pattern={REGEXP_ONLY_DIGITS}
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
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="w-full"
                                        onClick={reverify}
                                        disabled={busy || otp.length < 6}
                                    >
                                        {busy && (
                                            <Spinner data-icon="inline-start" />
                                        )}
                                        Verificar código
                                    </Button>
                                </div>
                                {note && (
                                    <p className="text-small text-destructive">
                                        {note}
                                    </p>
                                )}
                            </div>
                        )}

                        {reverified && (
                            <p className="flex items-center gap-1.5 text-small text-primary">
                                <CheckCircle2 className="size-4" />
                                Correo verificado. Vuelve a tocar «Crear
                                cuenta».
                            </p>
                        )}

                        <Field>
                            <FieldLabel htmlFor="name">
                                Nombre completo
                            </FieldLabel>
                            <Input
                                id="name"
                                type="text"
                                autoComplete="name"
                                placeholder="Juan Pérez"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                aria-invalid={!!errors.name}
                                required
                                autoFocus
                            />
                            {errors.name && (
                                <FieldError>{errors.name}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">
                                Contraseña
                            </FieldLabel>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                aria-invalid={!!errors.password}
                                required
                            />
                            {errors.password ? (
                                <FieldError>{errors.password}</FieldError>
                            ) : (
                                <FieldDescription>
                                    Mínimo 8 caracteres.
                                </FieldDescription>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password_confirmation">
                                Confirmar contraseña
                            </FieldLabel>
                            <Input
                                id="password_confirmation"
                                type="password"
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                        </Field>
                    </FieldGroup>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={processing}
                    >
                        {processing && <Spinner data-icon="inline-start" />}
                        Crear cuenta
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
