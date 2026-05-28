<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $map = config('associate_documents.legacy_label_map', []);

        if (empty($map)) {
            return;
        }

        DB::table('associates')->whereNotNull('files')->orderBy('id')->each(function ($row) use ($map) {
            $files = is_string($row->files) ? json_decode($row->files, true) : $row->files;

            if (!is_array($files) || empty($files)) {
                return;
            }

            $migrated = [];
            $changed  = false;

            foreach ($files as $oldKey => $path) {
                if (isset($map[$oldKey])) {
                    $migrated[$map[$oldKey]] = $path;
                    if ($map[$oldKey] !== $oldKey) {
                        $changed = true;
                    }
                } else {
                    // Unknown key — preserve as-is so we don't lose data.
                    $migrated[$oldKey] = $path;
                }
            }

            if ($changed) {
                DB::table('associates')->where('id', $row->id)->update([
                    'files' => json_encode($migrated, JSON_UNESCAPED_UNICODE),
                ]);
            }
        });
    }

    public function down(): void
    {
        $map = array_flip(config('associate_documents.legacy_label_map', []));

        if (empty($map)) {
            return;
        }

        DB::table('associates')->whereNotNull('files')->orderBy('id')->each(function ($row) use ($map) {
            $files = is_string($row->files) ? json_decode($row->files, true) : $row->files;

            if (!is_array($files) || empty($files)) {
                return;
            }

            $reverted = [];
            foreach ($files as $key => $path) {
                $reverted[$map[$key] ?? $key] = $path;
            }

            DB::table('associates')->where('id', $row->id)->update([
                'files' => json_encode($reverted, JSON_UNESCAPED_UNICODE),
            ]);
        });
    }
};
