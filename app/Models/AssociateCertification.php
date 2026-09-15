<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Certificación del micrositio ("Quiénes somos"). Máx. 5 por asociado. Plan 0021.
 *
 * @property int $id
 * @property int $associate_id
 * @property string $name
 * @property int|null $year
 * @property string|null $image_path
 * @property int $sort
 */
class AssociateCertification extends Model
{
    protected $fillable = ['associate_id', 'name', 'year', 'image_path', 'sort'];

    public function associate()
    {
        return $this->belongsTo(Associate::class);
    }
}
