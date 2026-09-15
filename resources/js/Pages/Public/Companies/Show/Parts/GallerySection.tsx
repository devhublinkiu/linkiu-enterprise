import { useState } from 'react';

import type { Company } from '../types';
import Lightbox from './Lightbox';

const MAX_TILES = 12; // 6 columnas × 2 filas

export default function GallerySection({ company }: { company: Company }) {
    const [index, setIndex] = useState<number | null>(null);
    const total = company.gallery.length;
    const overflow = total > MAX_TILES;
    const shown = overflow
        ? company.gallery.slice(0, MAX_TILES - 1)
        : company.gallery;
    const rest = total - shown.length;

    return (
        <section id="galeria" className="border-b border-[#e3ddd2] py-[82px]">
            <div className="mx-auto max-w-[1180px] px-7">
                <h2 className="mb-[42px] font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold tracking-[-0.015em]">
                    Galería
                </h2>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                    {shown.map((img, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setIndex(i)}
                            className="aspect-square overflow-hidden rounded-[10px] border border-[#e3ddd2] bg-[#14110d]"
                        >
                            <img
                                src={img}
                                alt={`Foto ${i + 1}`}
                                className="size-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                        </button>
                    ))}
                    {overflow && (
                        <button
                            type="button"
                            onClick={() => setIndex(MAX_TILES - 1)}
                            className="relative grid aspect-square place-items-center overflow-hidden rounded-[10px] border border-[#e3ddd2] bg-[#14110d] text-center text-white"
                        >
                            <img
                                src={company.gallery[MAX_TILES - 1]}
                                alt=""
                                className="absolute inset-0 size-full object-cover opacity-40"
                            />
                            <span className="relative font-display text-[1.1rem] font-bold">
                                +{rest}
                                <small className="mt-0.5 block text-[0.66rem] font-medium uppercase tracking-wide text-[#9a9287]">
                                    Ver todas
                                </small>
                            </span>
                        </button>
                    )}
                </div>
                <p className="mt-4 text-[0.8rem] text-[#6d685f]">
                    {total} {total === 1 ? 'foto' : 'fotos'}.
                </p>
            </div>

            <Lightbox
                images={company.gallery}
                index={index}
                onClose={() => setIndex(null)}
                onIndex={setIndex}
            />
        </section>
    );
}
