<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_monthly',
        'price_semiannual',
        'price_annual',
        'currency',
        'limit_services',
        'limit_gallery',
        'has_priority_directory',
        'can_download_tenders',
        'has_job_board',
        'has_network',
        'has_reviews',
        'has_priority_support',
        'color_hex',
        'grace_days',
        'is_active',
        'is_popular',
        'signup_fee',
        'signup_only_first_period',
    ];

    protected $casts = [
        'price_monthly' => 'decimal:2',
        'price_semiannual' => 'decimal:2',
        'price_annual' => 'decimal:2',
        'has_priority_directory' => 'boolean',
        'can_download_tenders' => 'boolean',
        'has_job_board' => 'boolean',
        'has_network' => 'boolean',
        'has_reviews' => 'boolean',
        'has_priority_support' => 'boolean',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'limit_services' => 'integer',
        'limit_gallery' => 'integer',
        'grace_days' => 'integer',
        'signup_fee' => 'decimal:2',
        'signup_only_first_period' => 'boolean',
    ];

    public function associates(): HasMany
    {
        return $this->hasMany(Associate::class);
    }
}
