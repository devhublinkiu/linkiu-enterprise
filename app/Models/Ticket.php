<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $fillable = [
        'subject',
        'message',
        'priority',
        'status',
        'user_id',
        'last_reply_at',
        'attachments'
    ];

    public function replies(): HasMany
    {
        return $this->hasMany(TicketReply::class);
    }
}
