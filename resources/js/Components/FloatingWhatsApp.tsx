import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FloatingWhatsApp() {
    const phoneNumber = "573507880664";
    const message = "Hola CAMEP, me gustaría recibir más información.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "fixed bottom-8 right-8 z-[100]",
                "flex items-center justify-center",
                "w-16 h-16 rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/40",
                "hover:scale-110 active:scale-95 transition-all duration-300",
                "animate-bounce-subtle"
            )}
            aria-label="Contactar por WhatsApp"
        >
            <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25"></div>
            <img 
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                className="w-10 h-10 brightness-0 invert" 
                alt="WhatsApp" 
            />
        </a>
    );
}
