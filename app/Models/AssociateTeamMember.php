<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Integrante del equipo del micrositio ("Quiénes somos"). Plan 0021.
 *
 * @property int $id
 * @property int $associate_id
 * @property string $name
 * @property string|null $position
 * @property string|null $photo_path
 * @property string|null $email
 * @property string|null $phone
 * @property int $sort
 */
class AssociateTeamMember extends Model
{
    protected $fillable = ['associate_id', 'name', 'position', 'photo_path', 'email', 'phone', 'sort'];

    public function associate()
    {
        return $this->belongsTo(Associate::class);
    }
}
