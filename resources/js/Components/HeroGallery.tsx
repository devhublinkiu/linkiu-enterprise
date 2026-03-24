import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
    id: number;
    image_path: string;
    image_url?: string;
}

interface Props {
    items: GalleryItem[];
}

export default function HeroGallery({ items }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        if (items.length <= 1) return;
        
        const timer = setInterval(() => {
            nextSlide();
        }, 6000);

        return () => clearInterval(timer);
    }, [currentIndex, items]);

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const getStorageUrl = (item: GalleryItem) => {
        if (item.image_url) return item.image_url;
        
        const baseUrl = import.meta.env.VITE_STORAGE_URL || '';
        return `${baseUrl.replace(/\/$/, '')}/${item.image_path}`;
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="relative w-full max-w-full overflow-hidden bg-slate-900 group aspect-[4/3] sm:aspect-[16/6] xl:aspect-[1920/600]">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={{
                        enter: (direction: number) => ({
                            x: direction > 0 ? '100%' : '-100%',
                            opacity: 0,
                            scale: 1.1
                        }),
                        center: {
                            zIndex: 1,
                            x: 0,
                            opacity: 1,
                            scale: 1
                        },
                        exit: (direction: number) => ({
                            zIndex: 0,
                            x: direction < 0 ? '100%' : '-100%',
                            opacity: 0,
                            scale: 1.1
                        })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.6 },
                        scale: { duration: 1.2 }
                    }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src={getStorageUrl(items[currentIndex])}
                        alt={`Gallery Item ${currentIndex + 1}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                        {items.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDirection(index > currentIndex ? 1 : -1);
                                    setCurrentIndex(index);
                                }}
                                className={`h-1.5 transition-all duration-300 rounded-full ${index === currentIndex ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
