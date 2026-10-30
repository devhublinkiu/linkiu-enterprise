<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Hilo de la bandeja interna (plan 0026 / ADR-0012). Pertenece a una empresa (asociado);
 * los participantes y su estado (leído/archivado) viven en el pivote conversation_user.
 */
class Conversation extends Model
{
    protected $fillable = [
        'associate_id', 'subject', 'status', 'created_by', 'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function associate()
    {
        return $this->belongsTo(Associate::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'conversation_user')
            ->withPivot(['role', 'last_read_at', 'archived_at'])
            ->withTimestamps();
    }
}
