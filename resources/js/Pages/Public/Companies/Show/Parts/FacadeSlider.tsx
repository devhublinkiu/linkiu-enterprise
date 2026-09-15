import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

// Slider cuadrado de la fachada (hasta 3 imágenes).
export default function FacadeSlider({ images }: { images: string[] }) {
    const [i, setI] = useState(0);
    const go = (n: number) => setI((n + images.length) % images.length);

    return (
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-[#e3ddd2] bg-[#14110d]">
            <div
                className="flex h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${i * 100}%)` }}
            >
                {images.map((img, idx) => (
                    <div key={idx} className="h-full min-w-full">
                        <img
                            src={img}
                            alt={`Fachada ${idx + 1}`}
                            className="size-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {images.length > 1 && (
                <>
                    <button
                        onClick={() => go(i - 1)}
                        aria-label="Anterior"
                        className="absolute left-3 top-1/2 grid size-[38px] -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[#14110d]/55 text-white backdrop-blur"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => go(i + 1)}
                        aria-label="Siguiente"
                        className="absolute right-3 top-1/2 grid size-[38px] -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-[#14110d]/55 text-white backdrop-blur"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 gap-[7px]">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setI(idx)}
                                aria-label={`Foto ${idx + 1}`}
                                className={cn(
                                    'size-2 rounded-full',
                                    idx === i ? 'bg-white' : 'bg-white/50',
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
