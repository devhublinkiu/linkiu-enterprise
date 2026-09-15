import {
    Facebook,
    Globe,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react';

import { WhatsappIcon, waLink } from '../icons';
import type { Company } from '../types';
import FacadeSlider from './FacadeSlider';

export default function ContactSection({ company }: { company: Company }) {
    const c = company.contact;
    const address =
        [c.address, company.legal.city, company.legal.department]
            .filter(Boolean)
            .join(', ') || null;

    const details = [
        { icon: Phone, label: 'Teléfono', value: c.phone },
        { icon: null, label: 'WhatsApp', value: c.whatsapp },
        { icon: Mail, label: 'Correo', value: c.email },
        { icon: Globe, label: 'Sitio web', value: c.website },
        { icon: MapPin, label: 'Dirección', value: address },
    ].filter((d) => d.value);

    return (
        <section id="contacto" className="py-[82px]">
            <div className="mx-auto max-w-[1180px] px-7">
                <h2 className="mb-[42px] font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold tracking-[-0.015em]">
                    Contacto
                </h2>

                <div className="grid items-start gap-[52px] md:grid-cols-[1.15fr_1fr]">
                    <div>
                        <h3 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-bold">
                            Trabajemos juntos
                        </h3>
                        <p className="mb-6 mt-3 max-w-[44ch] text-[1.02rem] text-[#6d685f]">
                            Cuéntanos tu operación y te respondemos el mismo
                            día. Atención comercial directa, sin intermediarios.
                        </p>

                        <div className="mb-[30px] flex flex-wrap gap-3">
                            {c.phone && (
                                <a
                                    href={`tel:${c.phone}`}
                                    className="inline-flex items-center gap-2.5 rounded-[10px] bg-[#d9531e] px-[22px] py-[13px] text-[0.9rem] font-semibold text-white"
                                >
                                    <Phone size={17} /> Llamar
                                </a>
                            )}
                            {c.whatsapp && (
                                <a
                                    href={waLink(c.whatsapp)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2.5 rounded-[10px] bg-[#1d7a56] px-[22px] py-[13px] text-[0.9rem] font-semibold text-white"
                                >
                                    <WhatsappIcon className="size-[17px]" />{' '}
                                    WhatsApp
                                </a>
                            )}
                            {c.email && (
                                <a
                                    href={`mailto:${c.email}`}
                                    className="inline-flex items-center gap-2.5 rounded-[10px] border border-[#cfc7b8] bg-white px-[22px] py-[13px] text-[0.9rem] font-semibold text-[#16130e]"
                                >
                                    <Mail size={17} /> Correo
                                </a>
                            )}
                        </div>

                        <dl className="border-t border-[#e3ddd2]">
                            {details.map((d) => (
                                <div
                                    key={d.label}
                                    className="flex items-center gap-3.5 border-b border-[#e3ddd2] py-3.5"
                                >
                                    <span className="grid size-[38px] shrink-0 place-items-center rounded-[10px] border border-[#e3ddd2] bg-white text-[#6d685f]">
                                        {d.icon ? (
                                            <d.icon size={17} />
                                        ) : (
                                            <WhatsappIcon className="size-[17px]" />
                                        )}
                                    </span>
                                    <div>
                                        <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-[#6d685f]">
                                            {d.label}
                                        </dt>
                                        <dd className="mt-0.5 text-[0.95rem] font-medium">
                                            {d.value}
                                        </dd>
                                    </div>
                                </div>
                            ))}
                        </dl>

                        {(c.facebook || c.instagram || c.linkedin) && (
                            <div className="mt-[22px] flex gap-2.5">
                                {c.facebook && (
                                    <Social href={c.facebook} label="Facebook">
                                        <Facebook size={18} />
                                    </Social>
                                )}
                                {c.instagram && (
                                    <Social
                                        href={c.instagram}
                                        label="Instagram"
                                    >
                                        <Instagram size={18} />
                                    </Social>
                                )}
                                {c.linkedin && (
                                    <Social href={c.linkedin} label="LinkedIn">
                                        <Linkedin size={18} />
                                    </Social>
                                )}
                            </div>
                        )}
                    </div>

                    {company.facades.length > 0 && (
                        <FacadeSlider images={company.facades} />
                    )}
                </div>
            </div>
        </section>
    );
}

function Social({
    href,
    label,
    children,
}: {
    href: string;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="grid size-10 place-items-center rounded-[10px] border border-[#e3ddd2] bg-white text-[#6d685f] transition-all hover:-translate-y-0.5 hover:text-[#d9531e]"
        >
            {children}
        </a>
    );
}
