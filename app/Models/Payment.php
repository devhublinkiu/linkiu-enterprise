<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'reference_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'paid_at',
        'due_date',
        'notes'
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'due_date' => 'date',
        'amount' => 'decimal:2',
    ];
}
