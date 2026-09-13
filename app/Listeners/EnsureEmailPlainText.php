<?php

namespace App\Listeners;

use Illuminate\Mail\Events\MessageSending;

/**
 * Garantiza que todo correo salga con una parte text/plain además del HTML.
 *
 * Enviar HTML sin alternativa de texto es una señal de spam habitual. Como las
 * plantillas son solo-HTML (react-email → Blade), este listener deriva un texto
 * plano del HTML cuando falta, de forma transversal (sin tocar los ~23 Mailables).
 * Ver plan 0004, corte 4K. Se engancha en AppServiceProvider.
 */
class EnsureEmailPlainText
{
    public function handle(MessageSending $event): void
    {
        $email = $event->message;

        // Solo si hay HTML y aún no hay texto (respeta un text/plain explícito).
        $html = $email->getHtmlBody();
        if ($html === null || $email->getTextBody() !== null) {
            return;
        }

        $email->text($this->htmlToText((string) $html));
    }

    /**
     * Conversión sencilla de HTML a texto legible (sin dependencias externas).
     */
    private function htmlToText(string $html): string
    {
        // Quita head/style/script con su contenido.
        $text = preg_replace('/<(head|style|script)\b[^>]*>.*?<\/\1>/is', '', $html) ?? $html;

        // Convierte cortes de bloque en saltos de línea.
        $text = preg_replace('/<\s*(br|\/p|\/div|\/tr|\/h[1-6]|\/li)\s*>/i', "\n", $text) ?? $text;

        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // Quita caracteres invisibles del relleno de <Preview> de react-email
        // (zero-width space/joiner, marcas L/R, word-joiner, BOM, soft hyphen).
        $text = preg_replace('/[\x{200B}-\x{200F}\x{2028}\x{2029}\x{2060}\x{FEFF}\x{00AD}]/u', '', $text) ?? $text;

        // Normaliza cualquier espacio Unicode (nbsp, etc.) a espacio normal.
        $text = preg_replace('/\p{Zs}/u', ' ', $text) ?? $text;

        // Normaliza espacios y líneas en blanco de más.
        $text = preg_replace('/[ \t]+/', ' ', $text) ?? $text;
        $text = preg_replace('/ *\n */', "\n", $text) ?? $text;
        $text = preg_replace('/\n{3,}/', "\n\n", $text) ?? $text;

        return trim($text);
    }
}
