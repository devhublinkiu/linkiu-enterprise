import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { 
    Plus, 
    Trash2, 
    Eye, 
    EyeOff, 
    Image as ImageIcon, 
    Upload, 
    AlertCircle,
    CheckCircle2,
    Type,
    MoreVertical,
    GripVertical
} from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { useState } from 'react';

interface Slider {
    id: number;
    title: string;
    image_path: string;
    image_url?: string;
    order: number;
    is_active: boolean;
}

interface Props {
    sliders: Slider[];
    auth: any;
}

export default function Index({ sliders, auth }: Props) {
    const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
        title: '',
        image: null as File | null,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.sliders.store'), {
            onSuccess: () => {
                reset();
                setPreviewUrl(null);
                setIsCreating(false);
            },
        });
    };

    const toggleStatus = (id: number) => {
        post(route('admin.sliders.toggle', id));
    };

    const deleteSlider = (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
            destroy(route('admin.sliders.destroy', id));
        }
    };

    const getStorageUrl = (slider: Slider) => {
        if (slider.image_url) return slider.image_url;
        const baseUrl = import.meta.env.VITE_STORAGE_URL || '';
        return `${baseUrl.replace(/\/$/, '')}/${slider.image_path}`;
    };

    return (
        <AppLayout>
            <Head title="Gestión de Multimedia - Admin CAMEP" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Galería Principal
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Gestiona las imágenes de impacto de la página de inicio.
                    </p>
                </div>
                <Button 
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 font-bold shadow-lg transition-all"
                >
                    {isCreating ? 'Cancelar' : 'Nuevo Elemento'}
                </Button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <Card className="mb-8 border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white animate-in slide-in-from-top-4 duration-300">
                    <CardContent className="p-8">
                        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-400">Título</Label>
                                    <div className="relative">
                                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <Input 
                                            id="title"
                                            placeholder="Ej: Nuestra Proyección 2030"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    {errors.title && <p className="text-xs font-bold text-red-500 mt-1">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Imagen (1920x600 WebP)</Label>
                                    <div className="relative group">
                                        <input 
                                            type="file" 
                                            accept="image/webp"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${previewUrl ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50/30'}`}>
                                            <Upload className={previewUrl ? 'text-emerald-500' : 'text-slate-300'} size={24} />
                                            <p className="text-xs font-bold text-slate-500 mt-2">Seleccionar archivo</p>
                                        </div>
                                    </div>
                                    {errors.image && <p className="text-xs font-bold text-red-500 mt-1">{errors.image}</p>}
                                </div>

                                <Button 
                                    disabled={processing}
                                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white rounded-xl py-6 font-bold uppercase tracking-widest text-xs transition-all shadow-xl disabled:opacity-50"
                                >
                                    {processing ? 'Subiendo...' : 'Publicar'}
                                </Button>
                            </div>

                            {/* Preview */}
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Previsualización</Label>
                                {previewUrl ? (
                                    <div className="aspect-[1920/600] rounded-xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-100 relative bg-slate-100">
                                        <img src={previewUrl} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="aspect-[1920/600] rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                        <ImageIcon size={48} strokeWidth={1} />
                                        <p className="text-[10px] font-bold uppercase mt-2">Sin imagen seleccionada</p>
                                    </div>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Items List */}
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-10 text-center">Orden</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Imagen</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Título</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sliders.length > 0 ? (
                                sliders.map((slider) => (
                                    <tr key={slider.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <span className="text-sm font-bold text-slate-900 bg-slate-100 h-8 w-8 rounded-lg flex items-center justify-center">{slider.order}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-16 w-32 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative group/thumb">
                                                <img src={getStorageUrl(slider)} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Eye className="text-white" size={16} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{slider.title || 'Sin título'}</p>
                                            <p className="text-[10px] font-medium text-slate-400 truncate max-w-[200px] mt-0.5">{slider.image_path}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => toggleStatus(slider.id)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                    slider.is_active 
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' 
                                                        : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                                }`}
                                            >
                                                {slider.is_active ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => deleteSlider(slider.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <button className="p-2 text-slate-300 hover:text-slate-900 rounded-lg transition-all">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <ImageIcon size={48} className="text-slate-100 mb-4" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay elementos configurados</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AppLayout>
    );
}
