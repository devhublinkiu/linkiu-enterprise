import { Check } from 'lucide-react';

import type { Company } from '../types';

export default function Hero({ company }: { company: Company }) {
    const year = company.legal.constitution_date?.split('/')?.[2] ?? null;
    const place = [company.legal.city, company.legal.department]
        .filter(Boolean)
        .join(', ');

    return (
        <header id="top" className="relative overflow-hidden bg-[#14110d]">
            {/* Fondo: portada o degradado industrial */}
            {company.cover ? (
                <div className="absolute inset-0">
                    <img
                        src={company.cover}
                        alt=""
                        className="size-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14110d] via-[#14110d]/70 to-[#14110d]/40" />
                </div>
            ) : (
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(120% 90% at 80% 6%, rgba(217,83,30,0.30), transparent 46%), linear-gradient(180deg,#241f18 0%,#14110d 62%)',
                    }}
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
