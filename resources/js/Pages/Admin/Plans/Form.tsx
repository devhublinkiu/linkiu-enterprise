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
    Save, 
    ArrowLeft, 
    Layers, 
    Image as ImageIcon, 
    ShieldCheck, 
    Download, 
    Briefcase, 
    Network, 
    Star, 
    Headphones,
    Settings,
    LayoutDashboard,
    AlertCircle,
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
}

export default function Form({ plan }: { plan?: Plan }) {
    const isEditing = !!plan;

    const { data, setData, post, patch, processing, errors } = useForm({
        name: plan?.name || '',
        description: plan?.description || '',
        price_monthly: plan?.price_monthly || 0,
        price_semiannual: plan?.price_semiannual || 0,
        price_annual: plan?.price_annual || 0,
        currency: plan?.currency || 'COP',
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
                        </CardContent>
                    </Card>

                    {/* Operational Limits */}
                    <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <Layers size={20} className="text-slate-950" />
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-950">Límites Operativos</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-black uppercase text-slate-500">Capacidad de Servicios</Label>
                                    <div className="flex items-center gap-4">
                                        <Input 
                                            type="number"
                                            value={data.limit_services}
                                            onChange={e => setData('limit_services', parseInt(e.target.value) || 0)}
                                            className="h-12 border-slate-200 rounded-lg focus:ring-slate-950 font-black bg-slate-50/30"
                                        />
                                        <div className="bg-slate-100 px-3 py-1.5 rounded-lg shrink-0">
                                             <span className="text-[10px] text-slate-500 font-black uppercase">0 = Ilimitado</span>
                                        </div>
                                    </div>
                                    <InputError message={errors.limit_services} />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-black uppercase text-slate-500">Capacidad Galería (Fotos)</Label>
                                    <Input 
                                        type="number"
                                        value={data.limit_gallery}
                                        onChange={e => setData('limit_gallery', parseInt(e.target.value) || 1)}
                                        className="h-12 border-slate-200 rounded-lg focus:ring-slate-950 font-black bg-slate-50/30"
                                    />
                                    <InputError message={errors.limit_gallery} />
                                </div>
                            </div>
                            
                            <Separator className="bg-slate-100" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("h-10 w-10 flex items-center justify-center rounded-lg transition-all", data.has_priority_directory ? "bg-emerald-600 text-white shadow-lg" : "bg-slate-200 text-slate-400 opacity-50")}>
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label className="text-[11px] font-black uppercase text-slate-950">Prioridad Directorio</Label>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Posicionamiento VIP</p>
                                        </div>
                                    </div>
                                    <Switch checked={data.has_priority_directory} onCheckedChange={v => setData('has_priority_directory', v)} />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("h-10 w-10 flex items-center justify-center rounded-lg transition-all", data.can_download_tenders ? "bg-emerald-600 text-white shadow-lg" : "bg-slate-200 text-slate-400 opacity-50")}>
                                            <Download size={20} />
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label className="text-[11px] font-black uppercase text-slate-950">Descarga Licitaciones</Label>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Acceso a Anuncios Públicos</p>
                                        </div>
                                    </div>
                                    <Switch checked={data.can_download_tenders} onCheckedChange={v => setData('can_download_tenders', v)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Future Modules */}
                    <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-slate-50/50">
                        <CardHeader className="pb-8 border-b border-white">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-slate-950 rounded-lg flex items-center justify-center text-white shadow-lg">
                                    <AlertCircle size={16} />
                                </div>
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-950">Roadmap Operativo (Próximamente)</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { id: 'has_job_board', label: 'Bolsa de Empleo', icon: Briefcase },
                                { id: 'has_network', label: 'Red de Negocios', icon: Network },
                                { id: 'has_reviews', label: 'Sistema Reseñas', icon: Star },
                                { id: 'has_priority_support', label: 'Soporte VIP', icon: Headphones },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-all", (data as any)[item.id] ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-300 opacity-50")}>
                                            <item.icon size={16} />
                                        </div>
                                        <Label className="text-[11px] font-black uppercase text-slate-800">{item.label}</Label>
                                    </div>
                                    <Switch checked={(data as any)[item.id]} onCheckedChange={v => setData(item.id as any, v)} />
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
