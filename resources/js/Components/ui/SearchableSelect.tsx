import React, { useState } from 'react';
import { Label } from '@/Components/ui/Label';
import { 
    Search, 
    XCircle, 
    CheckCircle, 
    Plus, 
    ChevronDown, 
    Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
    label: string;
    value: any;
    onChange: (opt: any) => void;
    options: any[];
    placeholder?: string;
    required?: boolean;
    error?: string;
    loading?: boolean;
    disabled?: boolean;
    multiple?: boolean;
}

export function SearchableSelect({ 
    label, 
    value, 
    onChange, 
    options, 
    placeholder = "Seleccionar...", 
    required = false, 
    error, 
    loading = false, 
    disabled = false, 
    multiple = false 
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredOptions = options.filter((opt: any) =>
        (opt.name || opt.label || '').toLowerCase().includes(search.toLowerCase())
    );

    const isSelected = (opt: any) => {
        const optVal = opt.name || opt.label;
        if (multiple) {
            return Array.isArray(value) && value.includes(optVal);
        }
        return value === optVal;
    };

    const handleSelect = (opt: any) => {
        if (multiple) {
            onChange(opt);
        } else {
            onChange(opt);
            setOpen(false);
        }
        setSearch('');
    };

    return (
        <div className={cn("space-y-2 relative", open && "z-50")}>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            <div className="relative">
                <div 
                    onClick={() => !disabled && !loading && setOpen(!open)}
                    className={`
                        min-h-[50px] w-full flex flex-wrap gap-2 p-3 border-2 rounded-xl transition-all cursor-pointer bg-white group
                        ${open ? 'border-slate-900 ring-4 ring-slate-900/5' : 'border-slate-100 hover:border-slate-200'}
                        ${disabled ? 'bg-slate-50 opacity-70 cursor-not-allowed' : ''}
                        ${error ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}
                    `}
                >
                    {loading ? (
                        <div className="flex items-center gap-2 px-2 text-slate-400 text-sm">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="font-medium">Sincronizando...</span>
                        </div>
                    ) : (
                        <>
                            {multiple && Array.isArray(value) && value.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 flex-1">
                                    {value.map((v: string) => (
                                        <div key={v} className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-2 animate-in zoom-in-95">
                                            {v}
                                            <XCircle 
                                                size={12} 
                                                className="hover:text-red-400 transition-colors" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const opt = options.find((o: any) => (o.name || o.label) === v);
                                                    if (opt) handleSelect(opt);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : !multiple && value ? (
                                <span className="text-slate-900 text-sm font-bold flex-1 px-1">{value}</span>
                            ) : (
                                <span className="text-slate-400 text-sm font-medium flex-1 px-1">{placeholder}</span>
                            )}
                        </>
                    )}
                    <div className="flex items-center text-slate-400 group-hover:text-slate-600 transition-colors">
                        <ChevronDown size={18} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                {open && !loading && (
                    <div className="absolute z-[1000] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-3 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                            <Search size={16} className="text-slate-400" />
                            <input
                                className="w-full bg-transparent text-sm outline-none py-1 font-bold text-slate-700 placeholder:text-slate-300"
                                placeholder={`Escribe para filtrar ${label.toLowerCase()}...`}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.stopPropagation()}
                                autoFocus
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                                    <XCircle size={14} className="text-slate-400" />
                                </button>
                            )}
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt: any) => {
                                    const selected = isSelected(opt);
                                    return (
                                        <button
                                            key={opt.id || opt.name}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(opt);
                                            }}
                                            className={`
                                                w-full text-left px-4 py-3 text-xs rounded-xl flex items-center justify-between group transition-all mb-1 last:mb-0
                                                ${selected ? 'bg-slate-900 text-white font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'}
                                            `}
                                        >
                                            <span className="tracking-tight">{opt.name || opt.label}</span>
                                            {selected ? (
                                                <CheckCircle size={16} className="text-white" />
                                            ) : (
                                                <Plus size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center flex flex-col items-center gap-2">
                                    <Search size={24} className="text-slate-100" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Sin resultados</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-[10px] font-black uppercase mt-1 tracking-wider">{error}</p>}
        </div>
    );
}
