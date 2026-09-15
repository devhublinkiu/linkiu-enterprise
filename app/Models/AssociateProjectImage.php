<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Imagen de un proyecto del micrositio (tabla hija). Plan 0021.
 */
class AssociateProjectImage extends Model
{
    protected $fillable = ['associate_project_id', 'path', 'sort'];

    public function project()
    {
        return $this->belongsTo(AssociateProject::class, 'associate_project_id');
    }
}
