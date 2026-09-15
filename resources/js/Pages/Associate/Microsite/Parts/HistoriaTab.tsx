import { useForm } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/Components/base/Button';
import { Label } from '@/Components/base/Label';
import { Textarea } from '@/Components/base/Textarea';

import ImagePicker from './ImagePicker';

const STORY_MAX = 1500;

export default function HistoriaTab({
    about,
}: {
    about: { story: string | null; image_url: string | null };
}) {
    const [preview, setPreview] = useState(about.image_url);
    const form = useForm({
        about_story: about.story ?? '',
        about_image: null as File | null,
        remove_about_image: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('associate.company.microsite.story.update'), {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor="story">Nuestra historia</Label>
                    <span
                        className={`text-xs ${
                            form.data.about_story.length > STORY_MAX
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                        }`}
                    >
                        {form.data.about_story.length} / {STORY_MAX}
                    </span>
                </div>
                <Textarea
                    id="story"
                    rows={7}
                    maxLength={STORY_MAX}
                    value={form.data.about_story}
                    onChange={(e) =>
                        form.setData('about_story', e.target.value)
                    }
                    placeholder="Cuenta la trayectoria de tu empresa…"
                />
                <p className="text-xs text-muted-foreground">
                    Ideal: 2 o 3 párrafos cortos. Separa cada párrafo con un
                    renglón en blanco.
                </p>
            </div>
            <div className="space-y-1.5">
                <span className="text-sm font-medium">Imagen</span>
                <ImagePicker
                    label="Imagen"
                    shape="tall"
                    hint="Imagen vertical (proporción 4:5). Formatos JPG, PNG o WEBP. Máximo 5 MB. Medida ideal 1000x1250 px."
                    previewUrl={preview}
                    onPick={(f, u) => {
                        form.setData('about_image', f);
                        form.setData('remove_about_image', false);
                        setPreview(u);
                    }}
                    onRemove={() => {
                        form.setData('about_image', null);
                        form.setData('remove_about_image', true);
                        setPreview(null);
                    }}
                />
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? 'Guardando…' : 'Guardar historia'}
                </Button>
            </div>
        </form>
    );
}
