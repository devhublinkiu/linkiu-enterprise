/**
 * Correo de nueva respuesta en el foro — React (plan 0004, corte 4I).
 * Compila a resources/views/emails/forum/new_reply.blade.php.
 * Vars del Mailable NewForumReply: $reply (->user->name, ->topic->title,
 * ->topic->category->slug, ->topic->slug, ->content).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailLayout } from '../components/EmailLayout';
import { blade, bladeRaw } from '../lib/blade';

export const view = 'emails/forum/new_reply';

// Caja de cita (info): borde izquierdo teal, sin borde completo (porta .reply-box).
const replyBox = {
    background: '#f1f8ff',
    borderLeft: '5px solid #17a2b8',
    padding: '15px',
    margin: '15px 0',
};

export default function NewReply(): React.ReactElement {
    return (
        <EmailLayout
            title="Nueva Respuesta en el Foro"
            preview="Respondieron a tu debate en el foro de CAMEP."
        >
            <Text>Hola,</Text>
            <Text>
                <strong>{blade('$reply->user->name')}</strong> ha respondido a
                tu debate{' '}
                <strong>&quot;{blade('$reply->topic->title')}&quot;</strong>.
            </Text>

            <Section style={replyBox}>
                <p style={{ margin: 0 }}>
                    &quot;
                    {bladeRaw('nl2br(e(Str::limit($reply->content, 150)))')}
                    &quot;
                </p>
            </Section>

            <Text>
                Haz clic abajo para leer la respuesta completa y continuar la
                conversación.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton
                    href={blade(
                        "route('forums.topic', [$reply->topic->category->slug, $reply->topic->slug])",
                    )}
                >
                    Ir al Debate
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
