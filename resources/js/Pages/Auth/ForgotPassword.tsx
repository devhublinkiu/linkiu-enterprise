import { AuthLogo } from '@/Components/AuthLogo';
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
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import * as React from 'react';

type Step = 'email' | 'reset';

export default function ForgotPassword() {
    const [step, setStep] = React.useState<Step>('email');
    const [sending, setSending] = React.useState(false);
    const [notice, setNotice] = React.useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        code: '',
        password: '',
        password_confirmation: '',
    });

    const sendCode: React.FormEventHandler = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await axios.post(route('password.email'), {
                email: data.email,
            });
            setNotice(
                res.data?.message ??
                    'Si el correo está registrado, te enviamos un código.',
            );
            setStep('reset');
        } catch {
            setNotice('No pudimos procesar la solicitud. Inténtalo de nuevo.');
        } finally {
            setSending(false);
        }
    };

    const reset: React.FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.update'));
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 font-sans antialiased">
            <Head title="Recuperar contraseña" />

            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center gap-3 text-center">
                    <AuthLogo />
                    <p className="text-small text-muted-foreground">
                        Recupera el acceso a tu cuenta.
                    </p>
                </div>

                {step === 'email' ? (
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
                            <CardDescription>
                                Escribe tu correo y te enviaremos un código.
                            </CardDescription>
                        </CardHeader>
                        <form
                            onSubmit={sendCode}
                            className="flex flex-col gap-[var(--card-spacing)]"
                        >
                            <CardContent>
                                <Field>
                                    <FieldLabel htmlFor="email">
                                        Correo electrónico
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="nombre@ejemplo.com"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                        autoFocus
                                    />
                                </Field>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={sending}
                                >
                                    {sending && (
                                        <Spinner data-icon="inline-start" />
                                    )}
                                    Enviar código
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                ) : (
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>Restablece tu contraseña</CardTitle>
                            <CardDescription>{notice}</CardDescription>
                        </CardHeader>
                        <form
                            onSubmit={reset}
                            className="flex flex-col gap-[var(--card-spacing)]"
                        >
                            <CardContent>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>
                                            Código de verificación
                                        </FieldLabel>
                                        <InputOTP
                                            maxLength={6}
                                            value={data.code}
                                            onChange={(v) => setData('code', v)}
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
                                        {errors.code && (
                                            <FieldError>
                                                {errors.code}
                                            </FieldError>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="password">
                                            Nueva contraseña
                                        </FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            autoComplete="new-password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            aria-invalid={!!errors.password}
                                            required
                                        />
                                        {errors.password ? (
                                            <FieldError>
                                                {errors.password}
                                            </FieldError>
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

                                    {errors.email && (
                                        <FieldError>{errors.email}</FieldError>
                                    )}
                                </FieldGroup>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <Spinner data-icon="inline-start" />
                                    )}
                                    Cambiar contraseña
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}

                <div className="text-center text-small text-muted-foreground">
                    <Link
                        href={route('login')}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        Volver a iniciar sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
