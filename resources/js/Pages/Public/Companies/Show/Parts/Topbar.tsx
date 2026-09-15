import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';

import type { Company } from '../types';

type Section = { id: string; label: string };

export default function Topbar({
    company,
    sections,
    active,
    onNavigate,
}: {
    company: Company;
    sections: Section[];
    active: string;
    onNavigate: (id: string) => void;
}) {
    return (
        <div className="sticky top-0 z-40 border-b border-white/10 bg-[#14110d]/90 backdrop-blur-md">
            <div className="mx-auto flex h-[62px] max-w-[1180px] items-center gap-6 px-7">
                <button
                    onClick={() => onNavigate('top')}
                    className="flex items-center gap-3 font-display text-[0.95rem] font-bold text-[#ece6db]"
                >
                    <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-white/10 text-[0.66rem] font-extrabold text-[#d9531e]">
                        {company.logo ? (
                            <img
                                src={company.logo}
                                alt=""
                                className="size-full object-cover"
                            />
                        ) : (
                            company.name.slice(0, 3).toUpperCase()
                        )}
                    </span>
                    <span className="hidden truncate sm:block">
                        {company.name}
                    </span>
                </button>

                <nav className="ml-auto hidden gap-0.5 md:flex">
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => onNavigate(s.id)}
                            aria-current={active === s.id}
                            className={cn(
                                'rounded-md px-3.5 py-2 text-[0.85rem] font-medium transition-colors',
                                active === s.id
                                    ? 'bg-white/[0.11] text-white'
                                    : 'text-[#9a9287] hover:bg-white/[0.06] hover:text-[#ece6db]',
                            )}
                        >
                            {s.label}
                        </button>
                    ))}
                </nav>

                <Link
                    href={route('welcome')}
                    className="ml-auto rounded-lg bg-[#d9531e] px-4 py-2 text-[0.85rem] font-semibold text-white transition-colors hover:bg-[#b8410f] md:ml-0"
                >
                    Regresar a CAMEP
                </Link>
            </div>
        </div>
    );
}
