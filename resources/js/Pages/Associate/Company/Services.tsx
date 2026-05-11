import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import {
    Layers,
    Search,
    X,
    LayoutGrid,
    Target,
    Filter,
    Send,
    Save,
    Plus,
    ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import SectionReviewBanner, { SectionReview } from '@/Components/SectionReviewBanner';

interface Props {
    auth: any;
    flash: any;
    initialAssociate?: any;
    availableServices?: any[];
    serviceCategories?: any[];
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-2.5 px-6 py-4 bg-slate-50 border-b border-slate-100">
            <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-white" />
            </div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h2>
        </div>
    );
}

export default function Services({ auth, flash, initialAssociate, availableServices = [], serviceCategories = [] }: Props) {
    const sectionReview: SectionReview = initialAssociate?.section_reviews?.services ?? { status: 'draft' };
    const sectionStatus = sectionReview.status;
    const canEdit = ['draft', 'rejected'].includes(sectionStatus);

    const [notification, setNotification] = useState<{ type: 'success' | 'draft' | 'error'; msg: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');

    const plan  = initialAssociate?.plan;
    const limit = plan?.limit_services || 0;

    const { data, setData, post, processing } = useForm({
        description: initialAssociate?.description || '',
        service_ids: initialAssociate?.services?.map((s: any) => s.id) || [] as number[],
    });

    const score = (() => {
        const checks = [
            data.description?.trim().length >= 50,
            data.service_ids?.length > 0,
        ];
        const filled = checks.filter(Boolean).length;
        return { filled, total: checks.length, pct: Math.round((filled / checks.length) * 100) };
    })();

    useEffect(() => {
        if (flash?.draft_saved) setNotification({ type: 'draft', msg: `Borrador guardado · ${flash.draft_saved}` });
        if (flash?.success)     setNotification({ type: 'success', msg: flash.success });
        if (flash?.error)       setNotification({ type: 'error', msg: flash.error });
        if (flash) {
            const t = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const handleSubmit = () => post(route('associate.company.update.services'));
    const handleSaveDraft = () => post(route('associate.company.save.services.draft'));

    const toggleService = (id: number) => {
        if (!canEdit) return;
        const current = [...data.service_ids];
        const index   = current.indexOf(id);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            if (limit > 0 && current.length >= limit) return;
            current.push(id);
        }
        setData('service_ids', current);
    };

    const selectedServices = useMemo(() =>
        availableServices.filter(s => data.service_ids.includes(s.id)),
    [data.service_ids, availableServices]);

    const displayedServices = useMemo(() =>
        availableServices.filter(s => {
            const matchesSearch    = s.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory  = selectedCategoryId === 'all' || s.category_id === selectedCategoryId;
            return matchesSearch && matchesCategory;
        }),
    [availableServices, searchTerm, selectedCategoryId]);

    const categoryStats = useMemo(() => {
        const stats: Record<number | string, number> = {};
        data.service_ids.forEach((id: number) => {
            const s = availableServices.find(srv => srv.id === id);
            if (s?.category_id) stats[s.category_id] = (stats[s.category_id] || 0) + 1;
        });
        return stats;
    }, [data.service_ids, availableServices]);

    return (
        <AppLayout>
            <Head title="Servicios y Proyectos" />

            <div className="max-w-5xl mx-auto space-y-5 pb-20 font-sans">

                <SectionReviewBanner
                    section="services"
                    review={sectionReview}
                    notification={notification}
                    onCloseNotification={() => setNotification(null)}
                />

                <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Link href={route('dashboard')} className="hover:text-slate-900 transition-colors">Dashboard</Link>
                        <ChevronLeft size={14} className="rotate-180" />
                        <span className="text-slate-900 font-bold">Servicios</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Servicios y Proyectos</h1>
                    <p className="text-slate-500 text-sm">Define el portafolio de servicios y la propuesta de valor de tu empresa.</p>
                </div>

                {/* Progress bar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-600">
                        <span>Progreso</span>
                        <span>{score.filled}/{score.total} campos</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 transition-all duration-500" style={{ width: `${score.pct}%` }} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left col */}
                    <div className="lg:col-span-4 space-y-6">

                        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                            <SectionHeader icon={Target} title="Propuesta de Valor" />
                            <div className="p-6">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 italic">
                                    Describe proyectos clave y experiencia.
                                </p>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    disabled={!canEdit}
                                    placeholder="Nuestra organización destaca por..."
                                    className={cn(
                                        "w-full border-2 border-slate-100 rounded-2xl p-5 text-sm resize-none focus:outline-none focus:border-slate-900 transition-all min-h-[220px]",
                                        !canEdit && "bg-slate-50 text-slate-400 cursor-not-allowed"
                                    )}
                                />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
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
                                                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all",
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

                    {/* Right col */}
                    <div className="lg:col-span-8 space-y-6 flex flex-col h-full">

                        {data.service_ids.length > 0 && (
                            <section className="rounded-2xl border border-emerald-100 bg-emerald-50/30 overflow-hidden">
                                <div className="px-6 py-3 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/50">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-600" />
                                        <span className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">
                                            Tu Selección ({data.service_ids.length}{limit > 0 ? ` / ${limit}` : ''})
                                        </span>
                                    </div>
                                    {canEdit && (
                                        <button
                                            onClick={() => setData('service_ids', [])}
                                            className="text-[9px] font-black uppercase text-emerald-600 hover:text-red-500 transition-colors"
                                        >
                                            Limpiar Todo
                                        </button>
                                    )}
                                </div>
                                <div className="p-4 flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                                    {selectedServices.map(s => (
                                        <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-100 rounded-full text-[10px] font-bold text-slate-700 shadow-sm">
                                            {s.name}
                                            {canEdit && (
                                                <button onClick={() => toggleService(s.id)} className="text-emerald-400 hover:text-red-500 ml-1">
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col flex-1 min-h-[600px]">
                            <SectionHeader
                                icon={Layers}
                                title={selectedCategoryId === 'all' ? "Todos los Servicios" : serviceCategories.find(c => c.id === selectedCategoryId)?.name || "Servicios"}
                            />

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

                            <div className="flex-1 overflow-y-auto p-6">
                                {displayedServices.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {displayedServices.map(service => {
                                            const isSelected = data.service_ids.includes(service.id);
                                            return (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => toggleService(service.id)}
                                                    disabled={!canEdit}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-2xl border transition-all text-left relative overflow-hidden group active:scale-[0.98]",
                                                        isSelected
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20"
                                                            : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md text-slate-600",
                                                        !canEdit && "opacity-60 cursor-not-allowed"
                                                    )}
                                                >
                                                    {isSelected && <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -mr-12 -mt-12 rounded-full blur-2xl pointer-events-none" />}
                                                    <div className="flex items-center gap-3.5 relative z-10">
                                                        <div className={cn(
                                                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all border",
                                                            isSelected ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-100 group-hover:bg-slate-100"
                                                        )}>
                                                            {isSelected ? (
                                                                <CheckCircle2 size={16} className="text-emerald-400" />
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
                                                    {canEdit && !isSelected && (
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
                                        <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
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

                {canEdit && (
                    <div className="sticky bottom-6 flex justify-end gap-3 z-30">
                        <Button type="button" onClick={handleSaveDraft} disabled={processing} className="bg-white border border-slate-200 text-slate-700 rounded-xl px-6 shadow-lg hover:bg-slate-50">
                            <Save size={16} className="mr-2" /> Guardar Borrador
                        </Button>
                        <Button type="button" onClick={handleSubmit} disabled={processing} className="bg-slate-900 text-white rounded-xl px-8 shadow-xl hover:bg-slate-800">
                            <Send size={16} className="mr-2" /> {processing ? 'Enviando...' : 'Enviar a Revisión'}
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
