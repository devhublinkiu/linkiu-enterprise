import { Wrench } from 'lucide-react';

import type { Company } from '../types';

const PLACEHOLDER =
    'radial-gradient(90% 120% at 80% 0%, rgba(217,83,30,0.4), transparent 55%), repeating-linear-gradient(115deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 13px), linear-gradient(160deg,#2a241c,#141009)';

export default function ServicesSection({ company }: { company: Company }) {
    return (
        <section id="servicios" className="border-b border-[#e3ddd2] py-[82px]">
            <div className="mx-auto max-w-[1180px] px-7">
                <h2 className="mb-[42px] font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold tracking-[-0.015em]">
                    Servicios
                </h2>
                <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
                    {company.services.map((s) => (
                        <article
                            key={s.id}
                            className="flex flex-col overflow-hidden rounded-2xl border border-[#e3ddd2] bg-white transition-all hover:-translate-y-1 hover:shadow-[0_20px_44px_-24px_rgba(30,20,10,0.42)]"
                        >
                            <div className="relative aspect-[5/3] overflow-hidden bg-[#14110d]">
                                {s.cover ? (
                                    <img
                                        src={s.cover}
                                        alt={s.name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="size-full"
                                        style={{ background: PLACEHOLDER }}
                                    />
                                )}
                                {s.category && (
                                    <span className="absolute left-3 top-3 rounded-md bg-[#d9531e]/95 px-2.5 py-[5px] text-[0.66rem] font-semibold uppercase tracking-wide text-white">
                                        {s.category}
                                    </span>
                                )}
                            </div>
                            <div className="p-[22px]">
                                <h3 className="font-display text-[1.14rem] font-semibold">
                                    {s.name}
                                </h3>
                                {s.description && (
                                    <p className="mt-2 text-[0.94rem] leading-[1.55] text-[#6d685f]">
                                        {s.description}
                                    </p>
                                )}
                                {!s.description && !s.cover && (
                                    <p className="mt-2 flex items-center gap-1.5 text-[0.85rem] text-[#a89f8f]">
                                        <Wrench size={13} /> Servicio ofrecido
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
