<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Proyecto del micrositio (pestaña "Proyectos"). Plan 0021.
 *
 * @property-read Collection<int, AssociateProjectImage> $images
 */
class AssociateProject extends Model
{
    protected $fillable = ['associate_id', 'title', 'description', 'client', 'sort'];

    public function associate(): BelongsTo
    {
        return $this->belongsTo(Associate::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(AssociateProjectImage::class)->orderBy('sort');
    }
}
