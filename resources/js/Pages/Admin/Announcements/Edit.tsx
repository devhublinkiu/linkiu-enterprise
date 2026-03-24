import { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Card } from '@/Components/ui/Card';
import { ArrowLeft, Save, Upload, X, ShieldAlert, Globe, Clock, FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import TiptapEditor from '@/Components/TiptapEditor';

interface AnnouncementProps {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    status: 'draft' | 'published' | 'archived';
    visibility: 'public' | 'members_only';
    published_at: string | null;
    expires_at: string | null;
    cover_url: string | null;
}

interface DocumentProps {
    id: number;
    name: string;
    file_name: string;
    size: string;
    url: string;
}

interface Props {
    announcement: AnnouncementProps;
    documents: DocumentProps[];
}

export default function Edit({ announcement, documents: initialDocuments }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: announcement.title || '',
        content: announcement.content || '',
        excerpt: announcement.excerpt || '',
        status: announcement.status || 'draft',
        visibility: announcement.visibility || 'public',
        published_at: announcement.published_at || '',
        expires_at: announcement.expires_at || '',
        cover: null as File | null,
        documents: [] as File[],
    });

    const [coverPreview, setCoverPreview] = useState<string | null>(announcement.cover_url);
    const [existingDocuments, setExistingDocuments] = useState(initialDocuments);
    
    const coverInputRef = useRef<HTMLInputElement>(null);
    const documentsInputRef = useRef<HTMLInputElement>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.announcements.update', announcement.id));
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('cover', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeCover = () => {
        setData('cover', null);
        setCoverPreview(null);
        if (coverInputRef.current) coverInputRef.current.value = '';
    };

    const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setData('documents', [...data.documents, ...files]);
        }
        if (documentsInputRef.current) documentsInputRef.current.value = '';
    };

    const removeNewDocument = (index: number) => {
        const newDocs = [...data.documents];
        newDocs.splice(index, 1);
        setData('documents', newDocs);
    };

    const deleteExistingDocument = (mediaId: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este documento? Esta acción es inmediata.')) {
            router.delete(route('admin.announcements.documents.destroy', [announcement.id, mediaId]), {
                preserveScroll: true,
                onSuccess: () => {
                    setExistingDocuments(existingDocuments.filter(doc => doc.id !== mediaId));
                }
            });
        }
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('admin.announcements.index')}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight">
                        Editar Anuncio
                    </h2>
                </div>
            }
        >
            <Head title={`Editar: ${announcement.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="flex flex-col lg:flex-row gap-8">
                        {/* Columna Izquierda: Contenido Principal */}
                        <div className="w-full lg:w-2/3 space-y-8">
                            {/* Título */}
                            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-base font-bold text-slate-700">Título del Anuncio *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Ej: Convocatoria Abierta Ecopetrol 2026..."
                                            className="text-lg h-14 rounded-xl font-medium focus-visible:ring-orange-500"
                                            required
                                        />
                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    </div>
                                    
                                    <div className="space-y-2 pt-4 border-t border-slate-100">
                                        <Label htmlFor="excerpt" className="text-sm font-bold text-slate-600">Extracto o Resumen Breve</Label>
                                        <p className="text-xs text-slate-400 mb-2">Un pequeño texto persuasivo o resumen rápido para los listados. (Opcional, máx. 500 caracteres)</p>
                                        <textarea
                                            id="excerpt"
                                            value={data.excerpt}
                                            onChange={(e) => setData('excerpt', e.target.value)}
                                            className="w-full rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 min-h-[100px] text-sm resize-y text-slate-600"
                                            placeholder="Breve descripción del anuncio..."
                                            maxLength={500}
                                        />
                                        <div className="text-right text-xs text-slate-400 font-medium font-mono">{data.excerpt.length}/500</div>
                                        {errors.excerpt && <p className="text-red-500 text-sm">{errors.excerpt}</p>}
                                    </div>
                                </div>
                            </Card>

                            {/* Contenido Completo (Tiptap) */}
                            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <Label className="text-base font-bold text-slate-700">Contenido Detallado *</Label>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Escribe aquí todos los detalles, requisitos de postulación, información extensa, etc.
                                    </p>
                                </div>
                                <div className="flex-1">
                                    <TiptapEditor 
                                        content={data.content} 
                                        onChange={(html: string) => setData('content', html)} 
                                    />
                                </div>
                                {errors.content && <p className="text-red-500 text-sm p-4">{errors.content}</p>}
                            </Card>
                            
                            {/* Documentos Adjuntos (Pliegos, bases) */}
                            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl border-dashed border-2 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <Label className="text-base font-bold text-slate-700 flex items-center gap-2">
                                                <FileText size={18} className="text-blue-500"/>
                                                Documentos Adjuntos (Pliegos, Anexos)
                                            </Label>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Archivos Word, PDF o Excel para descargar. (Opcional)
                                            </p>
                                        </div>
                                        <div>
                                            <Input 
                                                type="file" 
                                                id="documents" 
                                                className="hidden" 
                                                multiple 
                                                onChange={handleDocumentsChange} 
                                                ref={documentsInputRef}
                                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                            />
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => documentsInputRef.current?.click()}
                                                className="gap-2 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50"
                                            >
                                                <Upload size={16} /> Agregar Más
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Existing Documents */}
                                    {existingDocuments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Archivos Actuales</Label>
                                            {existingDocuments.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <FileText size={20} className="text-slate-400 shrink-0" />
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate">
                                                            {doc.name}
                                                        </a>
                                                        <span className="text-xs text-slate-400 shrink-0">({doc.size})</span>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => deleteExistingDocument(doc.id)} className="text-red-500 hover:bg-red-50 shrink-0">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* New Documents Pending to Upload */}
                                    {data.documents.length > 0 && (
                                        <div className="mt-4 space-y-2 pt-4 border-t border-slate-200">
                                            <Label className="text-xs font-bold text-orange-500 uppercase tracking-wider">Nuevos Archivos (Pendientes de guardar)</Label>
                                            {data.documents.map((file, idx) => (
                                                <div key={`new-${idx}`} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg shadow-sm">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <FileText size={20} className="text-orange-400 shrink-0" />
                                                        <span className="text-sm font-medium text-orange-800 truncate">{file.name}</span>
                                                        <span className="text-xs text-orange-500 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeNewDocument(idx)} className="text-red-500 hover:bg-red-100 shrink-0">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.documents && <p className="text-red-500 text-sm mt-1">{errors.documents}</p>}
                                </div>
                            </Card>
                        </div>

                        {/* Columna Derecha: Configuración */}
                        <div className="w-full lg:w-1/3 space-y-6">
                            
                            {/* Visibilidad (Crucial para anuncios) */}
                            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl border-t-4 border-t-purple-500">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Público Objetivo</h3>
                                
                                <div className="space-y-3">
                                    <label className={cn(
                                        "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                        data.visibility === 'public' ? "border-blue-500 bg-blue-50" : "border-slate-100 bg-white hover:border-slate-200"
                                    )}>
                                        <div className="pt-0.5">
                                            <input 
                                                type="radio" 
                                                name="visibility" 
                                                value="public" 
                                                checked={data.visibility === 'public'} 
                                                onChange={(e) => setData('visibility', e.target.value as any)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                <Globe size={16} className="text-blue-500"/>
                                                Público Abierto
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">Cualquier visitante de la página web podrá ver y leer este anuncio.</div>
                                        </div>
                                    </label>

                                    <label className={cn(
                                        "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                        data.visibility === 'members_only' ? "border-purple-500 bg-purple-50" : "border-slate-100 bg-white hover:border-slate-200"
                                    )}>
                                        <div className="pt-0.5">
                                            <input 
                                                type="radio" 
                                                name="visibility" 
                                                value="members_only" 
                                                checked={data.visibility === 'members_only'} 
                                                onChange={(e) => setData('visibility', e.target.value as any)}
                                                className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                <ShieldAlert size={16} className="text-purple-500"/>
                                                Exclusivo Asociados
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">Solo los asociados activos que inicien sesión tendrán acceso.</div>
                                        </div>
                                    </label>
                                </div>
                            </Card>

                            {/* Configuración de Publicación / Fechas */}
                            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl border-t-4 border-t-orange-500">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Publicación</h3>
                                
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado *</Label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value as any)}
                                            className="w-full rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 shadow-sm text-sm font-bold text-slate-700 h-11"
                                        >
                                            <option value="draft">Borrador (No visible)</option>
                                            <option value="published">Publicado</option>
                                            <option value="archived">Archivado / Cerrado</option>
                                        </select>
                                        {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="published_at" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Fecha de Publicación</Label>
                                        <p className="text-[10px] text-slate-400">Déjalo en blanco para publicar inmediatamente.</p>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <Clock size={16} />
                                            </div>
                                            <input
                                                type="datetime-local"
                                                id="published_at"
                                                value={data.published_at}
                                                onChange={(e) => setData('published_at', e.target.value)}
                                                className="w-full pl-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 shadow-sm text-sm h-11"
                                            />
                                        </div>
                                        {errors.published_at && <p className="text-red-500 text-sm mt-1">{errors.published_at}</p>}
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-slate-100">
                                        <Label htmlFor="expires_at" className="text-xs font-bold text-slate-500 uppercase tracking-wider block text-red-500">Vencimiento / Cierre de Oferta</Label>
                                        <p className="text-[10px] text-slate-400 mb-1">Útil para Licitaciones. ¿Cuándo se cierra el plazo?</p>
                                        <input
                                            type="datetime-local"
                                            id="expires_at"
                                            value={data.expires_at}
                                            onChange={(e) => setData('expires_at', e.target.value)}
                                            className="w-full rounded-xl border-red-200 bg-red-50 focus:border-red-500 focus:ring-red-500 shadow-sm text-sm h-11 text-red-700"
                                        />
                                        {errors.expires_at && <p className="text-red-500 text-sm mt-1">{errors.expires_at}</p>}
                                    </div>
                                </div>
                            </Card>

                            {/* Cover Image */}
                            <Card className="p-6 border-slate-200 shadow-sm rounded-2xl">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Imagen Destacada (Opcional)</h3>
                                
                                <div className="space-y-4">
                                    {coverPreview ? (
                                        <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 group">
                                            <img src={coverPreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button type="button" variant="destructive" size="sm" onClick={removeCover} className="gap-2 rounded-full font-bold">
                                                    <X size={16} /> Quitar imagen
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => coverInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-200 rounded-xl aspect-video flex flex-col items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer"
                                        >
                                            <Upload className="mb-2" size={32} />
                                            <span className="text-sm font-bold">Subir Portada</span>
                                            <span className="text-xs font-medium mt-1">JPG, PNG o WebP.</span>
                                        </div>
                                    )}
                                    <Input
                                        type="file"
                                        id="cover"
                                        ref={coverInputRef}
                                        className="hidden"
                                        onChange={handleCoverChange}
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                    />
                                    {errors.cover && <p className="text-red-500 text-sm mt-1">{errors.cover}</p>}
                                </div>
                            </Card>

                            {/* Acciones Finales */}
                            <div className="sticky top-24 pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full h-14 bg-slate-900 hover:bg-orange-500 text-white rounded-xl text-base font-bold tracking-wide shadow-xl shadow-slate-900/10 transition-all gap-2"
                                >
                                    <Save size={20} />
                                    {processing ? 'Guardando...' : 'Actualizar Anuncio'}
                                </Button>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
