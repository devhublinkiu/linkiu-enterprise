import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';

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
import { Textarea } from '@/Components/base/Textarea';
import AttachmentField from '@/Components/messaging/AttachmentField';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Nuevo mensaje del asociado hacia CAMEP: asunto + mensaje + adjuntos. No hay
// selector de destinatario — el hilo queda acotado a su empresa (ConversationPolicy).
export default function ComposeDialog({ open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<{ subject: string; body: string; attachments: File[] }>({
            subject: '',
            body: '',
            attachments: [],
        });

    const close = () => {
        reset();
        clearErrors();
        onOpenChange(false);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('associate.messages.store'), {
            forceFormData: true,
            onSuccess: () => close(),
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => (o ? onOpenChange(o) : close())}
        >
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nuevo mensaje</DialogTitle>
                    <DialogDescription>
                        Escríbele al equipo de CAMEP. Te responderán por aquí.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="assoc-subject">Asunto</Label>
                        <Input
                            id="assoc-subject"
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            maxLength={160}
                            placeholder="¿Sobre qué quieres escribir?"
                        />
                        {errors.subject && (
                            <p className="text-sm text-destructive">
                                {errors.subject}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="assoc-body">Mensaje</Label>
                        <Textarea
                            id="assoc-body"
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

                    <AttachmentField
                        id="assoc-files"
                        files={data.attachments}
                        onChange={(f) => setData('attachments', f)}
                        error={errors.attachments}
                    />

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
