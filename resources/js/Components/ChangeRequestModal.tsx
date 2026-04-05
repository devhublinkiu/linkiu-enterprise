import React, { useState } from 'react';
import { Button } from '@/Components/ui/Button';
import { Label } from '@/Components/ui/Label';
import { X, Info } from 'lucide-react';

interface Props {
    field: string;
    fieldLabel?: string;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    isSubmitting: boolean;
}

export function ChangeRequestModal({ field, fieldLabel, onClose, onSubmit, isSubmitting }: Props) {
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Solicitar cambio</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Campo: <span className="font-bold text-slate-700">{fieldLabel ?? field}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-4 pt-1">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2.5">
                        <Info className="text-blue-500 mt-0.5 shrink-0" size={14} />
                        <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                            Explica brevemente por qué necesitas modificar este dato ya aprobado. El administrador revisará tu solicitud.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                            Explicación del motivo
                        </Label>
                        <textarea
                            className="w-full rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 h-28 resize-none p-3 bg-slate-50/50"
                            placeholder="Ej. Se requiere actualizar este dato por..."
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <Button
                            variant="outline"
                            className="rounded-xl h-10 px-4 text-xs font-bold"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cerrar
                        </Button>
                        <Button
                            className="bg-slate-900 text-white rounded-xl h-10 px-5 text-xs font-bold shadow-lg hover:bg-slate-800"
                            disabled={!reason.trim() || isSubmitting}
                            onClick={() => onSubmit(reason)}
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
