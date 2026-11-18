<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class Invoice extends Model
{
    protected $fillable = [
        'associate_id',
        'created_by',
        'plan_id',
        'type',
        'invoice_number',
        'period',
        'period_key',
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
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        // Asigna el consecutivo en el único punto que todos comparten, para que
        // los 4 sitios que crean facturas lo obtengan sin tocarlos.
        static::creating(function (Invoice $invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = static::nextNumber($invoice->type);
            }
        });
    }

    /**
     * Siguiente consecutivo para el tipo dado, serie por tipo y año
     * (FC-2026-0001 para factura, CC-2026-0001 para cuenta de cobro). El bloqueo
     * de fila evita que dos facturas simultáneas tomen el mismo número.
     */
    public static function nextNumber(?string $type, ?Carbon $date = null): string
    {
        $prefix = $type === 'cuenta_cobro' ? 'CC' : 'FC';
        $year = ($date ?? now())->year;
        $serie = "{$prefix}-{$year}";

        return DB::transaction(function () use ($serie) {
            $last = static::where('invoice_number', 'like', "{$serie}-%")
                ->lockForUpdate()
                ->orderByDesc('invoice_number')
                ->value('invoice_number');

            $seq = $last ? ((int) substr($last, -4)) + 1 : 1;

            return sprintf('%s-%04d', $serie, $seq);
        });
    }

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
