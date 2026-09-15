import { useState } from 'react';

import type { Company } from '../types';
import Lightbox from './Lightbox';

const PLACEHOLDER =
    'radial-gradient(80% 90% at 20% 100%, rgba(217,83,30,0.28), transparent 50%), repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 26px), linear-gradient(150deg,#241f17,#12100c)';

// Proyectos en bloques alternados tipo revista. La imagen grande = primera foto;
// abre el visor con todas las del proyecto.
export default function ProjectsSection({ company }: { company: Company }) {
    const [viewer, setViewer] = useState<{
        images: string[];
        index: number | null;
    }>({ images: [], index: null });

    return (
        <section id="proyectos" className="border-b border-[#e3ddd2] py-[82px]">
            <div className="mx-auto max-w-[1180px] px-7">
                <h2 className="mb-[42px] font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold tracking-[-0.015em]">
                    Proyectos
                </h2>

                <div className="space-y-11">
                    {company.projects.map((p, idx) => (
                        <article
                            key={p.id}
                            className="grid items-center gap-11 md:grid-cols-[1.1fr_1fr]"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    p.images.length &&
                                    setViewer({ images: p.images, index: 0 })
                                }
                                className={`relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#e3ddd2] bg-[#14110d] ${
                                    idx % 2 === 1 ? 'md:order-2' : ''
                                }`}
                            >
                                {p.images[0] ? (
                                    <img
                                        src={p.images[0]}
                                        alt={p.title}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="size-full"
                                        style={{ background: PLACEHOLDER }}
                                    />
                                )}
                                {p.images.length > 1 && (
                                    <span className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                                        {p.images.length} fotos
                                    </span>
                                )}
                            </button>
                            <div>
                                {p.client && (
                                    <span className="text-[0.78rem] font-semibold text-[#b8410f]">
                                        Cliente · {p.client}
                                    </span>
                                )}
                                <h3 className="my-3 font-display text-[clamp(1.4rem,2.4vw,1.85rem)] font-bold">
                                    {p.title}
                                </h3>
                                {p.description && (
                                    <p className="max-w-[50ch] whitespace-pre-wrap text-[#6d685f]">
                                        {p.description}
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            <Lightbox
                images={viewer.images}
                index={viewer.index}
                onClose={() => setViewer((v) => ({ ...v, index: null }))}
                onIndex={(i) => setViewer((v) => ({ ...v, index: i }))}
            />
        </section>
    );
}
