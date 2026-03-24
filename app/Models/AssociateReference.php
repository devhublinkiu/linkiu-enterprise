<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssociateReference extends Model
{
    protected $fillable = [
        'associate_id', 'type', 'name', 'contact_person', 'position', 'email', 'phone'
    ];

    public function associate()
    {
        return $this->belongsTo(Associate::class);
    }
}
