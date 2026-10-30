<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Message;
use Illuminate\Http\UploadedFile;

/**
 * Guarda los adjuntos de un mensaje en disco PRIVADO ('local') y crea sus filas.
 * La descarga va gateada por el controlador (ADR-0010 / ADR-0012). Compartido por
 * el backend del asociado y el del admin.
 */
trait HandlesMessageAttachments
{
    /**
     * @param  array<int, UploadedFile>  $files
     */
    protected function storeAttachments(Message $message, array $files): void
    {
        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store('messages/'.$message->conversation_id, 'local');

            $message->attachments()->create([
                'disk' => 'local',
                'path' => $path,
                'name' => $file->getClientOriginalName(),
                'mime' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ]);
        }
    }
}
