import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import React from 'react';

// Visor de imágenes reutilizable (galería y proyectos). Imágenes libres.
export default function Lightbox({
    images,
    index,
    onClose,
    onIndex,
}: {
    images: string[];
    index: number | null;
    onClose: () => void;
    onIndex: (i: number) => void;
}) {
    if (index === null || images.length === 0) return null;

    const go = (delta: number) => (e: React.MouseEvent) => {
        e.stopPropagation();
        onIndex((index + delta + images.length) % images.length);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={onClose}
        >
            <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-6 text-white">
                <span className="rounded-full bg-black/20 px-4 py-1.5 text-sm font-semibold">
                    {index + 1} / {images.length}
                </span>
                <button
                    className="rounded-full bg-white/10 p-3 transition-colors hover:bg-white/20"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    <X size={22} />
                </button>
            </div>

            {images.length > 1 && (
                <>
                    <button
                        className="absolute left-4 rounded-full border border-white/10 bg-white/5 p-4 text-white transition-colors hover:bg-orange-600 md:left-8"
                        onClick={go(-1)}
                        aria-label="Anterior"
                    >
                        <ArrowLeft size={28} />
                    </button>
                    <button
                        className="absolute right-4 rounded-full border border-white/10 bg-white/5 p-4 text-white transition-colors hover:bg-orange-600 md:right-8"
                        onClick={go(1)}
                        aria-label="Siguiente"
                    >
                        <ArrowRight size={28} />
                    </button>
                </>
            )}

            <img
                key={index}
                src={images[index]}
                alt={`Imagen ${index + 1}`}
                className="max-h-[85vh] max-w-full rounded-lg border border-white/10 object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
