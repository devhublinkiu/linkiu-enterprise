import React, { useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import {
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Share2,
    MoreHorizontal,
    Plus,
    Minus,
    LayoutGrid,
    ArrowRight,
    ArrowLeft,
    Info,
    FileText
} from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
// @ts-ignore
import HTMLFlipBook from 'react-pageflip';

// Page component required by react-pageflip
const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode, number: number }>((props, ref) => {
    return (
        <div className="bg-white shadow-sm overflow-hidden" ref={ref}>
            <div className="h-full w-full flex items-center justify-center p-0 select-none">
                {props.children}
            </div>
        </div>
    );
});

Page.displayName = 'Page';

export default function About() {
    const bookRef = useRef<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 15;

    const onPageChange = (e: any) => {
        setCurrentPage(e.data + 1);
    };

    const renderPage = (pageNum: number) => {
        return (
            <img
                src={`/images/camep/pdf_interactivo_acerca_de_nosotros/img_pdf_interactivo_${pageNum.toString().padStart(2, '0')}.webp`}
                alt={`Página ${pageNum}`}
                className="w-full h-full object-contain"
                onDragStart={(e) => e.preventDefault()}
            />
        );
    };

    return (
        <PublicLayout>
            <Head title="Sobre Nosotros" />

            {/* Hero Header */}
            <div className="relative bg-white border-b border-slate-100 py-16 md:py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                    <svg className="h-full w-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full mb-4 border border-green-100/50">
                                <Info size={14} strokeWidth={2.5} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Nuestra Institución</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                                SOBRE NOSOTROS
                            </h1>
                        </div>
                        <div className="hidden lg:block">
                            <div className="h-32 w-32 rounded-3xl bg-green-50 border border-green-100 flex items-center justify-center text-green-200 rotating-slow">
                                <FileText size={64} strokeWidth={1} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div className="h-1.5 w-24 bg-green-600 rounded-full"></div>
                            <p className="text-xl md:text-2xl font-medium text-slate-600 leading-relaxed text-left">
                                Desarrollamos capacidades de innovación en las empresas asociadas a <span className="text-green-700 font-black">CAMEP</span>,
                                para aumentar la productividad, competitividad, rentabilidad, sostenibilidad, escalabilidad y crecimiento económico y social en el Municipio de <span className="text-green-700 font-black">Puerto Gaitán Meta.</span>
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <img
                                src="/images/camep/img_acerca_de_nosotros_01.webp"
                                alt="CAMEP About Us"
                                className="w-full h-auto rounded-xl"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Interactive Magazine Section */}
            <section className="py-24 bg-[#0a0a0a] overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-black text-white uppercase tracking-wider">REVISTA INTERACTIVA CAMEP</h3>
                        <div className="h-1 w-24 bg-green-500 mx-auto mt-4"></div>
                    </div>

                    {/* Magazine Frame */}
                    <div className="relative flex flex-col items-center">
                        <div className="relative w-full aspect-[3/4] md:aspect-[3/2] bg-[#111] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] rounded-lg overflow-hidden flex flex-col border border-white/5">

                            {/* The Flipbook Viewport */}
                            <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-hidden bg-[#111]">
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {/* HTMLFlipBook is only client-side, handled by library */}
                                    <HTMLFlipBook
                                        width={450}
                                        height={600}
                                        size="stretch"
                                        minWidth={315}
                                        maxWidth={1000}
                                        minHeight={420}
                                        maxHeight={1533}
                                        maxShadowOpacity={0.5}
                                        showCover={true}
                                        mobileScrollSupport={true}
                                        onFlip={onPageChange}
                                        className="magazine-book"
                                        ref={bookRef}
                                        style={{ margin: '0 auto' }}
                                        startPage={0}
                                        drawShadow={true}
                                        flippingTime={1000}
                                        useMouseEvents={true}
                                        usePortrait={true}
                                        startZIndex={0}
                                        autoSize={true}
                                        clickEventForward={true}
                                        swipeDistance={30}
                                        showPageCorners={true}
                                        disableFlipByClick={false}
                                    >
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <Page key={i} number={i + 1}>
                                                {renderPage(i + 1)}
                                            </Page>
                                        ))}
                                    </HTMLFlipBook>
                                </div>

                                {/* Navigation Arrows */}
                                <button
                                    onClick={() => bookRef.current?.pageFlip().flipPrev()}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 md:p-5 text-white/50 hover:text-white transition-all z-50 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/10 group overflow-hidden shadow-2xl"
                                    aria-label="Página anterior"
                                >
                                    <ChevronLeft size={36} strokeWidth={2} className="group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                                <button
                                    onClick={() => bookRef.current?.pageFlip().flipNext()}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 md:p-5 text-white/50 hover:text-white transition-all z-50 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/10 group overflow-hidden shadow-2xl"
                                    aria-label="Página siguiente"
                                >
                                    <ChevronRight size={36} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>

                            {/* Toolbar */}
                            <div className="bg-[#111] h-16 w-full flex items-center justify-between px-10 border-t border-white/10">
                                <div className="flex items-center gap-8">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-slate-400 tracking-widest">{currentPage} / {totalPages}</span>
                                    </div>
                                    <div className="h-6 w-px bg-white/10"></div>
                                    <button className="text-slate-400 hover:text-white transition-colors"
                                        onClick={() => bookRef.current?.pageFlip().flip(0)}
                                    >
                                        <LayoutGrid size={20} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 mr-4">
                                        <button
                                            className="p-2 text-slate-400 hover:text-white transition-colors"
                                            onClick={() => bookRef.current?.pageFlip().flipPrev()}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            className="p-2 text-slate-400 hover:text-white transition-colors"
                                            onClick={() => bookRef.current?.pageFlip().flipNext()}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-white transition-colors"><Plus size={20} /></button>
                                    <button className="p-2 text-slate-400 hover:text-white transition-colors"><Minus size={20} /></button>
                                    <div className="mx-2 h-6 w-px bg-white/10"></div>
                                    <button className="p-2 text-slate-400 hover:text-white transition-colors"><Maximize2 size={20} /></button>
                                    <button className="p-2 text-slate-400 hover:text-white transition-colors"><Share2 size={20} /></button>
                                    <button className="p-2 text-slate-400 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Progress Tracker */}
                        <div className="mt-10 flex gap-1 md:gap-2 px-4 flex-wrap justify-center">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => bookRef.current?.pageFlip().flip(i)}
                                    className={cn(
                                        "h-1 transition-all duration-300 rounded-full",
                                        currentPage - 1 === i ? "w-8 bg-green-500" : "w-3 bg-white/10 hover:bg-white/30"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-20 text-center">
                        <a
                            href="/images/camep/pdf_interactivo_acerca_de_nosotros.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-slate-400 font-black uppercase tracking-[0.2em] h-14 px-12 hover:bg-white hover:text-black transition-all shadow-2xl">
                                <ArrowRight size={20} className="rotate-90" />
                                Descargar PDF Completo
                            </Button>
                        </a>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
