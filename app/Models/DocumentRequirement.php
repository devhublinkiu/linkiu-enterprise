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
     * - Otherwise → stored in the 'public' disk under document_templates/
     */
    public function getTemplateUrlAttribute(): ?string
    {
        if (empty($this->template_path)) {
            return null;
        }

        if (preg_match('#^https?://#i', $this->template_path) || str_starts_with($this->template_path, '/')) {
            return $this->template_path;
        }

        return Storage::disk('public')->url($this->template_path);
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
