<?php

namespace App\Models;

use App\Models\Concerns\HasUniqueSlug;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasUniqueSlug;

    protected $fillable = ['category_id', 'name', 'slug', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    public function associates()
    {
        return $this->belongsToMany(Associate::class, 'associate_service');
    }
}
