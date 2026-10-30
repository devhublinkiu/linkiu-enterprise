import { useForm } from '@inertiajs/react';
import { Paperclip, Send, Users, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/Components/base/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/base/Dialog';
import { Input } from '@/Components/base/Input';
import { Label } from '@/Components/base/Label';
import { Tabs, TabsList, TabsTrigger } from '@/Components/base/Tabs';
import { Textarea } from '@/Components/base/Textarea';

import SearchPicker, { type PickerOption } from './SearchPicker';

type Mode = 'associate' | 'group';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    associates: PickerOption[];
    groups: PickerOption[];
}

// Compositor del admin: inicia un hilo con un asociado o difunde a un grupo
// (ADR-0012). El envío a grupo crea un hilo privado por asociado — nunca compartido.
export default function ComposeDialog({
    open,
    onOpenChange,
    associates,
    groups,
}: Props) {
    const [mode, setMode] = useState<Mode>('associate');

    const form = useForm<{
        associate_id: number | null;
        group_id: number | null;
        subject: string;
        body: string;
        attachments: File[];
    }>({
        associate_id: null,
        group_id: null,
        subject: '',
        body: '',
        attachments: [],
    });

    const { data, setData, errors, processing } = form;

    const close = () => {
        form.reset();
        form.clearErrors();
        onOpenChange(false);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const isAssociate = mode === 'associate';

        form.transform((d) =>
            isAssociate
                ? {
                      associate_id: d.associate_id,
                      subject: d.subject,
                      body: d.body,
                      attachments: d.attachments,
                  }
                : { group_id: d.group_id, subject: d.subject, body: d.body },
        );

        const url = isAssociate
            ? route('admin.messages.store')
            : route('admin.messages.broadcast');

        form.post(url, {
            forceFormData: isAssociate,
            onSuccess: () => {
                toast.success(
                    isAssociate ? 'Mensaje enviado.' : 'Mensaje en camino.',
                );
                close();
            },
        });
    };

    const removeFile = (idx: number) =>
        setData(
            'attachments',
            data.attachments.filter((_, i) => i !== idx),
        );

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => (o ? onOpenChange(o) : close())}
        >
            <DialogContent className="max-h-[90svh] gap-0 overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nuevo mensaje</DialogTitle>
                    <DialogDescription>
                        Escribe a un asociado o difunde a un grupo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="mt-4 space-y-4">
                    <Tabs
                        value={mode}
                        onValueChange={(v) => setMode(v as Mode)}
                    >
                        <TabsList className="w-full">
                            <TabsTrigger value="associate" className="flex-1">
                                A un asociado
                            </TabsTrigger>
                            <TabsTrigger value="group" className="flex-1">
                                <Users className="size-4" /> A un grupo
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {mode === 'associate' ? (
                        <div className="space-y-1.5">
                            <Label>Asociado</Label>
                            <SearchPicker
                                options={associates}
                                value={data.associate_id}
                                onChange={(id) => setData('associate_id', id)}
                                placeholder="Buscar empresa…"
                            />
                            {errors.associate_id && (
                                <p className="text-sm text-destructive">
                                    {errors.associate_id}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <Label>Grupo</Label>
                            <SearchPicker
                                options={groups}
                                value={data.group_id}
                                onChange={(id) => setData('group_id', id)}
                                placeholder="Buscar grupo…"
                                emptyLabel="Aún no hay grupos"
                            />
                            {errors.group_id && (
                                <p className="text-sm text-destructive">
                                    {errors.group_id}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="compose-subject">Asunto</Label>
                        <Input
                            id="compose-subject"
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            maxLength={160}
                            placeholder="Asunto del mensaje"
                        />
                        {errors.subject && (
                            <p className="text-sm text-destructive">
                                {errors.subject}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="compose-body">Mensaje</Label>
                        <Textarea
                            id="compose-body"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            rows={5}
                            maxLength={5000}
                            placeholder="Escribe tu mensaje…"
                        />
                        {errors.body && (
                            <p className="text-sm text-destructive">
                                {errors.body}
                            </p>
                        )}
                    </div>

                    {mode === 'associate' && (
                        <div className="space-y-2">
                            <div>
                                <input
                                    id="compose-files"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) =>
                                        setData(
                                            'attachments',
                                            [
                                                ...data.attachments,
                                                ...Array.from(
                                                    e.target.files ?? [],
                                                ),
                                            ].slice(0, 5),
                                        )
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <label htmlFor="compose-files">
                                        <Paperclip className="size-4" />
                                        Adjuntar archivos
                                    </label>
                                </Button>
                                <span className="ml-2 text-xs text-muted-foreground">
                                    Hasta 5 · 10 MB c/u
                                </span>
                            </div>
                            {data.attachments.length > 0 && (
                                <ul className="space-y-1">
                                    {data.attachments.map((f, i) => (
                                        <li
                                            key={`${f.name}-${i}`}
                                            className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs"
                                        >
                                            <span className="truncate">
                                                {f.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                className="shrink-0 text-muted-foreground hover:text-foreground"
                                                aria-label={`Quitar ${f.name}`}
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {errors.attachments && (
                                <p className="text-sm text-destructive">
                                    {errors.attachments}
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={close}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Send className="size-4" />
                            {processing ? 'Enviando…' : 'Enviar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
