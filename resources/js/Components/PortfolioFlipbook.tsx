import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';

// Portafolio empresarial CAMEP como revista (page-flip). Portada sola y, al
// abrir, doble página; una sola en celular. Imágenes en public/images/portafolio.
const TOTAL = 21;
const PAGES = Array.from(
    { length: TOTAL },
    (_, i) => `/images/portafolio/${String(i + 1).padStart(2, '0')}.webp`,
);

type FlipController = {
    pageFlip: () => { flipNext: () => void; flipPrev: () => void };
};

export default function PortfolioFlipbook() {
    // react-pageflip no exporta un tipo de ref; se acota al controlador que usamos.
    const bookRef = useRef<FlipController | null>(null);

    const flip = (dir: 'next' | 'prev') => {
        const pf = bookRef.current?.pageFlip?.();
        if (!pf) return;
        dir === 'next' ? pf.flipNext() : pf.flipPrev();
    };

    return (
        <section className="bg-[#14110d] py-16 sm:py-20">
            <div className="mx-auto max-w-5xl px-4 text-center">
                <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                    Portafolio empresarial{' '}
                    <span className="text-orange-500">CAMEP</span>
                </h2>
                <p className="mt-2 text-sm text-white/60">
                    Pasa las páginas como una revista.
                </p>

                <div className="mt-8 flex justify-center">
                    {/* @ts-expect-error react-pageflip no trae tipos para los props/children */}
                    <HTMLFlipBook
                        ref={bookRef}
                        width={420}
                        height={594}
                        size="stretch"
                        minWidth={280}
                        minHeight={396}
                        maxWidth={520}
                        maxHeight={735}
                        showCover={true}
                        mobileScrollSupport={true}
                        maxShadowOpacity={0.4}
                        className="shadow-2xl"
                    >
                        {PAGES.map((src, i) => (
                            <div key={i} className="overflow-hidden bg-white">
                                <img
                                    src={src}
                                    alt={`Portafolio CAMEP, página ${i + 1}`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    draggable={false}
                                />
                            </div>
                        ))}
                    </HTMLFlipBook>
                </div>

                <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => flip('prev')}
                        aria-label="Página anterior"
                        className="grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => flip('next')}
                        aria-label="Página siguiente"
                        className="grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                    >
                        <ChevronRight className="size-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}
