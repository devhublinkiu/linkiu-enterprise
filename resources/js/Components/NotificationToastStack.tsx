import React from 'react';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/hooks/useNotifications';

const CONFIG = {
    success: {
        bar:  'bg-emerald-500',
        bg:   'bg-emerald-50 border-emerald-200',
        icon: CheckCircle,
        iconColor: 'text-emerald-500',
        title: 'text-emerald-900',
        body:  'text-emerald-700',
    },
    error: {
        bar:  'bg-red-500',
        bg:   'bg-red-50 border-red-200',
        icon: XCircle,
        iconColor: 'text-red-500',
        title: 'text-red-900',
        body:  'text-red-700',
    },
    info: {
        bar:  'bg-indigo-500',
        bg:   'bg-indigo-50 border-indigo-200',
        icon: Info,
        iconColor: 'text-indigo-500',
        title: 'text-indigo-900',
        body:  'text-indigo-700',
    },
};

interface Props {
    notifications: NotificationItem[];
    dismiss: (id: string) => void;
}

export default function NotificationToastStack({ notifications, dismiss }: Props) {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {notifications.map(n => {
                const cfg = CONFIG[n.type];
                const Icon = cfg.icon;

                return (
                    <div
                        key={n.id}
                        className={cn(
                            'rounded-2xl border shadow-xl overflow-hidden pointer-events-auto',
                            'animate-in slide-in-from-bottom-4 fade-in duration-300',
                            cfg.bg
                        )}
                    >
                        <div className={cn('h-1 w-full', cfg.bar)} />
                        <div className="p-4 flex items-start gap-3">
                            <Icon size={20} className={cn('shrink-0 mt-0.5', cfg.iconColor)} />
                            <div className="flex-1 min-w-0">
                                <p className={cn('font-black text-sm uppercase tracking-tight', cfg.title)}>{n.title}</p>
                                <p className={cn('text-xs font-medium mt-0.5 leading-relaxed', cfg.body)}>{n.message}</p>
                            </div>
                            <button
                                onClick={() => dismiss(n.id)}
                                className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
