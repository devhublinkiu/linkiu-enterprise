import { AuthLogo } from '@/Components/AuthLogo';
import { Alert, AlertDescription } from '@/Components/base/Alert';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Checkbox } from '@/Components/base/Checkbox';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import { Label } from '@/Components/base/Label';
import { Spinner } from '@/Components/base/Spinner';
import { Head, Link, useForm } from '@inertiajs/react';
import { Info } from 'lucide-react';
import * as React from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    React.useEffect(() => {
        return () => {
            reset('password');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login.store'));
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 font-sans antialiased">
            <Head title="Iniciar sesión" />

            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center gap-3 text-center">
                    <AuthLogo />
                    <p className="text-small text-muted-foreground">
                        Ingresa tus credenciales para continuar.
                    </p>
                </div>

                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Entrada al portal</CardTitle>
                        <CardDescription>
                            Solo personal autorizado.
                        </CardDescription>
                    </CardHeader>
                    <form
                        onSubmit={submit}
                        className="flex flex-col gap-[var(--card-spacing)]"
                    >
                        <CardContent>
                            <FieldGroup>
                                {status && (
                                    <Alert>
                                        <Info />
                                        <AlertDescription>
                                            {status}
                                        </AlertDescription>
                                    </Alert>
                                )}

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
                                        aria-invalid={!!errors.email}
                                        required
                                        autoFocus
                                    />
                                    {errors.email && (
                                        <FieldError>{errors.email}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <div className="flex items-center justify-between">
                                        <FieldLabel htmlFor="password">
                                            Contraseña
                                        </FieldLabel>
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-small text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </Link>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        aria-invalid={!!errors.password}
                                        required
                                    />
                                    {errors.password && (
                                        <FieldError>
                                            {errors.password}
                                        </FieldError>
                                    )}
                                </Field>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(v) =>
                                            setData('remember', v === true)
                                        }
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="font-normal text-muted-foreground"
                                    >
                                        Recordar mi sesión
                                    </Label>
                                </div>
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
                                Iniciar sesión
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <div className="text-center text-small text-muted-foreground">
                    ¿No tienes una cuenta?{' '}
                    <Link
                        href={route('register')}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        Regístrate
                    </Link>
                </div>
            </div>
        </div>
    );
}
