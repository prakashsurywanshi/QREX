<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

/**
 * Generates collision-free, human-readable record IDs (e.g. "L-006", "DL-012").
 *
 * Uniqueness is guaranteed by an auto-incrementing `sequences` table, so two
 * concurrent requests can never produce the same readable ID (which would
 * otherwise cause a duplicate unique-key 500).
 */
class IdGenerator
{
    public function next(string $prefix, string $context = '', int $pad = 3): string
    {
        $now = now();

        $id = DB::table('sequences')->insertGetId([
            'prefix' => $prefix,
            'context' => $context,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return $prefix.'-'.str_pad((string) $id, $pad, '0', STR_PAD_LEFT);
    }

    public function nextFor(string $prefix, string $context = ''): string
    {
        return $this->next($prefix, $context);
    }
}
