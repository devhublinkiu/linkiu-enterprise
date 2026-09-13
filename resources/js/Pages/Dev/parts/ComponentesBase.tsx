import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from '@/Components/base/Alert';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Checkbox } from '@/Components/base/Checkbox';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/Components/base/InputOTP';
import { Label } from '@/Components/base/Label';
import { Separator } from '@/Components/base/Separator';
import { Spinner } from '@/Components/base/Spinner';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
    ArrowUpRight,
    CircleAlert,
    CircleCheck,
    Info,
    Mail,
    TriangleAlert,
} from 'lucide-react';
import * as React from 'react';

// Componentes de @/Components/base/ en uso, con sus variantes. Se va llenando
// a medida que se crean (orden-componentes.md).
export default function ComponentesBase() {
    const [acepta, setAcepta] = React.useState(true);
    const [otp, setOtp] = React.useState('');

    return (
        <section className="space-y-6">
            <h2 className="font-display text-h2">Componentes</h2>

            {/* Label */}
            <div className="space-y-3 rounded-lg border p-5">
                <p className="text-small font-medium">Label</p>
                <div className="space-y-3">
                    <Label htmlFor="demo-correo">Correo electrónico</Label>
                    <Label htmlFor="demo-icono">
                        <Mail className="size-4" />
                        Con ícono
                    </Label>
                </div>
            </div>

            {/* Input */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Input</p>
                <div className="grid max-w-sm gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="demo-basico">Básico</Label>
                        <Input id="demo-basico" placeholder="Escribe algo" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="demo-email">Correo electrónico</Label>
                        <Input
                            id="demo-email"
                            type="email"
                            placeholder="nombre@ejemplo.com"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="demo-invalido">Con error</Label>
                        <Input
                            id="demo-invalido"
                            placeholder="Campo inválido"
                            aria-invalid
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="demo-deshabilitado">
                            Deshabilitado
                        </Label>
                        <Input
                            id="demo-deshabilitado"
                            placeholder="No editable"
                            disabled
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="demo-archivo">Archivo</Label>
                        <Input id="demo-archivo" type="file" />
                    </div>
                </div>
            </div>

            {/* Spinner */}
            <div className="space-y-3 rounded-lg border p-5">
                <p className="text-small font-medium">Spinner</p>
                <div className="flex items-center gap-6">
                    <Spinner className="size-3" />
                    <Spinner className="size-4" />
                    <Spinner className="size-6" />
                    <Spinner className="size-8" />
                </div>
            </div>

            {/* Separator */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Separator</p>
                <div className="max-w-sm space-y-2 text-sm">
                    <p>Perfil de la empresa</p>
                    <Separator />
                    <p className="text-muted-foreground">
                        Datos visibles en el directorio.
                    </p>
                </div>
                <div className="flex h-5 items-center gap-4 text-sm">
                    <span>Blog</span>
                    <Separator orientation="vertical" />
                    <span>Docs</span>
                    <Separator orientation="vertical" />
                    <span>Contacto</span>
                </div>
            </div>

            {/* Input OTP */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Input OTP</p>

                {/* Controlado, 6 dígitos con separador (patrón registro/recuperación) */}
                <div className="space-y-2">
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
                    <p className="text-small text-muted-foreground">
                        {otp === ''
                            ? 'Escribe el código de verificación.'
                            : `Código: ${otp}`}
                    </p>
                </div>

                {/* Estado inválido */}
                <InputOTP maxLength={4} value="0000" onChange={() => {}}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} aria-invalid />
                        <InputOTPSlot index={1} aria-invalid />
                        <InputOTPSlot index={2} aria-invalid />
                        <InputOTPSlot index={3} aria-invalid />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            {/* Button */}
            <div className="space-y-5 rounded-lg border p-5">
                <p className="text-small font-medium">Button</p>

                {/* Variantes */}
                <div className="flex flex-wrap items-center gap-3">
                    <Button>Predeterminado</Button>
                    <Button variant="secondary">Secundario</Button>
                    <Button variant="outline">Contorno</Button>
                    <Button variant="ghost">Fantasma</Button>
                    <Button variant="destructive">Destructivo</Button>
                    <Button variant="link">Enlace</Button>
                </div>

                {/* Tamaños */}
                <div className="flex flex-wrap items-center gap-3">
                    <Button size="xs" variant="outline">
                        Extra pequeño
                    </Button>
                    <Button size="sm" variant="outline">
                        Pequeño
                    </Button>
                    <Button variant="outline">Normal</Button>
                    <Button size="lg" variant="outline">
                        Grande
                    </Button>
                </div>

                {/* Íconos */}
                <div className="flex flex-wrap items-center gap-3">
                    <Button size="icon-xs" variant="outline" aria-label="Abrir">
                        <ArrowUpRight />
                    </Button>
                    <Button size="icon-sm" variant="outline" aria-label="Abrir">
                        <ArrowUpRight />
                    </Button>
                    <Button size="icon" variant="outline" aria-label="Abrir">
                        <ArrowUpRight />
                    </Button>
                    <Button size="icon-lg" variant="outline" aria-label="Abrir">
                        <ArrowUpRight />
                    </Button>
                    <Button variant="outline">
                        <Mail data-icon="inline-start" />
                        Con ícono
                    </Button>
                </div>

                {/* Estados: loading (conecta Spinner) y deshabilitado */}
                <div className="flex flex-wrap items-center gap-3">
                    <Button disabled>
                        <Spinner data-icon="inline-start" />
                        Cargando…
                    </Button>
                    <Button variant="outline" disabled>
                        <Spinner data-icon="inline-start" />
                        Procesando
                    </Button>
                    <Button disabled>Deshabilitado</Button>
                    <Button asChild>
                        <a href="#">Como enlace (asChild)</a>
                    </Button>
                </div>
            </div>

            {/* Checkbox */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Checkbox</p>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="chk-controlado"
                            checked={acepta}
                            onCheckedChange={(v) => setAcepta(v === true)}
                        />
                        <Label htmlFor="chk-controlado">
                            Acepto los términos y condiciones
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="chk-default" defaultChecked />
                        <Label htmlFor="chk-default">Marcado por defecto</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="chk-invalido" aria-invalid />
                        <Label htmlFor="chk-invalido">Con error</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="chk-deshabilitado" disabled />
                        <Label htmlFor="chk-deshabilitado">Deshabilitado</Label>
                    </div>
                </div>
            </div>

            {/* Field */}
            <div className="space-y-5 rounded-lg border p-5">
                <p className="text-small font-medium">Field</p>

                <FieldSet className="max-w-sm">
                    <FieldLegend>Datos de la empresa</FieldLegend>
                    <FieldDescription>
                        Esta información aparece en el directorio público.
                    </FieldDescription>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="fld-nombre">
                                Nombre comercial
                            </FieldLabel>
                            <Input
                                id="fld-nombre"
                                placeholder="Minera del Norte S.A.S."
                            />
                            <FieldDescription>
                                Como quieres que te vean los demás asociados.
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="fld-nit">NIT</FieldLabel>
                            <Input id="fld-nit" aria-invalid />
                            <FieldError>Ingresa un NIT válido.</FieldError>
                        </Field>

                        <FieldSeparator />

                        <Field orientation="horizontal">
                            <Checkbox id="fld-terminos" defaultChecked />
                            <FieldLabel htmlFor="fld-terminos">
                                Acepto los términos y condiciones
                            </FieldLabel>
                        </Field>

                        {/* Field deshabilitado: atenúa el checkbox vía group/field */}
                        <Field
                            orientation="horizontal"
                            data-disabled="true"
                            className="group"
                        >
                            <Checkbox id="fld-noti" disabled />
                            <FieldLabel htmlFor="fld-noti">
                                Recibir notificaciones (deshabilitado)
                            </FieldLabel>
                        </Field>
                    </FieldGroup>
                </FieldSet>
            </div>

            {/* Card */}
            <div className="space-y-5 rounded-lg border p-5">
                <p className="text-small font-medium">Card</p>
                <div className="flex flex-wrap items-start gap-6">
                    {/* Card de login (adelanto de Corte 3) */}
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>Ingresa a tu cuenta</CardTitle>
                            <CardDescription>
                                Escribe tu correo para continuar.
                            </CardDescription>
                            <CardAction>
                                <Button variant="link">Regístrate</Button>
                            </CardAction>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="card-correo">
                                        Correo electrónico
                                    </FieldLabel>
                                    <Input
                                        id="card-correo"
                                        type="email"
                                        placeholder="nombre@ejemplo.com"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="card-clave">
                                        Contraseña
                                    </FieldLabel>
                                    <Input id="card-clave" type="password" />
                                </Field>
                            </FieldGroup>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <Button className="w-full">Ingresar</Button>
                            <Button variant="outline" className="w-full">
                                Ingresar con Google
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Tamaño sm */}
                    <Card size="sm" className="w-full max-w-xs">
                        <CardHeader>
                            <CardTitle>Card pequeña</CardTitle>
                            <CardDescription>
                                Variante compacta (size="sm").
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Menos espaciado interno mediante el token
                                --card-spacing.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                Acción
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Alert */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Alert</p>
                <div className="grid max-w-md gap-3">
                    <Alert>
                        <Info />
                        <AlertTitle>Información</AlertTitle>
                        <AlertDescription>
                            Tu perfil está en revisión por el equipo de CAMEP.
                        </AlertDescription>
                    </Alert>

                    <Alert variant="success">
                        <CircleCheck />
                        <AlertTitle>Aprobado</AlertTitle>
                        <AlertDescription>
                            Tu empresa ya aparece en el directorio público.
                        </AlertDescription>
                    </Alert>

                    <Alert variant="warning">
                        <TriangleAlert />
                        <AlertTitle>Tu membresía vence en 3 días.</AlertTitle>
                        <AlertDescription>
                            Renueva para no perder el acceso a los módulos.
                        </AlertDescription>
                    </Alert>

                    <Alert variant="destructive">
                        <CircleAlert />
                        <AlertTitle>No pudimos procesar el pago</AlertTitle>
                        <AlertDescription>
                            Revisa tu medio de pago e inténtalo de nuevo.
                        </AlertDescription>
                    </Alert>

                    {/* Con acción */}
                    <Alert>
                        <AlertTitle>
                            Ya está disponible el modo foros
                        </AlertTitle>
                        <AlertDescription>
                            Actívalo desde la configuración de tu cuenta.
                        </AlertDescription>
                        <AlertAction>
                            <Button size="xs">Activar</Button>
                        </AlertAction>
                    </Alert>
                </div>
            </div>
        </section>
    );
}
