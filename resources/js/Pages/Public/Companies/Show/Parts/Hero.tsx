import { Check } from 'lucide-react';

import type { Company } from '../types';

// Portada "gradiente": versión estática (sin WebGL) que imita el shader de marca
// —un resplandor rojo CAMEP a la izquierda sobre carbón—. Cero peso, cero three.js.
export const HERO_GRADIENT =
    'radial-gradient(75% 130% at 12% 6%, #d9141b 0%, rgba(217,20,27,0.55) 20%, rgba(217,20,27,0.12) 42%, transparent 60%), radial-gradient(55% 85% at 90% 96%, rgba(217,20,27,0.12), transparent 55%), linear-gradient(150deg, #210d0e 0%, #151515 52%, #0f0e0e 100%)';

export default function Hero({ company }: { company: Company }) {
    const year = company.legal.constitution_date?.split('/')?.[2] ?? null;
    const place = [company.legal.city, company.legal.department]
        .filter(Boolean)
        .join(', ');

    const useImage =
        company.portada.type === 'image' && !!company.portada.image;

    return (
        <header id="top" className="relative overflow-hidden bg-[#14110d]">
            {/* Portada: imagen propia o gradiente de marca (estático) */}
            {useImage ? (
                <div className="absolute inset-0">
                    <img
                        src={company.portada.image ?? undefined}
                        alt=""
                        className="size-full object-cover opacity-45"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14110d] via-[#14110d]/70 to-[#14110d]/40" />
                </div>
            ) : (
                <div
                    className="absolute inset-0"
                    style={{ background: HERO_GRADIENT }}
                />
            )}

            <div className="relative mx-auto max-w-[1180px] px-7 pb-[60px] pt-[76px]">
                <div className="mb-7 flex items-center gap-8">
                    <div className="relative shrink-0">
                        <div
                            className="grid size-[132px] place-items-center overflow-hidden rounded-full bg-white font-display text-[1.5rem] font-extrabold text-[#b8410f]"
                            style={
                                company.is_verified
                                    ? { boxShadow: '0 0 0 3px #1d7a56' }
                                    : undefined
                            }
                        >
                            {company.logo ? (
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="size-full object-cover"
                                />
                            ) : (
                                company.name.slice(0, 3).toUpperCase()
                            )}
                        </div>
                        {company.is_verified && (
                            <span
                                className="absolute bottom-1.5 right-1.5 grid size-9 place-items-center rounded-full border-[3px] border-[#171310] bg-[#1d7a56] text-white"
                                title="Empresa verificada"
                            >
                                <Check size={18} strokeWidth={3.2} />
                            </span>
                        )}
                    </div>

                    <h1 className="font-display text-[clamp(2.6rem,6vw,5rem)] font-bold leading-[0.99] tracking-[-0.025em] text-white">
                        {company.name}
                    </h1>
                </div>

                <dl className="mt-9 flex flex-wrap gap-x-12 gap-y-3.5">
                    {place && <Meta label="Sede" value={place} />}
                    {year && <Meta label="Fundación" value={year} />}
                </dl>
            </div>
        </header>
    );
}

function Meta({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="mb-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#9a9287]">
                {label}
            </dt>
            <dd className="text-[1rem] font-semibold tabular-nums text-[#ece6db]">
                {value}
            </dd>
        </div>
    );
}
