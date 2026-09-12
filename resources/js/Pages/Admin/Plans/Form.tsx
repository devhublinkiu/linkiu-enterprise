import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Textarea } from '@/Components/ui/Textarea';
import { Switch } from '@/Components/ui/Switch';
import { Separator } from '@/Components/ui/Separator';
import {
    ArrowLeft,
    Layers,
    Settings,
    LayoutDashboard,
    Info,
    CheckCircle2
} from 'lucide-react';
import InputError from '@/Components/InputError';
import { cn } from '@/lib/utils';

interface Plan {
    id?: number;
    name: string;
    description: string;
    price_monthly: number;
    price_semiannual: number;
    price_annual: number;
    currency: string;
    limit_services: number;
    limit_gallery: number;
    has_priority_directory: boolean;
    can_download_tenders: boolean;
    has_job_board: boolean;
    has_network: boolean;
    has_reviews: boolean;
    has_priority_support: boolean;
    color_hex: string;
    grace_days: number;
    is_active: boolean;
    is_popular: boolean;
    signup_fee: number;
    signup_only_first_period: boolean;
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

type FeatureValues = Record<string, { enabled: boolean; limit_value: number | null }>;

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

    // Estado inicial de los módulos: en edición desde el pivote; en creación,
    // apagados (el admin decide). Ver ADR-0002.
    const initialFeatures: FeatureValues = {};
    features.forEach(f => {
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
        // Campos legacy: se mantienen para que la validación del servidor pase.
        // El servidor los sincroniza desde el pivote (features) al guardar, así
        // que su valor aquí es solo el punto de partida. Ver ADR-0002.
        limit_services: plan?.limit_services || 0,
        limit_gallery: plan?.limit_gallery || 1,
        has_priority_directory: plan?.has_priority_directory ?? false,
        can_download_tenders: plan?.can_download_tenders ?? false,
        has_job_board: plan?.has_job_board ?? false,
        has_network: plan?.has_network ?? false,
        has_reviews: plan?.has_reviews ?? false,
        has_priority_support: plan?.has_priority_support ?? false,
        color_hex: plan?.color_hex || '#64748b',
        grace_days: plan?.grace_days || 0,
        is_active: plan?.is_active ?? true,
        is_popular: plan?.is_popular ?? false,
        signup_fee: plan?.signup_fee || 0,
        signup_only_first_period: plan?.signup_only_first_period ?? false,
        features: initialFeatures,
    });

    const setFeature = (key: string, patchValues: Partial<{ enabled: boolean; limit_value: number | null }>) => {
        setData('features', {
            ...data.features,
            [key]: { ...data.features[key], ...patchValues },
        });
    };

