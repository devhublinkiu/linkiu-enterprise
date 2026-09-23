import { Alert, AlertDescription, AlertTitle } from '@/Components/base/Alert';
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
    FieldLabel,
} from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import { Spinner } from '@/Components/base/Spinner';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import * as React from 'react';

// Paso 1 del registro: correo. Verifica disponibilidad y envía el código OTP.
export function EmailStep({ onSent }: { onSent: (email: string) => void }) {
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [taken, setTaken] = React.useState(false);

    const submit: React.FormEventHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setTaken(false);

        // El correo se maneja en minúsculas en todo el flujo (backend incluido);
        // lo normalizamos aquí para que el OTP, el correo mostrado y la cuenta coincidan.
        const normalized = email.trim().toLowerCase();

        try {
            await axios.post(route('register.otp'), { email: normalized });
            onSent(normalized);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                if (
                    err.response.status === 422 &&
                    err.response.data?.available === false
                ) {
                    setTaken(true);
                } else if (err.response.status === 429) {
                    const secs = err.response.data?.cooldown ?? 0;
                    setError(
                        `Demasiados intentos. Inténtalo de nuevo en ${secs} segundos.`,
                    );
                } else if (err.response.status === 422) {
                    setError('Ingresa un correo electrónico válido.');
                } else {
                    setError(
                        'No pudimos enviar el código. Inténtalo de nuevo.',
                    );
                }
            } else {
                setError('No pudimos enviar el código. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Crea tu cuenta</CardTitle>
                <CardDescription>
                    Escribe tu correo para iniciar tu afiliación.
                </CardDescription>
            </CardHeader>
            <form
                onSubmit={submit}
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-invalid={taken || !!error}
                            required
                            autoFocus
                        />
                        {error && <FieldError>{error}</FieldError>}
                        {taken && (
                            <Alert variant="warning" className="mt-1">
                                <AlertTitle>Ya tienes una cuenta</AlertTitle>
                                <AlertDescription>
                                    Este correo ya está registrado.{' '}
                                    <Link href={route('login')}>
                                        Inicia sesión
                                    </Link>
                                    .
                                </AlertDescription>
                            </Alert>
                        )}
                        {!error && !taken && (
                            <FieldDescription>
                                Te enviaremos un código de verificación.
                            </FieldDescription>
                        )}
                    </Field>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Spinner data-icon="inline-start" />}
                        Continuar
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
