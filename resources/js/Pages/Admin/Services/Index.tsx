import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import {
    Plus,
    Trash2,
    Briefcase,
    Tag,
    CheckCircle2,
    XCircle,
    Search,
    Edit2,
    FolderPlus,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
}

interface Service {
    id: number;
    name: string;
    category_id: number;
    is_active: boolean;
    category: Category;
    associates_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedServices {
    data: Service[];
    from: number;
    to: number;
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    links: PaginationLink[];
    prev_page_url: string | null;
    next_page_url: string | null;
    first_page_url: string;
    last_page_url: string;
}

interface Filters {
    search?: string;
    category_id?: string;
    per_page?: string;
}

interface Props {
    services: PaginatedServices;
    categories: Category[];
    filters: Filters;
    auth: any;
}

export default function Index({ services, categories, filters = {}, auth }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    // Local search state for debounce-free immediate filter via Inertia
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    const { data, setData, post, patch, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        category_id: '',
        new_category_name: '',
        is_active: true,
    });

    const applyFilter = useCallback((params: Partial<Filters>) => {
        router.get(
            route('admin.services.index'),
            { ...filters, ...params },
            { preserveState: true, replace: true }
        );
    }, [filters]);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        applyFilter({ search: value, category_id: filters.category_id });
    };

    const handleCategoryFilter = (catId: string) => {
        applyFilter({ search: searchValue, category_id: catId });
    };

    const handlePerPage = (value: string) => {
        applyFilter({ search: searchValue, category_id: filters.category_id, per_page: value });
    };

    const openCreate = () => {
        reset();
        clearErrors();
        setEditingService(null);
        setIsCreating(true);
        setShowNewCategoryInput(false);
    };

    const openEdit = (service: Service) => {
        clearErrors();
        setEditingService(service);
        setData({
            name: service.name,
            category_id: service.category_id.toString(),
            new_category_name: '',
            is_active: service.is_active,
        });
        setIsCreating(true);
        setShowNewCategoryInput(false);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingService) {
            patch(route('admin.services.update', editingService.id), {
                onSuccess: () => {
                    setIsCreating(false);
                    setEditingService(null);
                },
            });
        } else {
            post(route('admin.services.store'), {
                onSuccess: () => {
                    setIsCreating(false);
                    reset();
                },
            });
        }
    };

    const deleteService = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este servicio? Esto no afectará a las empresas asociadas pero el servicio dejará de estar disponible.')) {
            destroy(route('admin.services.destroy', id));
        }
    };

    const currentPerPage = filters.per_page ?? '10';
    const currentCategory = filters.category_id ?? '';

    return (
        <AppLayout>
            <Head title="Catálogo de Servicios - Admin" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Briefcase className="text-slate-400" size={24} />
                        Catálogo de Servicios
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Gestiona los servicios disponibles para las empresas afiliadas.
                        <span className="ml-2 text-slate-400 font-bold">({services.total} total)</span>
                    </p>
                </div>
                <Button
                    onClick={isCreating ? () => setIsCreating(false) : openCreate}
                    className={`${isCreating ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-white'} rounded-xl px-6 font-bold shadow-lg transition-all`}
                >
                    {isCreating ? 'Cancelar' : (
                        <>
                            <Plus size={18} className="mr-2" />
                            Nuevo Servicio
                        </>
                    )}
                </Button>
            </div>

            {/* Creation/Edit Form */}
            {isCreating && (
                <Card className="mb-8 border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white animate-in slide-in-from-top-4 duration-300">
                    <CardContent className="p-8">
                        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-400">Nombre del Servicio</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ej: Consultoría Ambiental"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="h-12 rounded-xl border-slate-200 focus:ring-slate-900 focus:border-slate-900"
                                    />
                                    {errors.name && <p className="text-xs font-bold text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Categoría</Label>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                                            className="text-[10px] font-bold uppercase text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                        >
                                            <FolderPlus size={12} />
                                            {showNewCategoryInput ? 'Seleccionar existente' : 'Crear nueva'}
                                        </button>
                                    </div>

                                    {showNewCategoryInput ? (
                                        <div className="space-y-4 animate-in fade-in duration-200">
                                            <Input
                                                placeholder="Nombre de la nueva categoría"
                                                value={data.new_category_name}
                                                onChange={e => setData('new_category_name', e.target.value)}
                                                className="h-12 rounded-xl border-indigo-100 bg-indigo-50/30 focus:ring-indigo-500 focus:border-indigo-500"
                                                autoFocus
                                            />
                                            {errors.new_category_name && <p className="text-xs font-bold text-red-500 mt-1">{errors.new_category_name}</p>}
                                        </div>
                                    ) : (
                                        <select
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            className="w-full h-12 rounded-xl border-slate-200 focus:ring-slate-900 focus:border-slate-900 bg-white px-3 text-sm"
                                        >
                                            <option value="">Selecciona una categoría</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {errors.category_id && <p className="text-xs font-bold text-red-500 mt-1">{errors.category_id}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Estado Inicial</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={data.is_active ? 'default' : 'outline'}
                                            onClick={() => setData('is_active', true)}
                                            className={`flex-1 rounded-xl h-12 font-bold ${data.is_active ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-slate-200'}`}
                                        >
                                            <CheckCircle2 size={16} className="mr-2" />
                                            Activo
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={!data.is_active ? 'default' : 'outline'}
                                            onClick={() => setData('is_active', false)}
                                            className={`flex-1 rounded-xl h-12 font-bold ${!data.is_active ? 'bg-slate-500 hover:bg-slate-600' : 'border-slate-200'}`}
                                        >
                                            <XCircle size={16} className="mr-2" />
                                            Inactivo
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    disabled={processing}
                                    className="w-1/3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold uppercase tracking-widest text-xs transition-all shadow-xl disabled:opacity-50"
                                >
                                    {processing ? (editingService ? 'Guardando...' : 'Creando...') : (editingService ? 'Actualizar' : 'Crear')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="Buscar por nombre..."
                        className="w-full pl-9 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-slate-400 shrink-0" />
                    <select
                        value={currentCategory}
                        onChange={e => handleCategoryFilter(e.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Per Page */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Mostrar</span>
                    <select
                        value={currentPerPage}
                        onChange={e => handlePerPage(e.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>

            {/* Services Table */}
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Servicio</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Categoría</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Empresas</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {services.data.length > 0 ? (
                                services.data.map((service) => (
                                    <tr key={service.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{service.name}</p>
                                            <p className="text-[10px] font-medium text-slate-400">ID: #{service.id}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Tag size={12} className="text-indigo-400" />
                                                <span className="text-xs font-medium text-slate-600">{service.category?.name || 'Sin categoría'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center h-7 px-3 rounded-full text-[11px] font-bold ${
                                                service.associates_count > 0
                                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                            }`}>
                                                {service.associates_count} empresas
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                service.is_active
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}>
                                                {service.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(service)}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => deleteService(service.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Briefcase size={48} className="text-slate-100 mb-4" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No se encontraron servicios</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {services.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Mostrando {services.from}–{services.to} de {services.total} servicios
                        </p>
                        <div className="flex items-center gap-1">
                            {/* First */}
                            <Link
                                href={services.first_page_url}
                                className={cn(
                                    "p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all",
                                    services.current_page === 1 && "opacity-30 pointer-events-none"
                                )}
                            >
                                <ChevronsLeft size={16} />
                            </Link>
                            {/* Prev */}
                            <Link
                                href={services.prev_page_url ?? '#'}
                                className={cn(
                                    "p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all",
                                    !services.prev_page_url && "opacity-30 pointer-events-none"
                                )}
                            >
                                <ChevronLeft size={16} />
                            </Link>

                            {/* Page Numbers */}
                            {services.links.slice(1, -1).map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    className={cn(
                                        "min-w-[36px] h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all",
                                        link.active
                                            ? "bg-slate-900 text-white shadow-md"
                                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                                        !link.url && "opacity-30 pointer-events-none"
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}

                            {/* Next */}
                            <Link
                                href={services.next_page_url ?? '#'}
                                className={cn(
                                    "p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all",
                                    !services.next_page_url && "opacity-30 pointer-events-none"
                                )}
                            >
                                <ChevronRight size={16} />
                            </Link>
                            {/* Last */}
                            <Link
                                href={services.last_page_url}
                                className={cn(
                                    "p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all",
                                    services.current_page === services.last_page && "opacity-30 pointer-events-none"
                                )}
                            >
                                <ChevronsRight size={16} />
                            </Link>
                        </div>
                    </div>
                )}
            </Card>
        </AppLayout>
    );
}
