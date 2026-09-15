import { Award, Image as ImageIcon, Mail, Phone } from 'lucide-react';

import { WhatsappIcon, waLink } from '../icons';
import type { Company } from '../types';

const IBTN =
    'grid size-[34px] place-items-center rounded-full border border-[#cfc7b8] bg-white text-[#6d685f] transition-all hover:-translate-y-0.5 hover:text-white';

export default function AboutSection({ company }: { company: Company }) {
    const story = company.about_story || company.description;
    const aboutImg = company.about_image || company.cover;

    return (
        <section id="quienes" className="border-b border-[#e3ddd2] py-[82px]">
            <div className="mx-auto max-w-[1180px] px-7">
                <h2 className="mb-[42px] font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold tracking-[-0.015em]">
                    Quiénes somos
                </h2>

                <div
                    className={`grid items-start gap-14 ${aboutImg ? 'md:grid-cols-[1.4fr_1fr]' : ''}`}
                >
                    <div className="space-y-4">
                        {story ? (
                            <p className="max-w-[62ch] whitespace-pre-wrap text-[1.06rem] leading-relaxed text-[#6d685f]">
                                {story}
                            </p>
                        ) : (
                            <p className="text-[#6d685f]">
                                Esta empresa aún no ha escrito su historia.
                            </p>
                        )}
                    </div>
                    {aboutImg && (
                        <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-[#e3ddd2] bg-[#14110d]">
                            <img
                                src={aboutImg}
                                alt={company.name}
                                className="size-full object-cover"
                            />
                        </div>
                    )}
                </div>

                {company.certifications.length > 0 && (
                    <>
                        <p className="mb-5 mt-[54px] text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[#6d685f]">
                            Certificaciones
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {company.certifications.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-center gap-3.5 rounded-xl border border-[#e3ddd2] bg-white py-3.5 pl-3.5 pr-[18px]"
                                >
                                    <span className="grid size-9 place-items-center overflow-hidden rounded-[10px] bg-[#f6ece3] text-[#b8410f]">
                                        {c.image ? (
                                            <img
                                                src={c.image}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <Award size={19} />
                                        )}
                                    </span>
                                    <span className="text-[0.9rem] font-semibold leading-tight">
                                        {c.name}
                                        {c.year && (
                                            <small className="mt-0.5 block text-[0.74rem] font-medium text-[#6d685f]">
                                                {c.year}
                                            </small>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {company.team.length > 0 && (
                    <>
                        <p className="mb-5 mt-[54px] text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[#6d685f]">
                            Nuestro equipo
                        </p>
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                            {company.team.map((m) => (
                                <div key={m.id}>
                                    <div className="aspect-square overflow-hidden rounded-2xl border border-[#e3ddd2] bg-gradient-to-b from-[#e6ddcd] to-[#d3c8b4]">
                                        {m.photo && (
                                            <img
                                                src={m.photo}
                                                alt={m.name}
                                                className="size-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <h4 className="mb-0.5 mt-4 font-display text-[1.05rem] font-semibold">
                                        {m.name}
                                    </h4>
                                    {m.position && (
                                        <div className="text-[0.84rem] text-[#6d685f]">
                                            {m.position}
                                        </div>
                                    )}
                                    <div className="mt-3.5 flex gap-2">
                                        {m.phone && (
                                            <a
                                                href={waLink(m.phone)}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label="WhatsApp"
                                                className={`${IBTN} hover:border-[#1d7a56] hover:bg-[#1d7a56]`}
                                            >
                                                <WhatsappIcon className="size-4" />
                                            </a>
                                        )}
                                        {m.phone && (
                                            <a
                                                href={`tel:${m.phone}`}
                                                aria-label="Llamar"
                                                className={`${IBTN} hover:border-[#16130e] hover:bg-[#16130e]`}
                                            >
                                                <Phone size={16} />
                                            </a>
                                        )}
                                        {m.email && (
                                            <a
                                                href={`mailto:${m.email}`}
                                                aria-label="Correo"
                                                className={`${IBTN} hover:border-[#d9531e] hover:bg-[#d9531e]`}
                                            >
                                                <Mail size={16} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {company.clients.length > 0 && (
                    <>
                        <p className="mb-5 mt-[54px] text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[#6d685f]">
                            Clientes
                        </p>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            {company.clients.map((c) => (
                                <div key={c.id}>
                                    <div className="grid aspect-[2.6/1] place-items-center px-3 py-2">
                                        {c.logo ? (
                                            <img
                                                src={c.logo}
                                                alt={c.name}
                                                className="max-h-[62px] max-w-full object-contain"
                                            />
                                        ) : (
                                            <ImageIcon
                                                size={32}
                                                className="text-[#c3bbac]"
                                            />
                                        )}
                                    </div>
                                    <div className="mt-1 text-center text-[0.78rem] font-medium text-[#6d685f]">
                                        {c.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
