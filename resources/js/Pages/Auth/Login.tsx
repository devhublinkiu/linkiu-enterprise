import { useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import { ShieldCheck } from 'lucide-react';
import { PageProps } from '@/types';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { tenant } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login.store'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 antialiased font-sans">
            <Head title="Iniciar Sesión" />

            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="mb-4">
                        <img
                            src="/images/camep/logo_camep_vertical_auth.svg"
                            alt="Logo"
                            className="h-20 w-auto object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const icon = document.createElement('div');
                                icon.className = "h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-sm";
                                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>';
                                (e.target as HTMLImageElement).parentElement?.appendChild(icon);
                            }}
                        />
                    </div>
                    <p className="text-sm text-slate-500">
                        Ingresa tus credenciales para continuar
                    </p>
                </div>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Entrada al portal</CardTitle>
                        <CardDescription>
                            Solo personal autorizado
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="grid gap-4">
                            {status && (
                                <div className="p-3 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-900 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    {status}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    required
                                    autoFocus
                                />
                                {errors.email && <span className="text-xs font-medium text-red-600">{errors.email}</span>}
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Contraseña</Label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs text-slate-500 hover:text-slate-900 transition-colors underline-offset-4 hover:underline"
                                        >
                                            ¿Olvidaste tu clave?
                                        </Link>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    required
                                />
                                {errors.password && <span className="text-xs font-medium text-red-600">{errors.password}</span>}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="h-4 w-4 rounded border-slate-200 text-slate-900 focus:ring-slate-950"
                                    checked={data.remember}
                                    onChange={(e) => setData("remember", e.target.checked)}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-xs font-normal text-slate-500 cursor-pointer"
                                >
                                    Recordar mi sesión
                                </Label>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-slate-900 hover:bg-slate-800" type="submit" disabled={processing}>
                                {processing ? "Iniciando sesión..." : "Iniciar Sesión"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <div className="px-8 text-center text-xs text-slate-500 leading-relaxed">
                    Al continuar, aceptas nuestros{" "}
                    <Link href="#" className="underline underline-offset-4 hover:text-slate-900">
                        Términos de Servicio
                    </Link>{" "}
                    y{" "}
                    <Link href="#" className="underline underline-offset-4 hover:text-slate-900">
                        Política de Privacidad
                    </Link>.
                </div>
            </div>
        </div>
    );
}
