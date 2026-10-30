<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Grupo con nombre que el admin crea seleccionando asociados (ADR-0012). Al enviar a un
 * grupo se hace fan-out: un hilo privado por asociado del grupo.
 */
class MessageGroup extends Model
{
    protected $fillable = [
        'name', 'created_by',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function associates(): BelongsToMany
    {
        return $this->belongsToMany(Associate::class, 'message_group_associate')
            ->withTimestamps();
    }
}
