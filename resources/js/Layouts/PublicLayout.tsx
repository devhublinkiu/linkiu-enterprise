import { PropsWithChildren } from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import FloatingWhatsApp from '@/Components/FloatingWhatsApp';
import { cn } from '@/lib/utils';

export default function PublicLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col">
            {/* Global Navigation */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow pt-[88px]">
                {children}
            </main>

            {/* Global Footer */}
            <Footer />

            {/* Floating WhatsApp Button */}
            <FloatingWhatsApp />
        </div>
    );
}
