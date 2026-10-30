<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageAttachment extends Model
{
    protected $fillable = [
        'message_id', 'disk', 'path', 'name', 'mime', 'size',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    public function message()
    {
        return $this->belongsTo(Message::class);
    }
}
