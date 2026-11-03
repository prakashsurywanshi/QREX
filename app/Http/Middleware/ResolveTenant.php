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
            app()->instance('current_tenant_id', null);
            return $next($request);
        }

        $host = $request->getHost();
        $tenant = null;

        // Try domain first
        $tenant = Tenant::where('domain', $host)->where('status', 'active')->first();
        
        // Try subdomain
        if (!$tenant) {
            $parts = explode('.', $host);
            if (count($parts) >= 3) {
                $subdomain = $parts[0];
                if ($subdomain !== 'www' && $subdomain !== 'app') {
                    $tenant = Tenant::where('subdomain', $subdomain)->where('status', 'active')->first();
                }
            }
        }

        // Try header for API
        if (!$tenant && $request->header('X-Tenant-ID')) {
            $tenant = Tenant::find($request->header('X-Tenant-ID'));
        }

        if ($tenant) {
            app()->instance('current_tenant', $tenant);
            app()->instance('current_tenant_id', $tenant->id);
        } else {
            app()->instance('current_tenant_id', null);
        }

        return $next($request);
    }
}
