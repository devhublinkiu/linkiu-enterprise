<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    protected $fillable = [
        'associate_id',
        'created_by',
        'plan_id',
        'type',
        'period',
        'cycle',
        'amount',
        'due_date',
        'document_path',
        'external_link',
        'notes',
        'status',
        'payment_method',
        'payment_reference',
        'payment_notes',
        'paid_at',
        'paid_by',
        'read_at',
    ];

    protected $casts = [
        'amount'   => 'decimal:2',
        'due_date' => 'date',
        'paid_at'  => 'datetime',
        'read_at'  => 'datetime',
    ];


    public function associate(): BelongsTo
    {
        return $this->belongsTo(Associate::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /** Administrador que asentó el pago, cuando se registró a mano. */
    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    /** Intentos y asientos de pago contra esta factura. */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
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
