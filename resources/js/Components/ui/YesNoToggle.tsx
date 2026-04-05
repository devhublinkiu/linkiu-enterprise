import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
    value: boolean | null;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    yesLabel?: string;
    noLabel?: string;
}

export function YesNoToggle({ value, onChange, disabled, yesLabel = 'SÍ', noLabel = 'NO' }: Props) {
    return (
        <div className="flex gap-3">
            {([true, false] as const).map(v => (
                <button
                    key={String(v)}
                    type="button"
                    onClick={() => !disabled && onChange(v)}
                    disabled={disabled}
                    className={cn(
                        "flex-1 py-3.5 rounded-2xl text-[11px] font-black tracking-widest transition-all border-2 uppercase",
                        value === v && value !== null
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02]"
                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:bg-slate-50",
                        disabled && "opacity-40 cursor-not-allowed pointer-events-none"
                    )}
                >
                    {v ? yesLabel : noLabel}
                </button>
            ))}
        </div>
    );
}
