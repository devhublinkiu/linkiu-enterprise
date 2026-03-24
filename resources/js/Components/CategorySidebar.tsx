import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Card, CardContent } from '@/Components/ui/Card';
import { Separator } from '@/Components/ui/Separator';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface Category {
    id: number;
    name: string;
    slug: string;
    posts_count?: number;
}

interface CategorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

export default function CategorySidebar({ isOpen, onClose, categories }: CategorySidebarProps) {
    const [newName, setNewName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setIsCreating(true);
        setError(null);

        try {
            await axios.post(route('admin.blog.store-category'), { name: newName });
            setNewName('');
            router.reload({ only: ['categories'] });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear la categoría');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta categoría? Los posts asociados quedarán sin categoría.')) return;

        setIsDeleting(id);
        setError(null);

        try {
            await axios.delete(route('admin.blog.destroy-category', id));
            router.reload({ only: ['categories'] });
        } catch (err: any) {
            setError('No se pudo eliminar la categoría.');
        } finally {
            setIsDeleting(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-md transform transition-all duration-500 ease-in-out">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl border-l border-slate-100">
                        {/* Header */}
                        <div className="px-6 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Tag size={20} className="text-indigo-500" />
                                    Gestionar Categorías
                                </h2>
                                <p className="text-xs text-slate-500 mt-1 font-medium italic">Organiza tu contenido del blog</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-xl p-2 text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-sm group"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="flex-1 px-6 py-8 space-y-8">
                            {/* Create Form */}
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category-name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nueva Categoría</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="category-name"
                                            placeholder="Nombre de la categoría..."
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="h-11 rounded-xl border-slate-200 focus:ring-slate-900 focus:border-slate-900 shadow-sm"
                                            autoFocus
                                        />
                                        <Button 
                                            disabled={isCreating || !newName.trim()}
                                            className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg px-4"
                                        >
                                            {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                        </Button>
                                    </div>
                                    {error && (
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 bg-red-50 p-2 rounded-lg mt-2">
                                            <AlertCircle size={12} />
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </form>

                            <Separator className="bg-slate-100" />

                            {/* List */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Listado de Categorías</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <Card key={cat.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{cat.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">/{cat.slug} • {cat.posts_count} posts</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        disabled={isDeleting === cat.id}
                                                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                                    >
                                                        {isDeleting === cat.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                                    </button>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            <Tag size={32} className="mx-auto text-slate-200 mb-2" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No hay categorías</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="px-6 py-6 border-t border-slate-50 bg-slate-50/30">
                            <p className="text-[10px] text-slate-400 text-center italic font-medium leading-relaxed">
                                Estas categorías estarán disponibles globalmente en tus artículos del blog de CAMEP.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
