<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Proyecto del micrositio (pestaña "Proyectos"). Plan 0021.
 */
class AssociateProject extends Model
{
    protected $fillable = ['associate_id', 'title', 'description', 'client', 'sort'];

    public function associate()
    {
        return $this->belongsTo(Associate::class);
    }

    public function images()
    {
        return $this->hasMany(AssociateProjectImage::class)->orderBy('sort');
    }
}
