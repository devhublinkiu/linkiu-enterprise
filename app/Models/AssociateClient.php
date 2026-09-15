<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Cliente del micrositio ("Quiénes somos"). Nombre + logo. Plan 0021.
 *
 * @property int $id
 * @property int $associate_id
 * @property string $name
 * @property string|null $logo_path
 * @property int $sort
 */
class AssociateClient extends Model
{
    protected $fillable = ['associate_id', 'name', 'logo_path', 'sort'];

    public function associate()
    {
        return $this->belongsTo(Associate::class);
    }
}
