<?php

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
