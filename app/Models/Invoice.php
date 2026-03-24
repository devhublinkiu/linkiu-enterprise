<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'associate_id',
        'created_by',
        'type',
        'period',
        'amount',
        'document_path',
        'external_link',
        'notes',
        'status',
        'read_at',
    ];

    protected $casts = [
        'amount'  => 'decimal:2',
        'read_at' => 'datetime',
    ];

    public function associate(): BelongsTo
    {
        return $this->belongsTo(Associate::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isUnread(): bool
    {
        return $this->read_at === null;
    }

    public function isPaid(): bool
    {
        return $this->status === 'pagada';
    }
}
