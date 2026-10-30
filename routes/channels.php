<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

// Default user model channel
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private channel for each associate — receives approval/rejection notifications
Broadcast::channel('associate.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Admin-only channel — receives new payment request notifications
Broadcast::channel('admin.notifications', function ($user) {
    return $user->is_superadmin || $user->role === 'admin';
});

// Bandeja interna (plan 0026 / ADR-0012). El acceso al hilo reutiliza la misma
// regla que ConversationPolicy::view (un asociado solo su empresa; admin todos).
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);

    return $conversation !== null && $user->can('view', $conversation);
});

// Canal por usuario para el badge de no leídos / refresco de la bandeja (corte 6).
Broadcast::channel('inbox.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
