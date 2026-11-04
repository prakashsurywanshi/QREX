<?php

namespace App\Services;

use App\Models\TenantBranding;
use Illuminate\Support\Facades\Cache;

class BrandingService
{
    public function get($tenantId = null): array
    {
        $key = 'branding.' . ($tenantId ?? 'default');
        return Cache::remember($key, 3600, function () use ($tenantId) {
            $branding = TenantBranding::when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
                ->first();
            return $branding ? $branding->toArray() : [];
        });
    }

    public function clear($tenantId = null): void
    {
        Cache::forget('branding.' . ($tenantId ?? 'default'));
    }
}
