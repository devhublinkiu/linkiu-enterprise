import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { 
    Plus, 
    Layers, 
    Image as ImageIcon, 
    ShieldCheck, 
    Download, 
    Briefcase, 
    Network, 
    Star, 
    Headphones,
    Edit2,
    Trash2,
    Check,
    X,
    LayoutGrid,
    Crown,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface Plan {
    id: number;
    name: string;
    slug: string;
    description: string;
    price_monthly: string;
    price_semiannual: string;
    price_annual: string;
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
    signup_fee: string;
}

export default function Index({ plans }: { plans: Plan[] }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este plan? Solo podrás hacerlo si no tiene socios vinculados.')) {
            destroy(route('admin.plans.destroy', id));
        }
    };

    const formatCurrency = (value: string) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(parseFloat(value));
    };

    return (
        <AppLayout>
            <Head title="Gestión de Membresías - CAMEP" />

            <div className="max-w-7xl mx-auto space-y-8 pb-20 mt-4">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-950 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                            <Crown size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase leading-none">Planes y Membresías</h1>
                            <p className="text-[11px] font-bold text-slate-500 uppercase mt-1">Configuración comercial de niveles de afiliación</p>
                        </div>
                    </div>
                    
                    <Link href={route('admin.plans.create')}>
                        <Button className="bg-slate-950 text-white hover:bg-emerald-600 rounded-lg h-12 px-8 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-slate-200 flex items-center gap-2">
                            <Plus size={18} />
                            Crear Nuevo Nivel
                        </Button>
                    </Link>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card key={plan.id} className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl flex flex-col group hover:shadow-2xl transition-all duration-500 border-t-0 relative">
                            {/* Color Accent Bar */}
                            <div 
                                className="h-2 w-full absolute top-0 left-0" 
                                style={{ backgroundColor: plan.color_hex }}
                            />
                            
                            <CardContent className="p-8 flex-1 flex flex-col pt-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-black text-slate-950 uppercase">{plan.name}</h3>
                                            {plan.is_popular && (
                                                <Badge className="bg-emerald-600 text-white border-none text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Popular</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase">Slug: {plan.slug}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Link href={route('admin.plans.edit', plan.id)}>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-all">
                                                <Edit2 size={16} />
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDelete(plan.id)}
                                            className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>

                                <p className="text-slate-500 text-xs font-bold uppercase leading-relaxed mb-8 line-clamp-2">
                                    {plan.description || "Consolidado de beneficios estructurado para socios."}
                                </p>

                                {/* Pricing Section */}
                                <div className="space-y-3 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-inner">
                                    {parseFloat(plan.signup_fee) > 0 && (
                                        <div className="flex justify-between items-center px-1 pb-2 border-b border-indigo-200/30 mb-2">
                                            <span className="text-[11px] font-black text-indigo-500 uppercase font-black">Inscripción</span>
                                            <span className="text-base font-black text-indigo-700">{formatCurrency(plan.signup_fee)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[11px] font-black text-slate-400 uppercase">Mes (Base)</span>
                                        <span className="text-base font-black text-slate-950">{formatCurrency(plan.price_monthly)}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-1 border-t border-slate-200/50 pt-2">
                                        <span className="text-[11px] font-black text-slate-400 uppercase">Semestre</span>
                                        <span className="text-sm font-black text-slate-950">{formatCurrency(plan.price_semiannual)}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-1 border-t border-slate-200/50 pt-2">
                                        <span className="text-[11px] font-black text-slate-400 uppercase">Anualidad</span>
                                        <span className="text-sm font-black text-slate-950">{formatCurrency(plan.price_annual)}</span>
                                    </div>
                                </div>

                                {/* Feature List */}
                                <div className="space-y-4 mb-8 flex-1">
                                    <div className="flex items-center gap-3 text-slate-900 group/item">
                                        <div className="h-7 w-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover/item:bg-slate-950 group-hover/item:text-white transition-all">
                                            <Layers size={14} />
                                        </div>
                                        <span className="text-[11px] font-black uppercase">Servicios: <span className="text-slate-950 ml-1">{plan.limit_services === 0 ? 'Ilimitados' : plan.limit_services}</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-900 group/item">
                                        <div className="h-7 w-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover/item:bg-slate-950 group-hover/item:text-white transition-all">
                                            <ImageIcon size={14} />
                                        </div>
                                        <span className="text-[11px] font-black uppercase">Galería: <span className="text-slate-950 ml-1">{plan.limit_gallery} fotos</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-900 group/item">
                                        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-all", plan.has_priority_directory ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300")}>
                                            <ShieldCheck size={14} />
                                        </div>
                                        <span className={cn("text-[11px] font-black uppercase", plan.has_priority_directory ? "text-slate-900" : "text-slate-300 line-through")}>Prioridad Directorio</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-900 group/item">
                                        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-all", plan.can_download_tenders ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300")}>
                                            <Download size={14} />
                                        </div>
                                        <span className={cn("text-[11px] font-black uppercase", plan.can_download_tenders ? "text-slate-900" : "text-slate-300 line-through")}>Licitaciones Amep</span>
                                    </div>
                                </div>

                                {/* Roadmap Section */}
                                <div className="pt-6 border-t border-slate-100 mt-auto flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={14} className={plan.has_job_board ? "text-slate-950" : "text-slate-200"} strokeWidth={plan.has_job_board ? 2.5 : 2} />
                                        <Network size={14} className={plan.has_network ? "text-slate-950" : "text-slate-200"} strokeWidth={plan.has_network ? 2.5 : 2} />
                                        <Star size={14} className={plan.has_reviews ? "text-slate-950" : "text-slate-200"} strokeWidth={plan.has_reviews ? 2.5 : 2} />
                                        <Headphones size={14} className={plan.has_priority_support ? "text-slate-950" : "text-slate-200"} strokeWidth={plan.has_priority_support ? 2.5 : 2} />
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg shadow-lg shadow-slate-200">
                                        <span className="text-[10px] font-black text-white uppercase">Prórroga:</span>
                                        <span className="text-[11px] font-black text-emerald-400 uppercase">{plan.grace_days}d</span>
                                    </div>
                                </div>
                            </CardContent>
                            
                            {/* Availability Bar */}
                            <div className={cn(
                                "py-4 px-8 border-t border-slate-100 flex items-center justify-between transition-colors",
                                plan.is_active ? 'bg-emerald-50/30' : 'bg-slate-50'
                            )}>
                                <span className={cn(
                                    "text-xs font-black uppercase flex items-center gap-2",
                                    plan.is_active ? 'text-emerald-700' : 'text-slate-400'
                                )}>
                                    {plan.is_active ? (
                                        <>
                                            <CheckCircle2 size={14} /> Activo Comercial
                                        </>
                                    ) : (
                                        <>
                                            <X size={14} /> Inactivo
                                        </>
                                    )}
                                </span>
                                
                                <div className="h-1.5 w-12 rounded-full bg-slate-200 overflow-hidden">
                                     <div className={cn("h-full", plan.is_active ? "bg-emerald-500" : "bg-slate-300")} style={{ width: plan.is_active ? '100%' : '30%' }} />
                                </div>
                            </div>
                        </Card>
                    ))}

                    {/* Empty State */}
                    {plans.length === 0 && (
                        <div className="col-span-full py-32 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center text-center shadow-inner">
                            <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 text-slate-200 shadow-sm">
                                <Layers size={40} strokeWidth={1} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sin Niveles de Afiliación</h3>
                            <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto font-medium leading-relaxed uppercase tracking-widest">
                                Debes configurar al menos un plan para que los nuevos socios puedan registrarse y pagar.
                            </p>
                            <Link href={route('admin.plans.create')} className="mt-8">
                                <Button className="bg-slate-950 hover:bg-emerald-600 h-12 px-10 text-xs font-black uppercase tracking-widest rounded-lg shadow-xl shadow-slate-200">
                                    Comenzar Configuración
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
