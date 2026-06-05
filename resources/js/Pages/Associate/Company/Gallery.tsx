import React, { useState, useRef, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import {
    Image as ImageIcon,
    Upload,
    Trash2,
    Plus,
    X,
    CheckCircle2,
    Loader2,
    Star,
    LayoutGrid,
    AlertCircle,
    Info,
    ArrowRight,
    Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    auth: any;
    initialAssociate?: any;
}

export default function Gallery({ auth, initialAssociate }: Props) {
    const [uploading, setUploading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const images = initialAssociate?.gallery_urls || [];
    const limit = initialAssociate?.plan?.limit_gallery || 0;
    const used = images.length;
    const percentage = limit > 0 ? (used / limit) * 100 : 0;
    const logoUrl = initialAssociate?.document_urls?.logo || null;

    const { delete: destroy, processing } = useForm({
        path: '',
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        router.post(route('associate.company.upload.logo'), { logo: file }, {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => setUploadingLogo(true),
            onFinish: () => {
                setUploadingLogo(false);
                if (logoInputRef.current) logoInputRef.current.value = '';
            },
        });
    };

    const handleDeleteLogo = () => {
        if (!confirm('¿Eliminar el logo? Tu perfil público se mostrará sin imagen hasta que subas uno nuevo.')) return;
        router.delete(route('associate.company.delete.logo'), { preserveScroll: true });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            
            router.post(route('associate.company.update.gallery'), {
                images: filesArray 
            }, {
                forceFormData: true,
                onStart: () => setUploading(true),
                onFinish: () => {
                    setUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                },
            });
        }
    };

    const handleSetCover = (path: string) => {
        router.post(route('associate.company.set.cover.image'), { path });
    };

    const handleDelete = (path: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
            router.delete(route('associate.company.delete.gallery.image'), {
                data: { path },
            });
        }
    };

    const getProfileLevel = () => {
        if (used === 0) return { label: 'Sin Fotos', color: 'bg-slate-200', text: 'text-slate-500' };
        if (used < 3) return { label: 'Nivel Básico', color: 'bg-amber-500', text: 'text-amber-500' };
        if (used < 5) return { label: 'Perfil Intermedio', color: 'bg-blue-500', text: 'text-blue-500' };
        return { label: 'Perfil Profesional', color: 'bg-emerald-500', text: 'text-emerald-500' };
    };

    const level = getProfileLevel();

    return (
        <AppLayout>
            <Head title="Galería de la Empresa" />

            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                {/* Logo Section — separate from gallery */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mt-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Logo de la Empresa</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Imagen principal de identidad — visible en tu perfil público</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="h-32 w-32 rounded-2xl bg-slate-50 border-2 border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                            ) : (
                                <Building2 size={48} className="text-slate-200" strokeWidth={1.5} />
                            )}
                        </div>

                        <div className="flex-1 text-center sm:text-left space-y-3">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Sube una imagen cuadrada (JPG, PNG, WEBP). Máximo 5MB. Se mostrará en tu perfil público y en los listados de empresas asociadas.
                            </p>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                ref={logoInputRef}
                                onChange={handleLogoChange}
                            />
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                <Button
                                    onClick={() => logoInputRef.current?.click()}
                                    disabled={uploadingLogo}
                                    className="rounded-lg bg-slate-950 text-white hover:bg-orange-600 transition-all gap-2 h-10 px-5 font-black text-xs uppercase tracking-widest shadow-md"
                                >
                                    {uploadingLogo ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                                    {logoUrl ? 'Reemplazar Logo' : 'Subir Logo'}
                                </Button>
                                {logoUrl && (
                                    <Button
                                        onClick={handleDeleteLogo}
                                        disabled={uploadingLogo}
                                        className="rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-all gap-2 h-10 px-5 font-black text-xs uppercase tracking-widest"
                                    >
                                        <Trash2 size={14} />
                                        Eliminar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual separator between Logo and Gallery */}
                <div className="border-t border-dashed border-slate-200 my-2"></div>

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-950 rounded-lg flex items-center justify-center text-white shadow-lg">
                                <ImageIcon size={20} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Galería Multimedia</h1>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Gestión de impacto visual empresarial</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="max-w-md space-y-2">
                            <div className="flex justify-between items-end">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", level.text)}>
                                    {level.label}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {used} / {limit > 0 ? limit : '∞'} Fotos
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                <div 
                                    className={cn("h-full transition-all duration-1000", level.color)}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <Button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || processing || (limit > 0 && used >= limit)}
                            className="w-full sm:w-auto rounded-lg bg-slate-950 text-white hover:bg-emerald-600 transition-all duration-300 gap-2 h-11 px-8 font-black text-xs uppercase tracking-widest shadow-md"
                        >
                            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                            Subir Imágenes
                        </Button>
                    </div>
                </div>

                {/* Info Tip */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <Info size={18} className="text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-800 font-bold uppercase tracking-wider leading-relaxed">
                        Consejo: Las empresas con más de 5 fotos de alta calidad tienen un 40% más de probabilidad de ser contactadas.
                    </p>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Add Photo Action Card */}
                    {(limit === 0 || used < limit) && (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || processing}
                            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all duration-500 group bg-white shadow-sm"
                        >
                            <div className="h-14 w-14 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-500 border border-slate-100 group-hover:border-emerald-200">
                                {uploading ? <Loader2 className="animate-spin text-emerald-600" /> : <Plus size={28} />}
                            </div>
                            <div className="text-center">
                                <span className="block text-[10px] font-black uppercase tracking-widest">Añadir Imagen</span>
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Máx. 5MB por archivo</span>
                            </div>
                        </button>
                    )}

                    {/* Gallery Cards */}
                    {images.map((img: any, idx: number) => {
                        const isCover = initialAssociate.cover_path === img.path;
                        
                        return (
                            <div key={idx} className={cn(
                                "group relative aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 border-2",
                                isCover ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-slate-100"
                            )}>
                                <img 
                                    src={img.url} 
                                    alt={`Gallery ${idx}`} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                
                                {/* Professional Overlays */}
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-4 backdrop-blur-[2px]">
                                    <div className="flex justify-end gap-2">
                                        {!isCover && (
                                            <button 
                                                onClick={() => handleSetCover(img.path)}
                                                className="h-9 w-9 rounded-lg bg-white/20 hover:bg-emerald-500 text-white flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-emerald-500 shadow-lg"
                                                title="Portada Principal"
                                            >
                                                <Star size={16} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(img.path)}
                                            className="h-9 w-9 rounded-lg bg-white/20 hover:bg-red-500 text-white flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-red-500 shadow-lg"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="h-8 px-3 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg flex items-center">
                                            <span className="text-[9px] text-white font-black uppercase tracking-widest">Foto #{idx + 1}</span>
                                        </div>
                                        
                                        {!isCover && (
                                             <button 
                                                onClick={() => handleSetCover(img.path)}
                                                className="h-8 px-4 bg-white hover:bg-emerald-500 hover:text-white text-slate-900 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                                            >
                                                Usar Portada
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Status Badge */}
                                {isCover && (
                                    <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
                                        <div className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg border border-emerald-400 shadow-lg flex items-center gap-2">
                                            <Star size={10} className="fill-white" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Portada Active</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {used === 0 && !uploading && (
                    <div className="bg-white rounded-xl border border-slate-200 border-dashed py-32 flex flex-col items-center text-center shadow-inner">
                        <div className="h-24 w-24 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 text-slate-200 border border-slate-100 shadow-sm">
                            <ImageIcon size={48} strokeWidth={1} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Galería Comercial Vacía</h3>
                        <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto font-medium leading-relaxed">
                            Las imágenes son el primer punto de confianza. Sube fotos de tus proyectos más importantes o de tus oficinas para mejorar tu presencia.
                        </p>
                        <Button 
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-10 font-black text-xs uppercase tracking-widest gap-3 shadow-lg shadow-emerald-600/20"
                        >
                            Empezar ahora <ArrowRight size={16} />
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function SectionHeader({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: any }) {
    return (
        <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-slate-950 rounded-xl flex items-center justify-center text-white shadow-xl">
                <Icon size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{title}</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{subtitle}</p>
            </div>
        </div>
    );
}
