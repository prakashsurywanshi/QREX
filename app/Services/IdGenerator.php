<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Generates collision-free, human-readable record IDs (e.g. "L-006", "DL-012").
 */
class IdGenerator
{
    public function next(string $prefix, string $context = '', int $pad = 3): string
    {
        $now = now();
        $payload = [
            'prefix' => $prefix,
            'context' => $context,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        if (config('qrex.multi_tenant') && app()->bound('current_tenant_id') && Schema::hasColumn('sequences', 'tenant_id')) {
            $payload['tenant_id'] = app('current_tenant_id');
        }

        $id = DB::table('sequences')->insertGetId($payload);

        return $prefix.'-'.str_pad((string) $id, $pad, '0', STR_PAD_LEFT);
    }

    public function nextFor(string $prefix, string $context = ''): string
    {
        return $this->next($prefix, $context);
    }
}
