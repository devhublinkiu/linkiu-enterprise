import type { Company } from '../types';

// Ficha legal discreta, horizontal, justo bajo el hero.
export default function Factbar({ company }: { company: Company }) {
    const type = Array.isArray(company.legal.company_type)
        ? company.legal.company_type.join(', ')
        : company.legal.company_type;

    const items = [
        { label: 'NIT', value: company.nit },
        { label: 'Rep. legal', value: company.legal.rep_name },
        { label: 'CIIU', value: company.legal.main_ciiu },
        { label: 'Tipo', value: type },
        { label: 'Constitución', value: company.legal.constitution_date },
    ].filter((i) => i.value);

    if (items.length === 0) return null;

    return (
        <div className="mx-auto max-w-[1180px] px-7">
            <dl className="flex flex-wrap gap-x-14 gap-y-3.5 border-b border-[#e3ddd2] py-5">
                {items.map((i) => (
                    <div key={i.label}>
                        <dt className="mb-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#6d685f]">
                            {i.label}
                        </dt>
                        <dd className="text-[0.94rem] font-semibold tabular-nums text-[#16130e]">
                            {i.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
