/**
 * Aviso al admin: nuevo debate en el foro — React (plan 0004, corte 4G).
 * Compila a resources/views/emails/admin/new_forum_topic_alert.blade.php.
 * Vars del Mailable NewForumTopicAlert: $topic (->user->name, ->category->name,
 * ->category->slug, ->title, ->slug).
 */
import { Section, Text } from '@react-email/components';
import * as React from 'react';

import { EmailButton } from '../components/EmailButton';
import { EmailLayout } from '../components/EmailLayout';
import { blade } from '../lib/blade';

export const view = 'emails/admin/new_forum_topic_alert';

export default function NewForumTopicAlert(): React.ReactElement {
    return (
        <EmailLayout
            title="Nuevo Debate en el Foro"
            preview="Se inició un nuevo debate en el foro."
        >
            <Text>Administrador,</Text>
            <Text>
                El usuario <strong>{blade('$topic->user->name')}</strong> ha
                iniciado un nuevo debate en la categoría{' '}
                <strong>{blade('$topic->category->name')}</strong>.
            </Text>

            <Text style={{ margin: '4px 0' }}>
                <strong>Título:</strong> {blade('$topic->title')}
            </Text>

            <Text>
                Por favor, revise el contenido para moderación preventiva.
            </Text>

            <Section style={{ textAlign: 'center' }}>
                <EmailButton
                    href={blade(
                        "route('forums.topic', [$topic->category->slug, $topic->slug])",
                    )}
                >
                    Revisar Debate
                </EmailButton>
            </Section>
        </EmailLayout>
    );
}
