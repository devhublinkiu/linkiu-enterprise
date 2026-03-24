<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactSubmission extends Model
{
    protected $fillable = [
        'company_name',
        'nit',
        'full_name',
        'id_number',
        'email',
        'phone',
        'types',
        'service',
        'message',
        'status',
        'admin_notes',
        'accepted_terms',
        'ip_address',
        'user_agent',
        'resolved_at',
    ];

    protected $casts = [
        'types' => 'array',
        'accepted_terms' => 'boolean',
        'resolved_at' => 'datetime',
    ];
}
