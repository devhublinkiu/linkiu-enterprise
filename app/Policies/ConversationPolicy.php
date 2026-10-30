<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

/**
 * Aislamiento de la bandeja (ADR-0012): un asociado ve/responde SOLO las conversaciones
 * de su empresa; admin/superadmin, todas. Un asociado nunca ve un hilo de otro.
 */
class ConversationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isAssociate();
    }

    public function view(User $user, Conversation $conversation): bool
    {
        return $this->participatesIn($user, $conversation);
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isAssociate();
    }

    public function reply(User $user, Conversation $conversation): bool
    {
        return $this->participatesIn($user, $conversation) && $conversation->status !== 'closed';
    }

    /**
     * Cerrar/reabrir un hilo es una acción de resolución del equipo CAMEP: solo admin.
     */
    public function close(User $user, Conversation $conversation): bool
    {
        return $user->isAdmin();
    }

    private function participatesIn(User $user, Conversation $conversation): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isAssociate()
            && (int) $user->associate_id === (int) $conversation->associate_id;
    }
}