    // Módulos agrupados para el render.
    const grouped: Record<string, FeatureCatalogItem[]> = {};
    features.forEach(f => {
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
            <Head title={isEditing ? `Plan: ${plan.name}` : "Nuevo Nivel - CAMEP"} />

            <div className="max-w-4xl mx-auto py-8 space-y-8 pb-20 mt-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.plans.index')} className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                                {isEditing ? 'Gestión de Nivel' : 'Creación de Membresía'}
                            </h1>
                            <p className="text-[11px] font-bold text-slate-500 uppercase mt-1">
                                Parámetros comerciales y operativos
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={cn("h-3 w-3 rounded-full shadow-sm animate-pulse", data.is_active ? "bg-emerald-500" : "bg-slate-300")} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{data.is_active ? 'Activo' : 'Borrador'}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Identity & Visuals */}
                    <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                        <div className="h-2 w-full" style={{ backgroundColor: data.color_hex }} />
                        <CardHeader className="bg-slate-50/50 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <LayoutDashboard size={20} className="text-slate-950" />
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-950">Identidad del Nivel</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-[11px] font-black uppercase text-slate-500" htmlFor="name">Etiqueta Comercial</Label>
                                        <Input 
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Ej: Membresía Platino"
                                            className="h-12 border-slate-200 rounded-lg focus:ring-slate-950 font-bold bg-slate-50/30"
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[11px] font-black uppercase text-slate-500" htmlFor="color_hex">Color Distintivo (HEX)</Label>
                                        <div className="flex gap-4">
                                            <div 
                                                className="h-12 w-12 rounded-lg shadow-inner border border-slate-200 shrink-0" 
                                                style={{ backgroundColor: data.color_hex }}
                                            />
                                            <Input 
                                                id="color_hex"
                                                value={data.color_hex}
                                                onChange={e => setData('color_hex', e.target.value)}
                                                placeholder="#HEXCODE"
                                                className="h-12 border-slate-200 rounded-lg focus:ring-slate-950 uppercase font-mono font-black"
                                            />
                                        </div>
                                        <InputError message={errors.color_hex} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-black uppercase text-slate-500" htmlFor="description">Propuesta de Valor</Label>
                                    <Textarea 
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Breve resumen de beneficios para el socio..."
                                        className="h-[148px] border-slate-200 rounded-lg focus:ring-slate-950 font-medium resize-none bg-slate-50/30"
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            <div className="flex flex-wrap gap-12">
                                <div className="flex items-center gap-4">
                                    <Switch 
                                        checked={data.is_active}
                                        onCheckedChange={v => setData('is_active', v)}
                                    />
                                    <div>
                                        <Label className="text-[11px] font-black uppercase text-slate-950 block">Activar Nivel</Label>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Habilitar en registro</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Switch 
                                        checked={data.is_popular}
                                        onCheckedChange={v => setData('is_popular', v)}
                                        className="data-[state=checked]:bg-emerald-600"
                                    />
                                    <div>
                                        <Label className="text-[11px] font-black uppercase text-slate-950 block">Destacar Nivel</Label>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Badge "Recomendado"</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <Settings size={20} className="text-slate-950" />
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-950">Acuerdos Financieros</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-black uppercase text-slate-500">Precio Mensual</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                                        <Input 
                                            type="number"
                                            value={data.price_monthly}
                                            onChange={e => setData('price_monthly', parseFloat(e.target.value) || 0)}
                                            className="h-12 border-slate-200 rounded-lg pl-9 focus:ring-slate-950 font-black text-slate-950 bg-slate-50/50"
                                        />
                                    </div>
                                    <InputError message={errors.price_monthly} />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-black uppercase text-slate-500">Precio Semestre</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                                        <Input 
                                            type="number"
                                            value={data.price_semiannual}
                                            onChange={e => setData('price_semiannual', parseFloat(e.target.value) || 0)}
                                            className="h-12 border-slate-200 rounded-lg pl-9 focus:ring-slate-950 font-black text-slate-950 bg-slate-50/50"
                                        />
                                    </div>
                                    <InputError message={errors.price_semiannual} />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-black uppercase text-slate-500">Precio Anual</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                                        <Input 
                                            type="number"
                                            value={data.price_annual}
                                            onChange={e => setData('price_annual', parseFloat(e.target.value) || 0)}
                                            className="h-12 border-slate-200 rounded-lg pl-9 focus:ring-slate-950 font-black text-slate-950 bg-slate-50/50"
                                        />
                                    </div>
                                    <InputError message={errors.price_annual} />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-black uppercase text-indigo-600 flex items-center gap-2">
                                        Cuota Inicial
                                        <Info size={12} className="text-slate-400" />
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                                        <Input 
                                            type="number"
                                            value={data.signup_fee}
                                            onChange={e => setData('signup_fee', parseFloat(e.target.value) || 0)}
                                            className="h-12 border-indigo-200 rounded-lg pl-9 focus:ring-indigo-500 font-black text-indigo-900 bg-indigo-50/20"
                                        />
                                    </div>
                                    <InputError message={errors.signup_fee} />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-2">
                                        Prórroga (Días)
                                        <Info size={12} className="text-slate-400" />
                                    </Label>
                                    <Input
                                        type="number"
                                        value={data.grace_days}
                                        onChange={e => setData('grace_days', parseInt(e.target.value) || 0)}
                                        className="h-12 border-slate-200 rounded-lg focus:ring-slate-950 font-black text-emerald-600 bg-emerald-50/20"
                                    />
                                    <InputError message={errors.grace_days} />
                                </div>
                            </div>

                            {data.signup_fee > 0 && (
                                <div className="mt-8 flex items-start justify-between gap-6 p-5 bg-indigo-50/40 rounded-xl border border-indigo-100">
                                    <div className="space-y-1">
                                        <Label className="text-[11px] font-black uppercase text-indigo-700 block">
                                            Solo cobrar inscripción el primer mes
                                        </Label>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xl">
                                            Si está activo, el primer pago del asociado cubre <strong>solo la cuota inicial</strong>.
                                            A los 30 días se genera automáticamente una cuenta de cobro para la primera mensualidad.
                                            Si está apagado, el primer pago incluye la inscripción <strong>más</strong> el ciclo elegido.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.signup_only_first_period}
                                        onCheckedChange={v => setData('signup_only_first_period', v)}
                                        className="data-[state=checked]:bg-indigo-600 shrink-0"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Módulos del plan — interruptores por catálogo (ADR-0002) */}
                    <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <Layers size={20} className="text-slate-950" />
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-950">Módulos incluidos en el plan</CardTitle>
                            </div>
                            <CardDescription className="text-[11px] font-bold text-slate-400 uppercase pt-1">
                                Enciende lo que trae este plan. Los límites vacíos significan ilimitado.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {features.length === 0 && (
                                <p className="text-sm font-bold text-slate-400">
                                    Aún no hay catálogo de módulos. Corre <code className="font-mono">php artisan db:seed --class=FeatureSeeder</code>.
                                </p>
                            )}

                            {Object.entries(grouped).map(([group, items]) => (
                                <div key={group} className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {GROUP_LABELS[group] ?? group}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {items.map(f => {
                                            const val = data.features[f.key] ?? { enabled: false, limit_value: null };
                                            return (
                                                <div key={f.key} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-[11px] font-black uppercase text-slate-950">{f.name}</Label>
                                                            {!f.is_enabled && (
                                                                <p className="text-[10px] text-amber-600 font-black uppercase">Apagado en la plataforma</p>
                                                            )}
                                                            {f.description && (
                                                                <p className="text-[10px] text-slate-400 font-bold">{f.description}</p>
                                                            )}
                                                        </div>
                                                        <Switch
                                                            checked={val.enabled}
                                                            onCheckedChange={v => setFeature(f.key, { enabled: v })}
                                                        />
                                                    </div>

                                                    {f.type === 'limit' && val.enabled && (
                                                        <div className="flex items-center gap-3 pt-1">
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                placeholder="Ilimitado"
                                                                value={val.limit_value ?? ''}
                                                                onChange={e => setFeature(f.key, {
                                                                    limit_value: e.target.value === '' ? null : (parseInt(e.target.value) || 0),
                                                                })}
                                                                className="h-10 border-slate-200 rounded-lg font-black bg-white"
                                                            />
                                                            <div className="bg-slate-100 px-3 py-1.5 rounded-lg shrink-0">
                                                                <span className="text-[10px] text-slate-500 font-black uppercase">Vacío = ∞</span>
                                                            </div>
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

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-6 pt-10 border-t border-slate-100">
                        <Link href={route('admin.plans.index')}>
                            <Button type="button" variant="ghost" className="h-12 px-10 font-black text-slate-400 hover:text-red-600 uppercase tracking-widest text-[10px] transition-all">
                                Descartar Cambios
                            </Button>
                        </Link>
                        <Button 
                            disabled={processing}
                            className="h-13 px-12 bg-slate-950 text-white hover:bg-emerald-600 rounded-lg font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-300 flex items-center gap-3 transition-all"
                        >
                            {processing ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    {isEditing ? 'Confirmar Actualización' : 'Publicar Nuevo Nivel'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
