import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CreditCard,
    Layers,
    LayoutDashboard,
    Loader2,
} from 'lucide-react';

import { Badge } from '@/Components/base/Badge';
import { Button } from '@/Components/base/Button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import { Field, FieldDescription, FieldLabel } from '@/Components/base/Field';
import { Input } from '@/Components/base/Input';
import { Switch } from '@/Components/base/Switch';
import { Textarea } from '@/Components/base/Textarea';
import AppLayout from '@/Layouts/AppLayout';

import FormField from '@/Pages/Associate/Company/BasicInfo/Parts/FormField';

interface Plan {
    id?: number;
    name: string;
    description: string;
    price_monthly: number;
    price_semiannual: number;
    price_annual: number;
    currency: string;
    color_hex: string;
    grace_days: number;
    is_active: boolean;
    is_popular: boolean;
    signup_fee: number;
}

interface FeatureCatalogItem {
    id: number;
    key: string;
    name: string;
    description: string | null;
    type: 'boolean' | 'limit';
    group: string | null;
    is_enabled: boolean;
}

type FeatureValues = Record<
    string,
    { enabled: boolean; limit_value: number | null }
>;

// pago_en_linea es un método de pago (va a Integraciones), vitrina está oculta:
// ninguno se edita como módulo de la membresía. Ver plan 0016.
const MODULE_HIDDEN = ['pago_en_linea', 'vitrina'];

const GROUP_LABELS: Record<string, string> = {
    visibilidad: 'Visibilidad',
    contenido: 'Contenido',
    comunidad: 'Comunidad',
    servicio: 'Servicio',
    facturacion: 'Facturación',
    futuro: 'Próximamente',
};

