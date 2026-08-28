<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        $hasPermission = count($permissions) === 1
            ? $user->hasPermissionTo($permissions[0])
            : $user->hasAnyPermission($permissions);

        if (!$hasPermission) {
            if ($request->expectsJson()) {
                abort(403, 'Unauthorized. Required permission: '.implode(' or ', $permissions));
            }

            return back()->with('error', 'You do not have permission to perform this action.');
        }

        return $next($request);
    }
}
