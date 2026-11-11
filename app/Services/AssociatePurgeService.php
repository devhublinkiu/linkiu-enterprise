<?php

namespace App\Services;

use App\Http\Controllers\BillingDocumentController;
use App\Models\Associate;
use App\Models\Conversation;
use App\Models\Invoice;
use App\Models\MessageAttachment;
use App\Models\Payment;
use App\Models\PaymentRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Elimina una empresa y TODO lo suyo, para siempre: usuarios, facturas, pagos,
 * mensajes, bienes/servicios y archivos en disco. Acción IRREVERSIBLE.
 *
 * Reglas de oro: la cascada de FK borra filas, no archivos; y `users.associate_id`
 * es `set null`, así que los usuarios se borran a mano. Por eso: se recolectan las
 * rutas ANTES, se borra la BD en una transacción, y los archivos se borran DESPUÉS
 * del commit (best-effort; un fallo de disco no deja la BD a medias).
 */
class AssociatePurgeService
{
    public function purge(Associate $associate): void
    {
        $defaultDisk = config('filesystems.default');

        // 1) Recolectar rutas de archivos ANTES de borrar.
        $defaultPaths = array_filter(array_merge(
            [$associate->logo_path, $associate->cover_path],
            is_array($associate->gallery_paths) ? $associate->gallery_paths : [],
            $this->filePaths($associate->files),
        ));

        $userIds = User::where('associate_id', $associate->id)->pluck('id');

        $localPaths = collect()
            ->merge(Invoice::where('associate_id', $associate->id)->whereNotNull('document_path')->pluck('document_path'))
            ->merge(Payment::where('associate_id', $associate->id)->whereNotNull('proof_path')->pluck('proof_path'))
            ->merge(PaymentRequest::whereIn('user_id', $userIds)->whereNotNull('proof_path')->pluck('proof_path'))
            ->filter()
            ->values()
            ->all();

        // Adjuntos de mensajería (pueden estar en discos distintos).
        $conversationIds = Conversation::where('associate_id', $associate->id)->pluck('id');
        $attachments = MessageAttachment::whereHas(
            'message',
            fn ($q) => $q->whereIn('conversation_id', $conversationIds),
        )->get(['disk', 'path']);

        // 2) Borrado en BD. Primero los usuarios (su FK no cascada), luego la
        //    empresa (cascada: conversaciones, mensajes, facturas, pagos,
        //    secciones, bienes/servicios, contactos, proyectos…).
        DB::transaction(function () use ($associate, $userIds) {
            User::whereIn('id', $userIds)->delete();
            $associate->delete();
        });

        // 3) Archivos, ya fuera de la transacción.
        $this->deleteFiles($defaultDisk, $defaultPaths);
        $this->deleteFiles(BillingDocumentController::DISK, $localPaths);
        foreach ($attachments as $a) {
            $this->deleteFiles($a->disk, [$a->path]);
        }
    }

    /**
     * Normaliza la columna `files` (array de rutas o de objetos {path}).
     *
     * @return array<int, string>
     */
    private function filePaths($files): array
    {
        if (! is_array($files)) {
            return [];
        }

        return array_values(array_filter(array_map(
            fn ($f) => is_array($f) ? ($f['path'] ?? null) : $f,
            $files,
        )));
    }

    /**
     * @param  array<int, string>  $paths
     */
    private function deleteFiles(string $disk, array $paths): void
    {
        foreach (array_filter($paths) as $path) {
            try {
                Storage::disk($disk)->delete($path);
            } catch (\Throwable $e) {
                Log::warning("No se pudo borrar {$path} del disco {$disk}: ".$e->getMessage());
            }
        }
    }
}
