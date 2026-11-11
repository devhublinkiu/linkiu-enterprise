<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class BankAccount extends Model
{
    protected $fillable = [
        'type',
        'bank_name',
        'account_type',
        'account_number',
        'payment_key',
        'qr_path',
        'holder_name',
        'holder_document',
        'holder_document_type',
        'color_hex',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    // El frontend recibe la URL pública del QR ya resuelta.
    protected $appends = ['qr_url'];

    public function getQrUrlAttribute(): ?string
    {
        return $this->qr_path
            ? Storage::disk('public')->url($this->qr_path)
            : null;
    }
}
