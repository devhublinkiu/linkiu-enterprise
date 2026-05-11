import React, { useRef } from 'react';
import { Camera, Eye, Trash2, Star, Upload } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { TabsContent } from '@/Components/ui/Tabs';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface TabGalleryProps {
    associate: any;
}

export function TabGallery({ associate }: TabGalleryProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach(f => formData.append('images[]', f));

        router.post(route('admin.associates.gallery.upload', associate.id), formData as any, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => { if (fileInputRef.current) fileInputRef.current.value = ''; },
        });
    };

    const handleDelete = (path: string) => {
        if (!confirm('¿Eliminar esta imagen?')) return;
        router.post(route('admin.associates.gallery.delete', associate.id), { path }, { preserveScroll: true });
    };

    const handleSetCover = (path: string) => {
        router.post(route('admin.associates.gallery.cover', associate.id), { path }, { preserveScroll: true });
    };

    const gallery: { path: string; url: string }[] = associate.gallery_urls || [];
    const coverPath = associate.cover_path;

    return (
        <TabsContent value="gallery" className="space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                        <Camera size={16} className="text-slate-400" />
                        Galería de Imágenes
                    </h3>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleUpload}
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8 text-[10px] font-black uppercase tracking-wider border-slate-200 text-slate-600 hover:text-slate-900"
                        >
                            <Upload size={12} className="mr-1.5" /> Subir imágenes
                        </Button>
                    </div>
                </div>

                <CardContent className="p-6">
                    {gallery.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {gallery.map((img, i) => {
                                const isCover = img.path === coverPath;
                                return (
                                    <div key={i} className={cn(
                                        "group relative aspect-video rounded-xl overflow-hidden bg-slate-100 border shadow-sm",
                                        isCover ? "border-amber-400 ring-2 ring-amber-300" : "border-slate-200"
                                    )}>
                                        <img
                                            src={img.url}
                                            alt={`Gallery ${i}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />

                                        {isCover && (
                                            <div className="absolute top-2 left-2 bg-amber-400 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Star size={9} fill="white" /> Portada
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                            <button
                                                onClick={() => window.open(img.url, '_blank')}
                                                title="Ver"
                                                className="h-9 w-9 rounded-full bg-white/20 border border-white/30 text-white hover:bg-white/30 flex items-center justify-center transition-colors"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            {!isCover && (
                                                <button
                                                    onClick={() => handleSetCover(img.path)}
                                                    title="Usar como portada"
                                                    className="h-9 w-9 rounded-full bg-amber-400/80 border border-amber-300 text-white hover:bg-amber-400 flex items-center justify-center transition-colors"
                                                >
                                                    <Star size={15} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(img.path)}
                                                title="Eliminar"
                                                className="h-9 w-9 rounded-full bg-red-500/80 border border-red-400 text-white hover:bg-red-500 flex items-center justify-center transition-colors"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <Camera size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No hay imágenes registradas</p>
                            <p className="text-slate-400 text-[10px] mt-1 font-medium italic">Usa el botón "Subir imágenes" para agregar fotos.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    );
}
