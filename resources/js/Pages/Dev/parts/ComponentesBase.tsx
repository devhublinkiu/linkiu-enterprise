import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from '@/Components/base/Alert';
import {
    Avatar,
    AvatarBadge,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarImage,
} from '@/Components/base/Avatar';
import { Badge } from '@/Components/base/Badge';
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
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/Components/base/Combobox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/base/Dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/Components/base/DropdownMenu';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldTitle,
} from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from '@/Components/base/InputGroup';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/Components/base/InputOTP';
import { Label } from '@/Components/base/Label';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/Components/base/Popover';
import { Progress } from '@/Components/base/Progress';
import { RadioGroup, RadioGroupItem } from '@/Components/base/RadioGroup';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/Components/base/Select';
import { Separator } from '@/Components/base/Separator';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/Components/base/Sheet';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
} from '@/Components/base/Sidebar';
import { Skeleton } from '@/Components/base/Skeleton';
import { Spinner } from '@/Components/base/Spinner';
import { Textarea } from '@/Components/base/Textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/base/Tooltip';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
    ArrowUpRight,
    CircleAlert,
    CircleCheck,
    CreditCard,
    Info,
    LayoutDashboard,
    LogOut,
    Mail,
    Plus,
    Search,
    Settings,
    Trash2,
    TriangleAlert,
    UserCircle,
    Users,
} from 'lucide-react';
import * as React from 'react';

