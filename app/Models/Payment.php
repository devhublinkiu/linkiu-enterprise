<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un intento o asiento de pago contra una factura.
 *
 * Ver docs/adr/0001-motor-de-cobro-unificado.md
 */
class Payment extends Model
{
    /** Riel por el que entró el pago. */
    public const METHOD_BOLD          = 'bold';
    public const METHOD_TRANSFER      = 'transferencia';
    public const METHOD_CASH          = 'efectivo';
    public const METHOD_DEPOSIT       = 'consignacion';
    public const METHOD_OTHER         = 'otro';

    public const STATUS_PENDING   = 'pendiente';
    public const STATUS_APPROVED  = 'aprobado';
    public const STATUS_REJECTED  = 'rechazado';
    public const STATUS_FAILED    = 'fallido';
    public const STATUS_CANCELLED = 'cancelado';

    /** Medios que un administrador puede asentar a mano por el asociado. */
    public const MANUAL_METHODS = [
        self::METHOD_CASH     => 'Efectivo',
        self::METHOD_TRANSFER => 'Transferencia bancaria',
        self::METHOD_DEPOSIT  => 'Consignación',
        self::METHOD_OTHER    => 'Otro',
    ];

    public const METHOD_LABELS = [
        self::METHOD_BOLD     => 'Pago en línea (Bold)',
        self::METHOD_TRANSFER => 'Transferencia bancaria',
        self::METHOD_CASH     => 'Efectivo',
        self::METHOD_DEPOSIT  => 'Consignación',
        self::METHOD_OTHER    => 'Otro',
    ];

    protected $fillable = [
        'invoice_id',
        'associate_id',
        'method',
        'status',
        'amount',
        'currency',
        'reference',
        'gateway_payment_id',
        'gateway_payload',
        'proof_path',
        'paid_at',
        'reviewed_at',
        'applied_at',
        'submitted_by',
        'registered_by',
        'reviewed_by',
        'notes',
        'admin_notes',
    ];

    protected $casts = [
        'amount'          => 'decimal:2',
        'gateway_payload' => 'array',
        'paid_at'         => 'datetime',
        'reviewed_at'     => 'datetime',
        'applied_at'      => 'datetime',
    ];

    // ─── Relaciones ───────────────────────────────────────────────────────────

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function associate(): BelongsTo
    {
        return $this->belongsTo(Associate::class);
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function registrar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // ─── Estado ───────────────────────────────────────────────────────────────

    public function isPending(): bool  { return $this->status === self::STATUS_PENDING; }
    public function isApproved(): bool { return $this->status === self::STATUS_APPROVED; }

    /** ¿Este pago ya movió la vigencia? Es la guarda contra webhooks repetidos. */
    public function isApplied(): bool
    {
        return $this->applied_at !== null;
    }

    /** ¿Está esperando que un humano lo revise? */
    public function needsReview(): bool
    {
        return $this->isPending() && $this->method === self::METHOD_TRANSFER;
    }

    public function methodLabel(): string
    {
        return self::METHOD_LABELS[$this->method] ?? $this->method;
    }

    // ─── Consultas ────────────────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeAwaitingReview($query)
    {
        return $query->where('status', self::STATUS_PENDING)
            ->where('method', self::METHOD_TRANSFER);
    }
}