export default function Form({
    plan,
    features = [],
    planFeatures = {},
}: {
    plan?: Plan;
    features?: FeatureCatalogItem[];
    planFeatures?: FeatureValues;
}) {
    const isEditing = !!plan;

    const visibleFeatures = features.filter(
        (f) => !MODULE_HIDDEN.includes(f.key),
    );

    // Estado inicial de los módulos: en edición desde el pivote; en creación,
    // apagados. Ver ADR-0002.
    const initialFeatures: FeatureValues = {};
    visibleFeatures.forEach((f) => {
        const current = planFeatures[f.key];
        initialFeatures[f.key] = current
            ? { enabled: current.enabled, limit_value: current.limit_value }
            : { enabled: false, limit_value: null };
    });

    const { data, setData, post, patch, processing, errors } = useForm({
        name: plan?.name || '',
        description: plan?.description || '',
        price_monthly: plan?.price_monthly || 0,
        price_semiannual: plan?.price_semiannual || 0,
        price_annual: plan?.price_annual || 0,
        currency: plan?.currency || 'COP',
        grace_days: plan?.grace_days || 0,
        is_active: plan?.is_active ?? true,
        is_popular: plan?.is_popular ?? false,
        signup_fee: plan?.signup_fee || 0,
        features: initialFeatures,
    });

    const setFeature = (
        key: string,
        patchValues: Partial<{ enabled: boolean; limit_value: number | null }>,
    ) => {
        setData('features', {
            ...data.features,
            [key]: { ...data.features[key], ...patchValues },
        });
    };

    // Módulos agrupados para el render.
    const grouped: Record<string, FeatureCatalogItem[]> = {};
    visibleFeatures.forEach((f) => {
        const g = f.group || 'otros';
        (grouped[g] = grouped[g] || []).push(f);
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            patch(route('admin.plans.update', plan.id));
        } else {
            post(route('admin.plans.store'));
        }
    };

    return (
        <AppLayout>
            <Head
                title={
                    isEditing ? `Membresía: ${plan.name}` : 'Nueva membresía'
                }
            />

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-4xl space-y-6 pb-20"
            >
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        asChild
                        aria-label="Volver a membresías"
                    >
                        <Link href={route('admin.plans.index')}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-display text-h3">
                            {isEditing ? 'Editar membresía' : 'Nueva membresía'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Precios, cuota inicial y módulos que incluye.
                        </p>
                    </div>
                </div>

                {/* Identidad */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <LayoutDashboard className="size-4 text-muted-foreground" />
                            Identidad
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <FormField
                            id="name"
                            label="Nombre"
                            required
                            error={errors.name}
                        >
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Ej. Membresía Platino"
                            />
                        </FormField>

                        <FormField
                            id="description"
                            label="Descripción"
                            error={errors.description}
                        >
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Breve resumen de la membresía…"
                                rows={3}
                            />
                        </FormField>

                        <div className="flex flex-wrap gap-8 pt-1">
                            <Field orientation="horizontal" className="w-auto">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(v) =>
                                        setData('is_active', v)
                                    }
                                />
                                <FieldLabel
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    Activa (disponible en el registro)
                                </FieldLabel>
                            </Field>
                            <Field orientation="horizontal" className="w-auto">
                                <Switch
                                    id="is_popular"
                                    checked={data.is_popular}
                                    onCheckedChange={(v) =>
                                        setData('is_popular', v)
                                    }
                                />
                                <FieldLabel
                                    htmlFor="is_popular"
                                    className="font-normal"
                                >
                                    Destacar como recomendada
                                </FieldLabel>
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                {/* Precios y cobro */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="size-4 text-muted-foreground" />
                            Precios y cobro
                        </CardTitle>
                        <CardDescription>
                            La cuota inicial exonera el primer mes: la
                            mensualidad se cobra desde el mes 2.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <MoneyField
                            id="signup_fee"
                            label="Cuota inicial"
                            value={data.signup_fee}
                            onChange={(v) => setData('signup_fee', v)}
                            error={errors.signup_fee}
                            hint="Lo que paga al inscribirse."
                        />
                        <MoneyField
                            id="price_monthly"
                            label="Mensual"
                            value={data.price_monthly}
                            onChange={(v) => setData('price_monthly', v)}
                            error={errors.price_monthly}
                        />
                        <MoneyField
                            id="price_semiannual"
                            label="Semestral"
                            value={data.price_semiannual}
                            onChange={(v) => setData('price_semiannual', v)}
                            error={errors.price_semiannual}
                        />
                        <MoneyField
                            id="price_annual"
                            label="Anual"
                            value={data.price_annual}
                            onChange={(v) => setData('price_annual', v)}
                            error={errors.price_annual}
                        />
                        <FormField
                            id="grace_days"
                            label="Prórroga (días de gracia)"
                            error={errors.grace_days}
                            hint="Días tras el corte antes de ocultar el perfil."
                        >
                            <Input
                                id="grace_days"
                                type="number"
                                min={0}
                                value={data.grace_days}
                                onChange={(e) =>
                                    setData(
                                        'grace_days',
                                        parseInt(e.target.value) || 0,
                                    )
                                }
                            />
                        </FormField>
                    </CardContent>
                </Card>

                {/* Módulos */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="size-4 text-muted-foreground" />
                            Módulos incluidos
                        </CardTitle>
                        <CardDescription>
                            Enciende lo que trae esta membresía. En los de
                            límite, vacío = ilimitado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {visibleFeatures.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Aún no hay catálogo de módulos. Corre{' '}
                                <code className="rounded bg-muted px-1">
                                    php artisan db:seed --class=FeatureSeeder
                                </code>
                                .
                            </p>
                        )}

                        {Object.entries(grouped).map(([group, items]) => (
                            <div key={group} className="space-y-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    {GROUP_LABELS[group] ?? group}
                                </p>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {items.map((f) => {
                                        const val = data.features[f.key] ?? {
                                            enabled: false,
                                            limit_value: null,
                                        };
                                        const comingSoon = !f.is_enabled;
                                        return (
                                            <div
                                                key={f.key}
                                                className="space-y-3 rounded-lg border border-border p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 space-y-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-foreground">
                                                                {f.name}
                                                            </span>
                                                            {comingSoon && (
                                                                <Badge variant="secondary">
                                                                    Próximamente
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {f.description && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {f.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Switch
                                                        checked={val.enabled}
                                                        onCheckedChange={(v) =>
                                                            setFeature(f.key, {
                                                                enabled: v,
                                                            })
                                                        }
                                                        aria-label={`Incluir ${f.name}`}
                                                    />
                                                </div>

                                                {f.type === 'limit' &&
                                                    val.enabled && (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                placeholder="Ilimitado"
                                                                value={
                                                                    val.limit_value ??
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    setFeature(
                                                                        f.key,
                                                                        {
                                                                            limit_value:
                                                                                e
                                                                                    .target
                                                                                    .value ===
                                                                                ''
                                                                                    ? null
                                                                                    : parseInt(
                                                                                          e
                                                                                              .target
                                                                                              .value,
                                                                                      ) ||
                                                                                      0,
                                                                        },
                                                                    )
                                                                }
                                                                className="h-9"
                                                                aria-label={`Límite de ${f.name}`}
                                                            />
                                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                                vacío = ∞
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" asChild>
                        <Link href={route('admin.plans.index')}>Cancelar</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing && (
                            <Loader2 className="size-4 animate-spin" />
                        )}
                        {isEditing ? 'Guardar cambios' : 'Crear membresía'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}

function MoneyField({
    id,
    label,
    value,
    onChange,
    error,
    hint,
}: {
    id: string;
    label: string;
    value: number;
    onChange: (v: number) => void;
    error?: string;
    hint?: string;
}) {
    return (
        <Field data-invalid={error ? 'true' : undefined}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                </span>
                <Input
                    id={id}
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    className="pl-7"
                />
            </div>
            {hint && !error && <FieldDescription>{hint}</FieldDescription>}
            {error && <p className="text-sm text-destructive">{error}</p>}
        </Field>
    );
}
