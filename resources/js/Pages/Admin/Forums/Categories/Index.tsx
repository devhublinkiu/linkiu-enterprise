import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    Plus, 
    Trash2, 
    Edit2,
    MessageCircle,
    Globe,
    Lock,
    ArrowLeft,
    ChevronRight,
    Search,
    Hash
} from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Textarea } from '@/Components/ui/Textarea';
import { Switch } from '@/Components/ui/Switch';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string;
    is_private: boolean;
    order: number;
}

interface Props {
    categories: Category[];
}

export default function Index({ categories }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data, setData, post, patch, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        description: '',
        icon: 'MessageCircle',
        is_private: false,
        order: 0,
    });

    const openCreate = () => {
        reset();
        setEditingCategory(null);
        setIsCreating(true);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
            icon: category.icon,
            is_private: !!category.is_private,
            order: category.order,
        });
        setIsCreating(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            patch(route('admin.forums.categories.update', editingCategory.id), {
                onSuccess: () => setIsCreating(false),
            });
        } else {
            post(route('admin.forums.categories.store'), {
                onSuccess: () => {
                    setIsCreating(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta categoría? Se eliminarán todos los debates asociados.')) {
            destroy(route('admin.forums.categories.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="Red CAMEP - Admin" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest">Administración</span>
                        <ChevronRight size={10} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Red CAMEP</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <MessageCircle size={20} />
                        </div>
                        Círculos de Debate
                    </h1>
                </div>

                <Button 
                    onClick={isCreating ? () => setIsCreating(false) : openCreate}
                    className={cn(
                        "rounded-xl px-6 font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95",
                        isCreating 
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                >
                    {isCreating ? 'Cancelar' : (
                        <>
                            <Plus size={16} className="mr-2" />
                            Nuevo Círculo
                        </>
                    )}
                </Button>
            </div>

            {isCreating && (
                <Card className="mb-8 border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white animate-in slide-in-from-top-4 duration-300 rounded-xl">
                    <CardContent className="p-8">
                        <form onSubmit={submit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 px-1">Nombre del Círculo</Label>
                                        <Input 
                                            placeholder="Ej: Reforma Tributaria 2024"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="h-12 rounded-xl border-slate-200 focus:ring-slate-950 focus:border-slate-950"
                                        />
                                        {errors.name && <p className="text-xs font-bold text-red-500">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 px-1">Descripción</Label>
                                        <Textarea 
                                            placeholder="¿De qué trata este espacio?"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            className="rounded-xl border-slate-200 focus:ring-slate-950 focus:border-slate-950 min-h-[100px]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 px-1">Icono (Lucide)</Label>
                                            <Input 
                                                value={data.icon}
                                                onChange={e => setData('icon', e.target.value)}
                                                className="h-12 rounded-xl border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 px-1">Orden</Label>
                                            <Input 
                                                type="number"
                                                value={data.order}
                                                onChange={e => setData('order', parseInt(e.target.value))}
                                                className="h-12 rounded-xl border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black uppercase text-slate-900">Privacidad del Círculo</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Si es privado, solo asociados activos podrán entrar.</p>
                                            </div>
                                            <Switch 
                                                checked={data.is_private}
                                                onCheckedChange={checked => setData('is_private', checked)}
                                            />
                                        </div>
                                    </div>

                                    <Button 
                                        disabled={processing}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-black uppercase text-[10px] tracking-widest transition-all shadow-xl"
                                    >
                                        {editingCategory ? 'Actualizar Círculo' : 'Crear Círculo'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <Card key={category.id} className="group border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => openEdit(category)}
                                            className="p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(category.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-sm text-slate-900 uppercase">{category.name}</h3>
                                        {category.is_private ? (
                                            <span className="bg-amber-100 text-amber-700 p-1 rounded-md" title="Privado">
                                                <Lock size={10} />
                                            </span>
                                        ) : (
                                            <span className="bg-emerald-100 text-emerald-700 p-1 rounded-md" title="Público">
                                                <Globe size={10} />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                        {category.description || 'Sin descripción disponible.'}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Orden: {category.order}</span>
                                    <span className="text-[10px] font-black text-slate-900 uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Ver debates <ChevronRight size={12} />
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <div className="flex flex-col items-center justify-center">
                            <Hash size={48} className="text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No hay círculos de debate registrados</p>
                            <Button variant="link" className="mt-2 text-emerald-600 font-bold" onClick={openCreate}>Crear el primero</Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
