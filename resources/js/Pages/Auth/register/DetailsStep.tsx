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
import { Spinner } from '@/Components/base/Spinner';
import { useForm } from '@inertiajs/react';
import * as React from 'react';

// Paso 3 del registro: nombre y contraseña. Crea la cuenta (correo ya verificado).
export function DetailsStep({ email }: { email: string }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email,
        password: '',
        password_confirmation: '',
    });

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register.store'));
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
                        {errors.email && (
                            <FieldError>Correo: {errors.email}</FieldError>
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
