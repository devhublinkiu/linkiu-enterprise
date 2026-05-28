<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class DocumentRequirement extends Model
{
    protected $fillable = [
        'key', 'label', 'icon', 'accepts', 'is_required', 'is_active',
        'legend', 'template_path', 'display_order',
    ];

    protected $casts = [
        'accepts'     => 'array',
        'is_required' => 'boolean',
        'is_active'   => 'boolean',
    ];

    protected $appends = ['template_url'];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('id');
    }

    /**
     * Resolve template URL.
     * - Absolute http(s) URL → returned as-is
     * - Leading "/" → public asset (legacy /plantillas_docs/...)
     * - Otherwise → managed upload on the default disk (Minio/S3 →
     *   short-lived signed URL; local → Storage::url()).
     */
    public function getTemplateUrlAttribute(): ?string
    {
        if (empty($this->template_path)) {
            return null;
        }

        if (preg_match('#^https?://#i', $this->template_path) || str_starts_with($this->template_path, '/')) {
            return $this->template_path;
        }

        $disk    = config('filesystems.default');
        $storage = Storage::disk($disk);

        if (in_array($disk, ['s3', 'minio'], true)) {
            try {
                return $storage->temporaryUrl($this->template_path, now()->addHour());
            } catch (\Throwable $e) {
                return $storage->url($this->template_path);
            }
        }

        return $storage->url($this->template_path);
    }

    /**
     * Public-facing representation used by frontends (associate + admin).
     */
    public function toCatalogEntry(): array
    {
        return [
            'key'      => $this->key,
            'label'    => $this->label,
            'icon'     => $this->icon,
            'accepts'  => $this->accepts ?? [],
            'legend'   => $this->legend,
            'template' => $this->template_url,
        ];
    }
}
