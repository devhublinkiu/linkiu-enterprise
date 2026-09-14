import { Facebook, Globe, Instagram, Linkedin, LucideIcon } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/base/Card';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/Components/base/InputGroup';

import FormField from '../../BasicInfo/Parts/FormField';
import { ContactsForm, SOCIAL_CHANNELS } from '../types';

interface Props {
    data: ContactsForm;
    setData: <K extends keyof ContactsForm>(
        key: K,
        value: ContactsForm[K],
    ) => void;
    errors: Partial<Record<string, string>>;
    disabled: boolean;
}

const ICONS: Record<string, LucideIcon> = {
    social_instagram: Instagram,
    social_facebook: Facebook,
    social_linkedin: Linkedin,
    social_other: Globe,
};

export default function DigitalChannels({
    data,
    setData,
    errors,
    disabled,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="size-4 text-muted-foreground" />
                    Canales digitales
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
                {SOCIAL_CHANNELS.map((ch) => {
                    const Icon = ICONS[ch.key];
                    return (
                        <FormField
                            key={ch.key}
                            id={ch.key}
                            label={ch.label}
                            error={errors[ch.key]}
                        >
                            <InputGroup>
                                <InputGroupAddon>
                                    <Icon aria-hidden />
                                </InputGroupAddon>
                                <InputGroupInput
                                    id={ch.key}
                                    value={data[ch.key] as string}
                                    onChange={(e) =>
                                        setData(ch.key, e.target.value)
                                    }
                                    disabled={disabled}
                                    placeholder={ch.placeholder}
                                />
                            </InputGroup>
                        </FormField>
                    );
                })}
            </CardContent>
        </Card>
    );
}
