import React from 'react';
import { Globe, Eye } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { TabsContent } from '@/Components/ui/Tabs';
import { cn } from '@/lib/utils';

interface TabGalleryProps {
    associate: any;
    auditState: any;
    handleAudit: (field: string, status: string, reason?: string) => void;
}

export function TabGallery({ associate, auditState, handleAudit }: TabGalleryProps) {
    return (
        <TabsContent value="gallery" className="space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                        <Globe size={16} className="text-slate-400" />
                        Galería de Imágenes
                    </h3>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={() => handleAudit('gallery_paths', 'approved')} 
                            className={cn("h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg shadow-sm border-none", 
                                auditState['gallery_paths']?.status === 'approved' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                            )}
                        >
                            Aprobar Todo
                        </Button>
                        <Button 
                            onClick={() => handleAudit('gallery_paths', 'rejected')} 
                            variant="outline" 
                            className={cn("h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg", 
                                auditState['gallery_paths']?.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            )}
                        >
                            Rechazar Todo
                        </Button>
                    </div>
                </div>
                <CardContent className="p-8">
                    {associate.gallery_urls && associate.gallery_urls.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {associate.gallery_urls.map((img: any, i: number) => (
                                <div key={i} className="group relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                                    <img 
                                        src={img.url} 
                                        alt={`Gallery ${i}`} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <Button 
                                            variant="ghost" 
                                            className="text-white hover:bg-white/20 h-12 w-12 rounded-full p-0 flex items-center justify-center bg-white/10 border border-white/20" 
                                            onClick={() => window.open(img.url, '_blank')}
                                        >
                                            <Eye size={24} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <Globe size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No hay imágenes registradas</p>
                            <p className="text-slate-400 text-[10px] mt-1 font-medium italic">El asociado no ha cargado fotos aún.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    );
}
