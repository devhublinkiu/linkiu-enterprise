import { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Card } from '@/Components/ui/Card';
import { 
    ArrowLeft, 
    Save, 
    Upload, 
    X, 
    ShieldAlert, 
    Globe, 
    Clock, 
    FileText, 
    Trash2,
    Building2,
    ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import TiptapEditor from '@/Components/TiptapEditor';

interface Company {
    id: number;
    nombre: string;
}

interface Tender {
    id: number;
    empresa_id: number;
    titulo: string;
    enlace_externo: string | null;
    extracto: string | null;
    contenido: string | null;
    publico_objetivo: 'abierto' | 'exclusivo_asociados';
    estado: 'borrador' | 'publicado' | 'cerrado';
    fecha_publicacion: string | null;
    fecha_cierre: string | null;
    featured_image_url: string | null;
    documents: { id: number; name: string; url: string }[];
}

interface Props {
    tender?: Tender;
    companies: Company[];
}

export default function Form({ tender, companies }: Props) {
    const isEditing = !!tender;

    const { data, setData, post, processing, errors } = useForm({
        _method: isEditing ? 'put' : 'post',
        empresa_id: tender?.empresa_id || '',
        titulo: tender?.titulo || '',
        enlace_externo: tender?.enlace_externo || '',
        extracto: tender?.extracto || '',
        contenido: tender?.contenido || '',
        publico_objetivo: tender?.publico_objetivo || 'abierto',
        estado: tender?.estado || 'publicado',
        fecha_publicacion: tender?.fecha_publicacion || '',
        fecha_cierre: tender?.fecha_cierre || '',
        featured_image: null as File | null,
        documents: [] as File[],
    });

    const [imagePreview, setImagePreview] = useState<string | null>(tender?.featured_image_url || null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const docsInputRef = useRef<HTMLInputElement>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            post(route('admin.bienes-servicios.tenders.update', tender.id));
        } else {
            post(route('admin.bienes-servicios.tenders.store'));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('featured_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('featured_image', null);
        setImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setData('documents', [...data.documents, ...files]);
        }
        if (docsInputRef.current) docsInputRef.current.value = '';
    };

    const removeNewDoc = (index: number) => {
        const newDocs = [...data.documents];
        newDocs.splice(index, 1);
        setData('documents', newDocs);
    };

    const deleteExistingDoc = (mediaId: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
            router.delete(route('admin.bienes-servicios.tenders.documents.destroy', [tender!.id, mediaId]), {
                preserveScroll: true
            });
        }
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('admin.bienes-servicios.tenders.index')}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight">
                        {isEditing ? 'Editar Licitación' : 'Nueva Licitación'}
                    </h2>
                </div>
            }
        >
            <Head title={`${isEditing ? 'Editar' : 'Crear'} Licitación - Admin`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="flex flex-col lg:flex-row gap-8">
                        {/* Columna Izquierda: Contenido Principal */}
                        <div className="w-full lg:w-2/3 space-y-8">
                            {/* Información Básica */}
                            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="empresa_id" className="text-sm font-bold text-slate-700">Empresa Proveedora *</Label>
                                            <select
                                                id="empresa_id"
                                                value={data.empresa_id}
                                                onChange={(e) => setData('empresa_id', e.target.value)}
                                                className="w-full rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 shadow-sm text-sm font-bold text-slate-700 h-11"
                                                required
                                            >
                                                <option value="">Seleccionar empresa...</option>
                                                {companies.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                                ))}
                                            </select>
                                            {errors.empresa_id && <p className="text-red-500 text-xs">{errors.empresa_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="enlace_externo" className="text-sm font-bold text-slate-700">Enlace Externo (Opcional)</Label>
                                            <div className="relative">
                                                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <Input
                                                    id="enlace_externo"
                                                    value={data.enlace_externo}
                                                    onChange={(e) => setData('enlace_externo', e.target.value)}
                                                    placeholder="https://..."
                                                    className="pl-10 rounded-xl border-slate-200 focus-visible:ring-orange-500 h-11"
                                                />
                                            </div>
                                            {errors.enlace_externo && <p className="text-red-500 text-xs">{errors.enlace_externo}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <Label htmlFor="titulo" className="text-base font-bold text-slate-700">Título de la Licitación *</Label>
                                        <Input
                                            id="titulo"
                                            value={data.titulo}
                                            onChange={(e) => setData('titulo', e.target.value)}
                                            placeholder="Ej: Suministro de materiales eléctricos..."
                                            className="text-lg h-14 rounded-xl font-medium focus-visible:ring-orange-500"
                                            required
                                        />
                                        {errors.titulo && <p className="text-red-500 text-xs">{errors.titulo}</p>}
                                    </div>
                                    
                                    <div className="space-y-2 pt-2">
                                        <Label htmlFor="extracto" className="text-sm font-bold text-slate-600">Extracto o Resumen Breve</Label>
                                        <textarea
                                            id="extracto"
                                            value={data.extracto}
                                            onChange={(e) => setData('extracto', e.target.value)}
                                            className="w-full rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 min-h-[80px] text-sm resize-y text-slate-600"
                                            placeholder="Breve descripción para listados..."
                                        />
                                        {errors.extracto && <p className="text-red-500 text-xs">{errors.extracto}</p>}
                                    </div>
                                </div>
                            </Card>

                            {/* Contenido (Tiptap) */}
                            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <Label className="text-base font-bold text-slate-700">Contenido Detallado</Label>
                                </div>
                                <div className="flex-1">
                                    <TiptapEditor 
                                        content={data.contenido} 
                                        onChange={(html: string) => setData('contenido', html)} 
                                    />
                                </div>
                                {errors.contenido && <p className="text-red-500 text-xs p-4">{errors.contenido}</p>}
                            </Card>
                            
                            {/* Documentos */}
                            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl border-dashed border-2 bg-slate-50">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm md:text-base">
                                        <Label className="font-bold text-slate-700 flex items-center gap-2">
                                            <FileText size={18} className="text-blue-500"/>
                                            Documentos Adjuntos
                                        </Label>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => docsInputRef.current?.click()}
                                            className="gap-2 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50"
                                        >
                                            <Upload size={14} /> Subir Archivos
                                        </Button>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            multiple 
                                            ref={docsInputRef}
                                            onChange={handleDocsChange}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                    </div>

                                    {/* Existing documents */}
                                    {isEditing && tender.documents.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documentos Actuales</p>
                                            {tender.documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <FileText size={18} className="text-blue-500 shrink-0" />
                                                        <span className="text-sm font-medium text-slate-700 truncate">{doc.name}</span>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => deleteExistingDoc(doc.id)} className="text-red-500 hover:bg-red-50">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* New documents queue */}
                                    {data.documents.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Nuevos para subir</p>
                                            {data.documents.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <FileText size={18} className="text-blue-400 shrink-0" />
                                                        <span className="text-sm font-medium text-blue-700 truncate">{file.name}</span>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeNewDoc(idx)} className="text-blue-600 hover:bg-blue-100">
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.documents && <p className="text-red-500 text-xs">{errors.documents}</p>}
                                </div>
                            </Card>
                        </div>

                        {/* Columna Derecha: Configuración */}
                        <div className="w-full lg:w-1/3 space-y-6">
                            {/* Público Objetivo */}
                            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl border-t-4 border-t-purple-500">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Público Objetivo</h3>
                                <div className="space-y-3">
                                    <label className={cn(
                                        "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                        data.publico_objetivo === 'abierto' ? "border-blue-500 bg-blue-50" : "border-slate-100 bg-white hover:border-slate-200"
                                    )}>
                                        <input 
                                            type="radio" 
                                            name="publico_objetivo" 
                                            value="abierto" 
                                            checked={data.publico_objetivo === 'abierto'} 
                                            onChange={(e) => setData('publico_objetivo', e.target.value as any)}
                                            className="mt-1 w-4 h-4 text-blue-600"
                                        />
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                <Globe size={16} className="text-blue-500"/>
                                                Abierto
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Visible para todos los visitantes del portal.</div>
                                        </div>
                                    </label>

                                    <label className={cn(
                                        "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                        data.publico_objetivo === 'exclusivo_asociados' ? "border-purple-500 bg-purple-50" : "border-slate-100 bg-white hover:border-slate-200"
                                    )}>
                                        <input 
                                            type="radio" 
                                            name="publico_objetivo" 
                                            value="exclusivo_asociados" 
                                            checked={data.publico_objetivo === 'exclusivo_asociados'} 
                                            onChange={(e) => setData('publico_objetivo', e.target.value as any)}
                                            className="mt-1 w-4 h-4 text-purple-600"
                                        />
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                <ShieldAlert size={16} className="text-purple-500"/>
                                                Asociados
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Exclusivo para socios logueados.</div>
                                        </div>
                                    </label>
                                </div>
                            </Card>

                            {/* Publicación */}
                            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl border-t-4 border-t-orange-500">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Estado y Fechas</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado *</Label>
                                        <select
                                            value={data.estado}
                                            onChange={(e) => setData('estado', e.target.value as any)}
                                            className="w-full rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm font-bold h-11"
                                        >
                                            <option value="borrador">Borrador</option>
                                            <option value="publicado">Publicado</option>
                                            <option value="cerrado">Cerrado</option>
                                        </select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publicación</Label>
                                        <input
                                            type="datetime-local"
                                            value={data.fecha_publicacion}
                                            onChange={(e) => setData('fecha_publicacion', e.target.value)}
                                            className="w-full rounded-xl border-slate-200 focus:border-orange-500 text-sm h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-red-500">Fecha de Cierre</Label>
                                        <input
                                            type="datetime-local"
                                            value={data.fecha_cierre}
                                            onChange={(e) => setData('fecha_cierre', e.target.value)}
                                            className="w-full rounded-xl border-slate-200 focus:border-red-500 text-sm h-11"
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Featured Image */}
                            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Imagen Destacada</h3>
                                <div className="space-y-4">
                                    {imagePreview ? (
                                        <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 group bg-slate-50">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="gap-2 rounded-full font-bold">
                                                    <X size={16} /> Quitar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => imageInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-200 rounded-xl aspect-video flex flex-col items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer bg-white"
                                        >
                                            <Upload className="mb-2" size={32} />
                                            <span className="text-sm font-bold uppercase">Subir Imagen</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={imageInputRef}
                                        className="hidden"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    {errors.featured_image && <p className="text-red-500 text-xs mt-1">{errors.featured_image}</p>}
                                </div>
                            </Card>

                            <div className="sticky top-24">
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full h-14 bg-slate-900 hover:bg-orange-500 text-white rounded-xl text-base font-bold shadow-xl transition-all gap-2"
                                >
                                    <Save size={20} />
                                    {processing ? 'Guardando...' : 'Guardar Licitación'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
