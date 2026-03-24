<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssociateContact extends Model
{
    protected $fillable = [
        'associate_id', 'area', 'name', 'position', 'email', 'phone'
    ];

    public function associate()
    {
        return $this->belongsTo(Associate::class);
    }
}
