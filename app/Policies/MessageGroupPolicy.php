<?php

namespace App\Policies;

use App\Models\MessageGroup;
use App\Models\User;

/**
 * Los grupos de mensajería son una herramienta solo del admin (ADR-0012).
 */
class MessageGroupPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, MessageGroup $group): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, MessageGroup $group): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, MessageGroup $group): bool
    {
        return $user->isAdmin();
    }
}
