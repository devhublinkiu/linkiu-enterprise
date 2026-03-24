import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Save, 
    Image as ImageIcon,
    Layout,
    Type,
    Eye,
    Globe,
    CheckCircle2,
    Plus
} from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Switch } from '@/Components/ui/Switch';
import TiptapEditor from '@/Components/TiptapEditor';
import { useState, useEffect } from 'react';
import { SearchableSelect } from '@/Components/ui/SearchableSelect';
import axios from 'axios';

interface Category {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
}

interface Props {
    categories: Category[];
    tags: Tag[];
}

export default function Create({ categories: initialCategories, tags: initialTags }: Props) {
    const [categories, setCategories] = useState(initialCategories);
    const [tags, setTags] = useState(initialTags);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category_id: '',
        excerpt: '',
        content: '',
        status: 'draft',
        is_featured: false,
        meta_title: '',
        meta_description: '',
        published_at: '',
        cover: null as File | null,
        tags: [] as number[],
    });

    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('cover', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.blog.store'));
    };

    const handleQuickCategory = async () => {
        const name = window.prompt('Nombre de la nueva categoría:');
        if (!name) return;

        setIsCreatingCategory(true);
        try {
            const response = await axios.post(route('admin.blog.store-category'), { name });
            const newCategory = response.data;
            setCategories([...categories, newCategory]);
            setData('category_id', newCategory.id.toString());
        } catch (err) {
            alert('Error al crear la categoría. Tal vez ya existe.');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleTagSelect = (tag: Tag) => {
        const currentTags = [...data.tags];
        if (currentTags.includes(tag.id)) {
            setData('tags', currentTags.filter(id => id !== tag.id));
        } else {
            setData('tags', [...currentTags, tag.id]);
        }
    };

    const handleQuickTag = async () => {
        const name = window.prompt('Nombre de la nueva etiqueta:');
        if (!name) return;

        try {
            const response = await axios.post(route('admin.blog.store-tag'), { name });
            const newTag = response.data;
            setTags([...tags, newTag]);
            setData('tags', [...data.tags, newTag.id]);
        } catch (err) {
            alert('Error al crear la etiqueta. Tal vez ya existe.');
        }
    };

    return (
        <AppLayout>
            <Head title="Nueva Entrada de Blog - Admin" />

            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('admin.blog.index')}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nueva Entrada</h1>
                            <p className="text-slate-500 text-sm">Crea un nuevo artículo para la sección de noticias.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-400">Título del Artículo</Label>
                                    <Input 
                                        id="title"
                                        placeholder="Ej: Nuevas oportunidades para afiliados CAMEP"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="h-12 text-lg font-bold rounded-xl border-slate-200 focus:ring-slate-900 focus:border-slate-900"
                                    />
                                    {errors.title && <p className="text-xs font-bold text-red-500 mt-1">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="excerpt" className="text-xs font-bold uppercase tracking-widest text-slate-400">Extracto / Resumen Corto</Label>
                                    <textarea 
                                        id="excerpt"
                                        rows={3}
                                        placeholder="Una breve descripción que aparecerá en el listado..."
                                        value={data.excerpt}
                                        onChange={e => setData('excerpt', e.target.value)}
                                        className="w-full p-3 rounded-xl border-slate-200 focus:ring-slate-900 focus:border-slate-900 text-sm"
                                    />
                                    {errors.excerpt && <p className="text-xs font-bold text-red-500 mt-1">{errors.excerpt}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contenido del Artículo</Label>
                                    <TiptapEditor 
                                        content={data.content}
                                        onChange={content => setData('content', content)}
                                    />
                                    {errors.content && <p className="text-xs font-bold text-red-500 mt-1">{errors.content}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* SEO Section */}
                        <Card className="border-slate-200 shadow-sm bg-white">
                            <CardContent className="p-6">
                                <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Globe size={16} className="text-indigo-500" />
                                    Configuración SEO
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_title" className="text-xs font-bold uppercase tracking-widest text-slate-400">Meta Título</Label>
                                        <Input 
                                            id="meta_title"
                                            value={data.meta_title}
                                            onChange={e => setData('meta_title', e.target.value)}
                                            className="rounded-xl border-slate-200"
                                            placeholder="Título para buscadores..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="meta_description" className="text-xs font-bold uppercase tracking-widest text-slate-400">Meta Descripción</Label>
                                        <textarea 
                                            id="meta_description"
                                            rows={2}
                                            value={data.meta_description}
                                            onChange={e => setData('meta_description', e.target.value)}
                                            className="w-full p-3 rounded-xl border-slate-200 focus:ring-slate-900 focus:border-slate-900 text-sm"
                                            placeholder="Descripción para buscadores..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Side */}
                    <div className="space-y-8">
                        {/* Publishing Info */}
                        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-200">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Layout size={14} />
                                    Publicación
                                </h3>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado</Label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value as any)}
                                        className="w-full rounded-xl border-slate-200 text-sm h-10"
                                    >
                                        <option value="draft">Borrador</option>
                                        <option value="published">Publicado</option>
                                        <option value="archived">Archivado</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Categoría</Label>
                                        <button 
                                            type="button" 
                                            onClick={handleQuickCategory}
                                            disabled={isCreatingCategory}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                        >
                                            <Plus size={10} /> Nueva
                                        </button>
                                    </div>
                                    <select
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 text-sm h-10 px-3"
                                    >
                                        <option value="">Sin categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Etiquetas</Label>
                                        <button 
                                            type="button" 
                                            onClick={handleQuickTag}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                        >
                                            <Plus size={10} /> Nueva
                                        </button>
                                    </div>
                                    <SearchableSelect 
                                        label="" // Omit internal label as we have one above
                                        placeholder="Seleccionar etiquetas..."
                                        options={tags}
                                        value={tags.filter(t => data.tags.includes(t.id)).map(t => t.name)}
                                        onChange={handleTagSelect}
                                        multiple
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium italic">Ayuda a organizar el contenido</p>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-[11px] font-bold text-slate-700">Artículo Destacado</Label>
                                        <p className="text-[10px] text-slate-400">Mostrar primero en Home</p>
                                    </div>
                                    <Switch 
                                        checked={data.is_featured}
                                        onCheckedChange={checked => setData('is_featured', checked)}
                                    />
                                </div>

                                <Button 
                                    disabled={processing}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold uppercase tracking-widest text-xs transition-all shadow-xl"
                                >
                                    <Save size={16} className="mr-2" />
                                    {processing ? 'Guardando...' : 'Guardar Artículo'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Cover Image */}
                        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-200">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <ImageIcon size={14} />
                                    Imagen de Portada
                                </h3>
                            </div>
                            <CardContent className="p-6">
                                <div className="relative group aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden bg-slate-50 hover:bg-white hover:border-slate-400 transition-all cursor-pointer">
                                    {coverPreview ? (
                                        <>
                                            <img src={coverPreview} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('cover-upload')?.click()}>
                                                    Cambiar Imagen
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4" onClick={() => document.getElementById('cover-upload')?.click()}>
                                            <ImageIcon size={32} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subir Portada</p>
                                        </div>
                                    )}
                                    <input 
                                        id="cover-upload"
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleCoverChange}
                                    />
                                </div>
                                {errors.cover && <p className="text-xs font-bold text-red-500 mt-2 text-center">{errors.cover}</p>}
                                <p className="text-[10px] text-slate-400 text-center mt-4 italic">Recomendado: 1200x800px (Máx 5MB)</p>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
