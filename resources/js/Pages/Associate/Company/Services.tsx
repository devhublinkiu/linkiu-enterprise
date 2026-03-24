import React, { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Label } from '@/Components/ui/Label';
import {
    Layers,
    ShieldCheck,
    CheckCircle2,
    Pencil,
    MessageSquare,
    AlertCircle,
    Info,
    ChevronRight,
    Search,
    X,
    LayoutGrid,
    Target,
    Filter,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    auth: any;
    initialAssociate?: any;
    availableServices?: any[];
    serviceCategories?: any[];
}

function completionScore(data: any) {
    const checks = [
        data.description?.trim().length >= 50,
        data.service_ids?.length > 0,
    ];
    const filled = checks.filter(Boolean).length;
    return { filled, total: checks.length, pct: Math.round((filled / checks.length) * 100) };
}

function SectionHeader({ icon: Icon, title, right }: { icon: any; title: string; right?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-white" />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h2>
            </div>
            {right}
        </div>
    );
}

function StatusDot({ status }: { status: string | null }) {
    if (!status) return null;
    if (status === 'approved') return (
        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase shrink-0">
            <CheckCircle2 size={11} /> Aprobado
        </span>
    );
    if (status === 'rejected') return (
        <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase shrink-0">
            <AlertCircle size={11} /> Rechazado
        </span>
    );
    return null;
}

