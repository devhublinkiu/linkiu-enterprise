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

    // ─── Estado por participante (pivote conversation_user) ──────────────────────
    // Se puebla bajo demanda (al leer/archivar); no exige pre-cargar a todos los
    // usuarios de la empresa. Nota: unreadCountFor/isArchivedFor hacen una consulta
    // por conversación (aceptable en v1; se optimiza si hace falta).

    public function markReadBy(User $user): void
    {
        $this->ensureParticipant($user);
        $this->participants()->updateExistingPivot($user->id, ['last_read_at' => now()]);
    }

    public function setArchivedFor(User $user, bool $archived): void
    {
        $this->ensureParticipant($user);
        $this->participants()->updateExistingPivot($user->id, [
            'archived_at' => $archived ? now() : null,
        ]);
    }

    public function isArchivedFor(User $user): bool
    {
        $participant = $this->participants()->where('users.id', $user->id)->first();

        return $participant !== null && $participant->pivot->archived_at !== null;
    }

    public function unreadCountFor(User $user): int
    {
        $participant = $this->participants()->where('users.id', $user->id)->first();
        $since = $participant?->pivot?->last_read_at;

        return $this->messages()
            ->where('sender_id', '!=', $user->id)
            ->when($since, fn ($q) => $q->where('created_at', '>', $since))
            ->count();
    }

    private function ensureParticipant(User $user): void
    {
        $this->participants()->syncWithoutDetaching([
            $user->id => ['role' => $user->isAdmin() ? 'admin' : 'associate'],
        ]);
    }
}
