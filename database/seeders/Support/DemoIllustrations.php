<?php

namespace Database\Seeders\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Generador de ILUSTRACIONES SVG para el seeding de demostración (solo local).
 * No usa fotos: dibuja marcas, portadas y banners con la paleta de marca. Los
 * archivos se escriben en el disco `public` (servido en APP_URL/storage) y se
 * devuelven como ruta relativa lista para guardar en las columnas *_path.
 *
 * Es seguro y repetible: sobrescribe el mismo archivo en cada corrida.
 */
class DemoIllustrations
{
    /** Paleta de marca (design.md). */
    public const INK = '#151515';
    public const YELLOW = '#FBDC1D';
    public const GREEN = '#00B53C';
    public const RED = '#D9141B';

    /** Combos [base oscuro, acento] para banners/portadas. */
    public const PALETTES = [
        ['#15231c', '#00B53C'],
        ['#1c1a12', '#FBDC1D'],
        ['#231416', '#D9141B'],
        ['#141b23', '#2f9e8f'],
        ['#1f1a23', '#8b6bd9'],
        ['#241c14', '#f08a24'],
    ];

    /** Escribe un SVG en el disco público y devuelve su ruta (o null si falla). */
    public static function put(string $path, string $svg): ?string
    {
        try {
            $ok = Storage::disk('public')->put($path, $svg);

            return $ok ? $path : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /** Marca cuadrada (logo) con iniciales. */
    public static function mark(string $path, string $initials, string $bg, string $fg = '#ffffff'): ?string
    {
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" rx="88" fill="{$bg}"/>
  <rect x="38" y="38" width="324" height="324" rx="68" fill="none" stroke="{$fg}" stroke-opacity="0.22" stroke-width="6"/>
  <text x="200" y="232" font-family="Arial, Helvetica, sans-serif" font-size="168" font-weight="800" letter-spacing="-6" fill="{$fg}" text-anchor="middle">{$initials}</text>
</svg>
SVG;

        return self::put($path, $svg);
    }

    /** Avatar circular (equipo) con iniciales. */
    public static function avatar(string $path, string $initials, string $bg): ?string
    {
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
  <circle cx="110" cy="110" r="110" fill="{$bg}"/>
  <text x="110" y="142" font-family="Arial, Helvetica, sans-serif" font-size="92" font-weight="700" fill="#ffffff" text-anchor="middle">{$initials}</text>
</svg>
SVG;

        return self::put($path, $svg);
    }

    /** Banner/portada abstracta. Con $title opcional sirve de slider "completo". */
    public static function banner(string $path, int $w, int $h, array $palette, ?string $title = null, ?string $subtitle = null): ?string
    {
        [$c1, $accent] = $palette;
        $c2 = self::shift($c1);
        $cx = (int) ($w * 0.80);
        $cy = (int) ($h * 0.22);
        $r = (int) ($h * 0.42);
        $hx = (int) ($w * 0.14);
        // Puntos precalculados: dentro de un heredoc NO se puede concatenar ni
        // operar; se interpola como variable simple.
        $poly = $w.','.$h.' '.($w - $hx * 2).','.$h.' '.$w.','.($h - $hx * 3);

        $text = '';
        if ($title !== null) {
            $tx = (int) ($w * 0.07);
            $ty = (int) ($h * 0.52);
            $title = self::esc($title);
            $barW = min(140, $w);
            $text .= "<rect x=\"{$tx}\" y=\"".($ty - 70)."\" width=\"64\" height=\"8\" fill=\"{$accent}\"/>";
            $text .= "<text x=\"{$tx}\" y=\"{$ty}\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"".(int) ($h * 0.13)."\" font-weight=\"800\" fill=\"#ffffff\">{$title}</text>";
            if ($subtitle !== null) {
                $subtitle = self::esc($subtitle);
                $sy = (int) ($h * 0.66);
                $text .= "<text x=\"{$tx}\" y=\"{$sy}\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"".(int) ($h * 0.055)."\" fill=\"#e8e8e8\">{$subtitle}</text>";
            }
        }

        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {$w} {$h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{$c1}"/><stop offset="1" stop-color="{$c2}"/>
    </linearGradient>
  </defs>
  <rect width="{$w}" height="{$h}" fill="url(#bg)"/>
  <circle cx="{$cx}" cy="{$cy}" r="{$r}" fill="{$accent}" fill-opacity="0.16"/>
  <circle cx="{$cx}" cy="{$cy}" r="{$r}" fill="none" stroke="{$accent}" stroke-opacity="0.35" stroke-width="2"/>
  <g fill="{$accent}" fill-opacity="0.12">
    <rect x="0" y="0" width="{$hx}" height="{$h}"/>
    <polygon points="{$poly}"/>
  </g>
  {$text}
</svg>
SVG;

        return self::put($path, $svg);
    }

    /** Insignia circular (certificación). */
    public static function badge(string $path, string $text): ?string
    {
        $text = self::esc($text);
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <circle cx="120" cy="120" r="116" fill="#ffffff" stroke="#151515" stroke-width="4"/>
  <circle cx="120" cy="120" r="96" fill="none" stroke="#FBDC1D" stroke-width="10"/>
  <text x="120" y="132" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="#151515" text-anchor="middle">{$text}</text>
</svg>
SVG;

        return self::put($path, $svg);
    }

    private static function esc(string $s): string
    {
        return htmlspecialchars($s, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    /** Aclara/oscurece ligeramente un hex para el degradado. */
    private static function shift(string $hex): string
    {
        $hex = ltrim($hex, '#');
        $r = min(255, (int) hexdec(substr($hex, 0, 2)) + 26);
        $g = min(255, (int) hexdec(substr($hex, 2, 2)) + 26);
        $b = min(255, (int) hexdec(substr($hex, 4, 2)) + 26);

        return sprintf('#%02x%02x%02x', $r, $g, $b);
    }
}
