<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        if (!$user->hasAnyRole($roles)) {
            if ($request->expectsJson()) {
                abort(403, 'Unauthorized. Required role: '.implode(' or ', $roles));
            }

            return back()->with('error', 'You do not have the required role to access this page.');
        }

        return $next($request);
    }
}