// Componentes de @/Components/base/ en uso, con sus variantes. Se va llenando
// a medida que se crean (orden-componentes.md).
export default function ComponentesBase() {
    const [acepta, setAcepta] = React.useState(true);
    const [otp, setOtp] = React.useState('');
    const [notifPush, setNotifPush] = React.useState(true);
    const [posicion, setPosicion] = React.useState('bottom');
    const [sociedad, setSociedad] = React.useState('');

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

            {/* Tooltip */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Tooltip</p>
                <TooltipProvider>
                    <div className="flex flex-wrap items-center gap-3">
                        {(['top', 'right', 'bottom', 'left'] as const).map(
                            (side) => (
                                <Tooltip key={side}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-fit capitalize"
                                        >
                                            {side}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side={side}>
                                        <p>Aparece en el directorio público.</p>
                                    </TooltipContent>
                                </Tooltip>
                            ),
                        )}
                    </div>
                </TooltipProvider>
            </div>

            {/* Sheet */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Sheet</p>
                <div className="flex flex-wrap items-center gap-3">
                    {(['top', 'right', 'bottom', 'left'] as const).map(
                        (side) => (
                            <Sheet key={side}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="capitalize"
                                    >
                                        {side}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side={side}
                                    className="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]"
                                >
                                    <SheetHeader>
                                        <SheetTitle>Editar perfil</SheetTitle>
                                        <SheetDescription>
                                            Haz los cambios y guarda cuando
                                            termines.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="no-scrollbar overflow-y-auto px-4">
                                        <p className="leading-relaxed text-muted-foreground">
                                            Contenido del panel lateral.
                                        </p>
                                    </div>
                                    <SheetFooter>
                                        <Button>Guardar cambios</Button>
                                        <SheetClose asChild>
                                            <Button variant="outline">
                                                Cancelar
                                            </Button>
                                        </SheetClose>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
                        ),
                    )}
                </div>
            </div>

            {/* Skeleton */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Skeleton</p>
                {/* Avatar + líneas */}
                <div className="flex w-fit items-center gap-4">
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <div className="grid gap-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                    </div>
                </div>
                {/* Bloque de texto */}
                <div className="flex w-full max-w-xs flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>

            {/* Avatar */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Avatar</p>
                {/* Con imagen + fallback (la imagen puede no cargar: muestra la inicial) */}
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage
                            src="/images/camep/logo_camep_horizontal_sidebar.svg"
                            alt="CAMEP"
                        />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar>
                        <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                </div>
                {/* Tamaños: sm · default · lg */}
                <div className="flex items-center gap-3">
                    <Avatar size="sm">
                        <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <Avatar>
                        <AvatarFallback>MD</AvatarFallback>
                    </Avatar>
                    <Avatar size="lg">
                        <AvatarFallback>LG</AvatarFallback>
                    </Avatar>
                </div>
                {/* Con badge (punto) y badge con ícono */}
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarFallback>ON</AvatarFallback>
                        <AvatarBadge className="bg-success" />
                    </Avatar>
                    <Avatar size="lg">
                        <AvatarFallback>PL</AvatarFallback>
                        <AvatarBadge>
                            <Plus />
                        </AvatarBadge>
                    </Avatar>
                </div>
                {/* Grupo con contador */}
                <AvatarGroup>
                    <Avatar>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar>
                        <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <Avatar>
                        <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                    <AvatarGroupCount>+3</AvatarGroupCount>
                </AvatarGroup>
            </div>

            {/* Badge */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Badge</p>
                {/* Variantes */}
                <div className="flex flex-wrap items-center gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="ghost">Ghost</Badge>
                </div>
                {/* Con ícono y como enlace */}
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                        <CircleCheck data-icon="inline-start" />
                        Verificado
                    </Badge>
                    <Badge variant="outline">
                        3 nuevos
                        <ArrowUpRight data-icon="inline-end" />
                    </Badge>
                    <Badge asChild>
                        <a href="#badge-link">
                            Ver más
                            <ArrowUpRight data-icon="inline-end" />
                        </a>
                    </Badge>
                </div>
            </div>

            {/* Dropdown Menu */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Dropdown Menu</p>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Básico + íconos + destructivo */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Mi cuenta</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <UserCircle />
                                Mi perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard />
                                Facturación
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings />
                                Configuración
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive">
                                <LogOut />
                                Salir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Checkbox + Radio + Submenú */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Preferencias</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                            <DropdownMenuLabel>
                                Notificaciones
                            </DropdownMenuLabel>
                            <DropdownMenuCheckboxItem
                                checked={notifPush}
                                onCheckedChange={(v) =>
                                    setNotifPush(v === true)
                                }
                            >
                                Push
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Posición</DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                                value={posicion}
                                onValueChange={setPosicion}
                            >
                                <DropdownMenuRadioItem value="top">
                                    Arriba
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="bottom">
                                    Abajo
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Users />
                                    Invitar
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem>
                                            <Mail />
                                            Por correo
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem variant="destructive">
                                            <Trash2 />
                                            Quitar acceso
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Sidebar</p>
                <SidebarProvider className="min-h-0">
                    <div className="h-96 w-72 overflow-hidden rounded-lg border">
                        <Sidebar collapsible="none" className="h-full">
                            <SidebarHeader>
                                <p className="px-2 font-display text-base font-medium">
                                    CAMEP
                                </p>
                            </SidebarHeader>
                            <SidebarContent>
                                <SidebarGroup>
                                    <SidebarGroupLabel>Panel</SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton isActive>
                                                    <LayoutDashboard />
                                                    <span>Inicio</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton>
                                                    <Users />
                                                    <span>Empresas</span>
                                                </SidebarMenuButton>
                                                <SidebarMenuBadge>
                                                    12
                                                </SidebarMenuBadge>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton>
                                                    <CreditCard />
                                                    <span>Finanzas</span>
                                                </SidebarMenuButton>
                                                <SidebarMenuSub>
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuSubButton href="#">
                                                            Pagos
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                    <SidebarMenuSubItem>
                                                        <SidebarMenuSubButton
                                                            href="#"
                                                            isActive
                                                        >
                                                            Facturación
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                </SidebarMenuSub>
                                            </SidebarMenuItem>
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </SidebarContent>
                            <SidebarFooter>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>
                                            <UserCircle />
                                            <span>Mi perfil</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarFooter>
                        </Sidebar>
                    </div>
                </SidebarProvider>
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

            {/* Select */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Select</p>
                <div className="grid max-w-xs gap-4">
                    {/* Básico (controlado) */}
                    <div className="space-y-1.5">
                        <Label>Tipo de sociedad</Label>
                        <Select value={sociedad} onValueChange={setSociedad}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una opción" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SAS">SAS</SelectItem>
                                <SelectItem value="Ltda.">Ltda.</SelectItem>
                                <SelectItem value="Anónima">Anónima</SelectItem>
                                <SelectItem value="ESAL">ESAL</SelectItem>
                                <SelectItem value="Cooperativa">
                                    Cooperativa
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Con grupos, etiquetas y separador */}
                    <div className="space-y-1.5">
                        <Label>Con grupos</Label>
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una ciudad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Antioquia</SelectLabel>
                                    <SelectItem value="medellin">
                                        Medellín
                                    </SelectItem>
                                    <SelectItem value="envigado">
                                        Envigado
                                    </SelectItem>
                                </SelectGroup>
                                <SelectSeparator />
                                <SelectGroup>
                                    <SelectLabel>Meta</SelectLabel>
                                    <SelectItem value="villavicencio">
                                        Villavicencio
                                    </SelectItem>
                                    <SelectItem value="pto-gaitan">
                                        Puerto Gaitán
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tamaño sm + ítem deshabilitado */}
                    <div className="space-y-1.5">
                        <Label>Tamaño sm</Label>
                        <Select>
                            <SelectTrigger size="sm" className="w-full">
                                <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="a">Opción A</SelectItem>
                                <SelectItem value="b" disabled>
                                    Opción B (deshabilitada)
                                </SelectItem>
                                <SelectItem value="c">Opción C</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Deshabilitado */}
                    <div className="space-y-1.5">
                        <Label>Deshabilitado</Label>
                        <Select disabled>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="No disponible" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="x">Opción</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Estado inválido con Field */}
                    <Field data-invalid>
                        <FieldLabel>País de origen</FieldLabel>
                        <Select>
                            <SelectTrigger aria-invalid className="w-full">
                                <SelectValue placeholder="Selecciona un país" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="co">Colombia</SelectItem>
                                <SelectItem value="pe">Perú</SelectItem>
                                <SelectItem value="ec">Ecuador</SelectItem>
                            </SelectContent>
                        </Select>
                        <FieldError>Selecciona un país.</FieldError>
                    </Field>
                </div>
            </div>

            {/* Progress */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Progress</p>
                <div className="grid max-w-sm gap-5">
                    <Progress value={0} />
                    <Progress value={33} />
                    <Progress value={66} />
                    <Progress value={100} />
                    <Field>
                        <FieldLabel htmlFor="demo-progress">
                            <span>Perfil completado</span>
                            <span className="ml-auto">66%</span>
                        </FieldLabel>
                        <Progress id="demo-progress" value={66} />
                    </Field>
                </div>
            </div>

            {/* Radio Group */}
            <div className="space-y-6 rounded-lg border p-5">
                <p className="text-small font-medium">Radio Group</p>
                <div className="grid gap-8 sm:grid-cols-2">
                    {/* Sí / No en línea (como el toggle de participación) */}
                    <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                            Sí / No (horizontal)
                        </p>
                        <RadioGroup
                            defaultValue="si"
                            className="w-fit"
                            aria-label="¿Participa?"
                        >
                            <Field orientation="horizontal">
                                <RadioGroupItem value="si" id="rg-si" />
                                <FieldLabel
                                    htmlFor="rg-si"
                                    className="font-normal"
                                >
                                    Sí participa
                                </FieldLabel>
                            </Field>
                            <Field orientation="horizontal">
                                <RadioGroupItem value="no" id="rg-no" />
                                <FieldLabel
                                    htmlFor="rg-no"
                                    className="font-normal"
                                >
                                    No participa
                                </FieldLabel>
                            </Field>
                        </RadioGroup>
                    </div>

                    {/* Lista de niveles (como alcance de hidrocarburos) */}
                    <FieldSet className="w-full max-w-xs">
                        <FieldLegend variant="label">
                            Nivel de alcance
                        </FieldLegend>
                        <FieldDescription>
                            Cobertura de la operación.
                        </FieldDescription>
                        <RadioGroup defaultValue="nacional">
                            {['Nacional', 'Departamental', 'Municipal'].map(
                                (lvl) => {
                                    const id = `rg-lvl-${lvl}`;
                                    return (
                                        <Field
                                            key={lvl}
                                            orientation="horizontal"
                                        >
                                            <RadioGroupItem
                                                value={lvl.toLowerCase()}
                                                id={id}
                                            />
                                            <FieldLabel
                                                htmlFor={id}
                                                className="font-normal"
                                            >
                                                {lvl}
                                            </FieldLabel>
                                        </Field>
                                    );
                                },
                            )}
                        </RadioGroup>
                    </FieldSet>

                    {/* Choice cards (como tamaño de empresa) */}
                    <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                            Tarjetas de opción
                        </p>
                        <RadioGroup
                            defaultValue="pequena"
                            className="max-w-sm gap-4"
                        >
                            {[
                                {
                                    v: 'micro',
                                    t: 'Microempresa',
                                    d: 'Hasta 10 empleados.',
                                },
                                {
                                    v: 'pequena',
                                    t: 'Pequeña',
                                    d: 'Entre 11 y 50 empleados.',
                                },
                                {
                                    v: 'mediana',
                                    t: 'Mediana',
                                    d: 'Entre 51 y 200 empleados.',
                                },
                            ].map((o) => {
                                const id = `rg-card-${o.v}`;
                                return (
                                    <FieldLabel key={o.v} htmlFor={id}>
                                        <Field
                                            orientation="horizontal"
                                            className="!items-center gap-4 !p-4"
                                        >
                                            <FieldContent>
                                                <FieldTitle>{o.t}</FieldTitle>
                                                <FieldDescription>
                                                    {o.d}
                                                </FieldDescription>
                                            </FieldContent>
                                            <RadioGroupItem
                                                value={o.v}
                                                id={id}
                                            />
                                        </Field>
                                    </FieldLabel>
                                );
                            })}
                        </RadioGroup>
                    </div>

                    {/* Deshabilitado e inválido */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">
                                Deshabilitado
                            </p>
                            <RadioGroup defaultValue="b" className="w-fit">
                                <Field orientation="horizontal" data-disabled>
                                    <RadioGroupItem
                                        value="a"
                                        id="rg-dis-a"
                                        disabled
                                    />
                                    <FieldLabel
                                        htmlFor="rg-dis-a"
                                        className="font-normal"
                                    >
                                        Opción A
                                    </FieldLabel>
                                </Field>
                                <Field orientation="horizontal">
                                    <RadioGroupItem value="b" id="rg-dis-b" />
                                    <FieldLabel
                                        htmlFor="rg-dis-b"
                                        className="font-normal"
                                    >
                                        Opción B
                                    </FieldLabel>
                                </Field>
                            </RadioGroup>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">
                                Con error
                            </p>
                            <RadioGroup className="w-fit">
                                <Field orientation="horizontal" data-invalid>
                                    <RadioGroupItem
                                        value="x"
                                        id="rg-inv-x"
                                        aria-invalid
                                    />
                                    <FieldLabel
                                        htmlFor="rg-inv-x"
                                        className="font-normal"
                                    >
                                        Opción X
                                    </FieldLabel>
                                </Field>
                                <Field orientation="horizontal" data-invalid>
                                    <RadioGroupItem
                                        value="y"
                                        id="rg-inv-y"
                                        aria-invalid
                                    />
                                    <FieldLabel
                                        htmlFor="rg-inv-y"
                                        className="font-normal"
                                    >
                                        Opción Y
                                    </FieldLabel>
                                </Field>
                                <FieldError>Selecciona una opción.</FieldError>
                            </RadioGroup>
                        </div>
                    </div>
                </div>
            </div>

            {/* Textarea */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Textarea</p>
                <div className="grid max-w-sm gap-5">
                    <Field>
                        <FieldLabel htmlFor="demo-ta">Mensaje</FieldLabel>
                        <FieldDescription>
                            Cuéntanos brevemente.
                        </FieldDescription>
                        <Textarea id="demo-ta" placeholder="Escribe aquí…" />
                    </Field>
                    <Field data-disabled>
                        <FieldLabel htmlFor="demo-ta-dis">
                            Deshabilitado
                        </FieldLabel>
                        <Textarea
                            id="demo-ta-dis"
                            placeholder="No editable"
                            disabled
                        />
                    </Field>
                    <Field data-invalid>
                        <FieldLabel htmlFor="demo-ta-inv">Con error</FieldLabel>
                        <Textarea
                            id="demo-ta-inv"
                            placeholder="Escribe…"
                            aria-invalid
                        />
                        <FieldError>Este campo es obligatorio.</FieldError>
                    </Field>
                </div>
            </div>

            {/* Popover */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Popover</p>
                <div className="flex gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">Abrir popover</Button>
                        </PopoverTrigger>
                        <PopoverContent align="start">
                            <PopoverHeader>
                                <PopoverTitle>Dimensiones</PopoverTitle>
                                <PopoverDescription>
                                    Ajusta el tamaño de la capa.
                                </PopoverDescription>
                            </PopoverHeader>
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                Alineado al final
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-40">
                            Contenido alineado a la derecha.
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Dialog */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Dialog</p>
                <div className="flex gap-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Abrir diálogo</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>¿Confirmas la acción?</DialogTitle>
                                <DialogDescription>
                                    Esta acción no se puede deshacer.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button variant="destructive">Eliminar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Input Group */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Input Group</p>
                <div className="grid max-w-sm gap-4">
                    <InputGroup>
                        <InputGroupInput placeholder="Buscar…" />
                        <InputGroupAddon>
                            <Search className="text-muted-foreground" />
                        </InputGroupAddon>
                    </InputGroup>
                    <InputGroup>
                        <InputGroupAddon>
                            <InputGroupText>$</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput placeholder="0.00" />
                        <InputGroupAddon align="inline-end">
                            <InputGroupText>COP</InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </div>

            {/* Combobox */}
            <div className="space-y-4 rounded-lg border p-5">
                <p className="text-small font-medium">Combobox</p>
                <div className="max-w-xs">
                    <Combobox
                        items={[
                            'Antioquia',
                            'Boyacá',
                            'Cundinamarca',
                            'Meta',
                            'Santander',
                        ]}
                    >
                        <ComboboxInput placeholder="Selecciona un departamento" />
                        <ComboboxContent>
                            <ComboboxEmpty>Sin resultados.</ComboboxEmpty>
                            <ComboboxList>
                                {(item: string) => (
                                    <ComboboxItem key={item} value={item}>
                                        {item}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            </div>
        </section>
    );
}
