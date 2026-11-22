<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!config('qrex.multi_tenant')) {
            app()->instance('current_tenant', null);
            app()->instance('current_tenant_id', null);
            return $next($request);
        }

        $tenant = $this->resolveTenant($request);

        if ($tenant && !$tenant->isActive()) {
            $tenant = null;
        }

        app()->instance('current_tenant', $tenant);
        app()->instance('current_tenant_id', $tenant?->id);

        return $next($request);
    }

    protected function resolveTenant(Request $request): ?Tenant
    {
        $host = $request->getHost();
        $tenant = Tenant::query()->where('domain', $host)->first();

        if (!$tenant) {
            $parts = explode('.', $host);
            if (count($parts) >= 3) {
                $subdomain = $parts[0];
                if (!in_array($subdomain, ['www', 'app', 'api'], true)) {
                    $tenant = Tenant::query()->where('subdomain', $subdomain)->first();
                }
            }
        }

        $headerTenantId = $request->header('X-Tenant-ID');
        if (!$tenant && $headerTenantId) {
            $user = $request->user();
            $canSwitch = $user && method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin();
            if ($canSwitch) {
                $tenant = Tenant::query()->find($headerTenantId);
            }
        }

        return $tenant;
    }
}