export default function Services({ auth, initialAssociate, availableServices = [], serviceCategories = [] }: Props) {
    console.log('Categories received:', serviceCategories);
    console.log('Services received:', availableServices.length);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
    const [saved, setSaved] = useState(false);
    const auditLog = initialAssociate?.audit_log || {};
    
    const plan = initialAssociate?.plan;
    const limit = plan?.limit_services || 0;

    const { data, setData, post, processing, errors } = useForm({
        description: initialAssociate?.description || '',
        service_ids: initialAssociate?.services?.map((s: any) => s.id) || [] as number[],
    });

    const score = completionScore(data);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('associate.company.update.services'), {
            onSuccess: () => {
                setIsEditing(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 5000);
            },
        });
    };

    const isLocked = (field: string) => {
        if (!isEditing) return true;
        if (auditLog[field]?.status === 'approved') return true;
        return false;
    };

    const fieldStatus = (field: string): string | null => {
        const a = auditLog[field];
        if (!a) return null;
        return a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : null;
    };

    const toggleService = (id: number) => {
        if (isLocked('service_ids')) return;
        const current = [...data.service_ids];
        const index = current.indexOf(id);
        
        if (index > -1) {
            current.splice(index, 1);
        } else {
            if (limit > 0 && current.length >= limit) return;
            current.push(id);
        }
        setData('service_ids', current);
    };

    // Filtered and Categorized logic
    const selectedServices = useMemo(() => 
        availableServices.filter(s => data.service_ids.includes(s.id)),
    [data.service_ids, availableServices]);

    const displayedServices = useMemo(() => {
        return availableServices.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategoryId === 'all' || s.category_id === selectedCategoryId;
            return matchesSearch && matchesCategory;
        });
    }, [availableServices, searchTerm, selectedCategoryId]);

    const categoryStats = useMemo(() => {
        const stats: Record<number | string, number> = {};
        data.service_ids.forEach((id: number) => {
            const s = availableServices.find(srv => srv.id === id);
            if (s?.category_id) {
                stats[s.category_id] = (stats[s.category_id] || 0) + 1;
            }
        });
        return stats;
    }, [data.service_ids, availableServices]);

    const rejectedFields = Object.entries(auditLog)
        .filter(([_, a]: [any, any]) => a.status === 'rejected')
        .map(([key, a]: [any, any]) => ({
            field: key,
            reason: a.reason,
            label: ({
                description: 'Propuesta de Valor',
                service_ids: 'Catálogo de Servicios',
            } as Record<string, string>)[key] || key.replace(/_/g, ' '),
        }));

    return (
        <AppLayout>
            <Head title="Servicios y Proyectos" />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Servicios y Proyectos</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            Define el portafolio de servicios y la propuesta de valor de tu empresa.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {!isEditing ? (
                            <Button onClick={() => { setIsEditing(true); setSaved(false); }}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-2 px-5 shadow-lg shadow-slate-900/10 transition-all active:scale-95">
                                <Pencil size={14} /> Editar información
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)} className="border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all">
                                    Cancelar
                                </Button>
                                <Button onClick={handleSubmit} disabled={processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 px-5 shadow-lg shadow-emerald-600/10 transition-all active:scale-95">
                                    <ShieldCheck size={15} />
                                    {processing ? 'Guardando...' : 'Enviar a revisión'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Completion Bar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4 shadow-sm">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Completitud de servicios</span>
                            <span className={cn("text-[11px] font-black", score.pct === 100 ? "text-emerald-600" : score.pct >= 50 ? "text-amber-600" : "text-red-500")}>
                                {score.filled}/{score.total} criterios clave
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)", score.pct === 100 ? "bg-emerald-500" : score.pct >= 50 ? "bg-amber-400" : "bg-red-400")}
                                style={{ width: `${score.pct}%` }}
                            />
                        </div>
                    </div>
                    {score.pct === 100 ? (
                        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                            <CheckCircle2 size={18} className="text-emerald-600" />
                        </div>
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 text-[13px] font-black text-slate-600">
                            {score.pct}%
                        </div>
                    )}
                </div>

                {/* Success Banner */}
                {saved && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-black text-emerald-800 uppercase tracking-tight">¡Información de servicios enviada!</p>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">
                                CAMEP revisará tu portafolio y descripción en las próximas horas.
                            </p>
                        </div>
                        <button onClick={() => setSaved(false)} className="text-emerald-400 hover:text-emerald-600 transition-colors"><X size={16} /></button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Col Izquierda: Propuesta y Navegación de Categorías */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Propuesta de Valor */}
                        <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col group transition-all hover:shadow-md">
                            <SectionHeader 
                                icon={Target} 
                                title="Propuesta de Valor"
                                right={<StatusDot status={fieldStatus('description')} />} 
                            />
                            <div className="p-6">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4 italic">
                                    Describe proyectos clave y experiencia.
                                </Label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    disabled={isLocked('description')}
                                    placeholder="Nuestra organización destaca por..."
                                    className={cn(
                                        "w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium resize-none focus:ring-slate-900 focus:border-slate-900 transition-all min-h-[220px] custom-scrollbar",
                                        isLocked('description') && "opacity-70 cursor-not-allowed grayscale-[0.5]"
                                    )}
                                />
                                {errors.description && <p className="text-red-500 text-[10px] font-black uppercase mt-2">{errors.description}</p>}
                            </div>
                        </section>

                        {/* Filtro de Categorías */}
                        <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <SectionHeader icon={Filter} title="Categorías" />
                            <div className="p-4 space-y-1">
                                <button
                                    onClick={() => setSelectedCategoryId('all')}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all",
                                        selectedCategoryId === 'all' 
                                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
                                            : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <span className="uppercase tracking-wider">Todos los servicios</span>
                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px]", selectedCategoryId === 'all' ? "bg-white/20" : "bg-slate-100")}>
                                        {availableServices.length}
                                    </span>
                                </button>
                                {serviceCategories.map(cat => {
                                    const selectedInCat = categoryStats[cat.id] || 0;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategoryId(cat.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all group",
                                                selectedCategoryId === cat.id 
                                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
                                                    : "text-slate-500 hover:bg-slate-50"
                                            )}
                                        >
                                            <span className="uppercase tracking-wider text-left pr-2">{cat.name}</span>
                                            {selectedInCat > 0 && (
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-black",
                                                    selectedCategoryId === cat.id ? "bg-emerald-500 text-slate-900" : "bg-emerald-100 text-emerald-700"
                                                )}>
                                                    {selectedInCat}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Col Derecha: Catálogo Inteligente */}
                    <div className="lg:col-span-8 space-y-6 flex flex-col h-full">
                        
                        {/* Summary of Selected (Sticky-ish at top of catalogue) */}
                        {data.service_ids.length > 0 && (
                            <section className="rounded-3xl border border-emerald-100 bg-emerald-50/30 overflow-hidden shadow-sm animate-in fade-in duration-500">
                                <div className="px-6 py-3 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/50">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-600" />
                                        <span className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">
                                            Tu Selección ({data.service_ids.length} {limit > 0 ? `/ ${limit}` : ''})
                                        </span>
                                    </div>
                                    {!isLocked('service_ids') && (
                                        <button 
                                            onClick={() => setData('service_ids', [])}
                                            className="text-[9px] font-black uppercase text-emerald-600 hover:text-red-500 transition-colors"
                                        >
                                            Limpiar Todo
                                        </button>
                                    )}
                                </div>
                                <div className="p-4 flex flex-wrap gap-2 max-h-[120px] overflow-y-auto no-scrollbar">
                                    {selectedServices.map(s => (
                                        <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-100 rounded-full text-[10px] font-bold text-slate-700 shadow-sm transition-all hover:border-emerald-300">
                                            {s.name}
                                            {!isLocked('service_ids') && (
                                                <button onClick={() => toggleService(s.id)} className="text-emerald-400 hover:text-red-500 ml-1">
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col flex-1 min-h-[600px]">
                            <SectionHeader 
                                icon={Layers} 
                                title={selectedCategoryId === 'all' ? "Todos los Servicios" : serviceCategories.find(c => c.id === selectedCategoryId)?.name || "Servicios"}
                                right={<StatusDot status={fieldStatus('service_ids')} />}
                            />
                            
                            {/* Toolbar: Search + Mobile Category Select */}
                            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row gap-3">
                                <div className="relative group flex-1">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-11 h-11 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-slate-900 focus:border-slate-900 transition-all outline-none shadow-sm"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                
                                {/* Mobile-only category select */}
                                <div className="lg:hidden">
                                    <select 
                                        value={selectedCategoryId}
                                        onChange={(e) => setSelectedCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                        className="w-full h-11 bg-white border border-slate-200 rounded-2xl text-xs font-bold px-4 focus:ring-slate-900 outline-none shadow-sm"
                                    >
                                        <option value="all">TODAS LAS CATEGORÍAS</option>
                                        {serviceCategories.map(c => <option key={c.id} value={c.id}>{c.name?.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Main List */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/10">
                                {displayedServices.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {displayedServices.map(service => {
                                            const isSelected = data.service_ids.includes(service.id);
                                            return (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => toggleService(service.id)}
                                                    disabled={isLocked('service_ids')}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-2xl border transition-all text-left relative overflow-hidden group active:scale-[0.98]",
                                                        isSelected 
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20" 
                                                            : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md text-slate-600",
                                                        isLocked('service_ids') && "opacity-60 cursor-not-allowed"
                                                    )}
                                                >
                                                    {/* Background Pattern for selected */}
                                                    {isSelected && <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -mr-12 -mt-12 rounded-full blur-2xl pointer-events-none" />}
                                                    
                                                    <div className="flex items-center gap-3.5 relative z-10">
                                                        <div className={cn(
                                                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all border",
                                                            isSelected ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-100 group-hover:bg-slate-100"
                                                        )}>
                                                            {isSelected ? (
                                                                <CheckCircle2 size={16} className="text-emerald-400 animate-in zoom-in-50 duration-300" />
                                                            ) : (
                                                                <LayoutGrid size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black uppercase tracking-tight leading-tight">{service.name}</span>
                                                            {selectedCategoryId === 'all' && service.category?.name && (
                                                                <span className={cn("text-[8px] font-black uppercase tracking-widest mt-1", isSelected ? "text-slate-400" : "text-slate-300")}>
                                                                    {service.category.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {!isLocked('service_ids') && !isSelected && (
                                                        <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                            <Plus size={12} />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                        <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                                            <Search size={32} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No se encontraron resultados</p>
                                            <p className="text-[10px] text-slate-300 font-bold uppercase mt-1">Intenta con otros términos o cambia de categoría</p>
                                        </div>
                                        <button onClick={() => { setSearchTerm(''); setSelectedCategoryId('all'); }} className="text-[10px] font-black text-slate-900 underline underline-offset-4 uppercase tracking-widest hover:text-slate-600">
                                            Limpiar Filtros
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Bottom Save Bar (Sticky) */}
                {isEditing && (
                    <div className="sticky bottom-4 z-10 flex items-center justify-between p-4 bg-slate-900 rounded-3xl shadow-2xl shadow-slate-900/40 border border-white/10 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-500">
                        <div className="hidden sm:flex items-center gap-3 pl-2">
                            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                                <ShieldCheck size={18} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest leading-none">Guardado Inteligente</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Listo para revisión de CAMEP</p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button variant="ghost" onClick={() => setIsEditing(false)} 
                                className="flex-1 sm:flex-none text-white hover:bg-white/10 rounded-xl px-6 h-12 text-xs font-black uppercase tracking-widest transition-colors">
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} disabled={processing}
                                className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl px-10 h-12 text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/20">
                                {processing ? 'Enviando...' : 'Confirmar y Enviar'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

// Custom CSS for nice scrollbars
const style = `
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

function Plus({ size, className }: { size?: number; className?: string }) {
    return <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
}
