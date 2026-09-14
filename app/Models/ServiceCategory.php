<?php

namespace App\Models;

use App\Models\Concerns\HasUniqueSlug;
use Illuminate\Database\Eloquent\Model;

class ServiceCategory extends Model
{
    use HasUniqueSlug;

    protected $fillable = ['name', 'slug', 'order'];

    protected $casts = [
        'order' => 'integer',
    ];

    public function services()
    {
        return $this->hasMany(Service::class, 'category_id');
    }
}
