import React from 'react';
import { useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Switch } from '@/Components/ui/Switch';
import { Label } from '@/Components/ui/Label';

interface StatusToggleProps {
    id: number;
    value: boolean;
    route: string;
    label?: string;
    onSuccess?: () => void;
}

export default function StatusToggle({ id, value, route: routeName, label, onSuccess }: StatusToggleProps) {
    const { post, processing } = useForm();

    const handleToggle = () => {
        post(route(routeName, id), {
            preserveScroll: true,
            onSuccess: () => {
                if (onSuccess) onSuccess();
            },
        });
    };

    return (
        <div className="flex items-center space-x-2">
            <Switch
                id={`toggle-${routeName}-${id}`}
                checked={value}
                onCheckedChange={handleToggle}
                disabled={processing}
                className={cn(
                    "data-[state=checked]:bg-emerald-500",
                    processing && "opacity-50"
                )}
            />
            {label && (
                <Label 
                    htmlFor={`toggle-${routeName}-${id}`}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none"
                >
                    {label}
                </Label>
            )}
        </div>
    );
}
