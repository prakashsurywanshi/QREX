<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use App\Models\Permission;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();
        $settings = Cache::remember('app.settings.array', 300, fn () => Setting::pluck('value', 'key')->all());

        return [
            ...parent::share($request),
            'app' => [
                'name' => config('app.name'),
                'project_name' => $settings['project_name'] ?? config('app.name'),
                'type' => 'Realty ERP & CRM',
                'logo' => $settings['logo_url'] ?? null,
            ],
            'site' => [
                'project_name' => $settings['project_name'] ?? config('app.name'),
                'agency_name' => $settings['agency_name'] ?? 'QREX',
                'contact_email' => $settings['contact_email'] ?? 'hello@example.in',
                'contact_phone' => $settings['contact_phone'] ?? '+91 98100 01111',
                'address' => $settings['address'] ?? '2nd Floor, Oberoi Mall Annexe, Andheri West, Mumbai 400053',
                'tagline' => $settings['tagline'] ?? 'Luxury Living, Redefined',
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->roles->first()?->name ?? $user->role,
                    'role_slugs' => $user->roles->pluck('slug')->toArray(),
                    'branch' => $user->branch,
                    'avatar' => $user->avatar,
                    'initials' => $user->initials,
                ] : null,
            ],
            'notifications' => [
                'unread' => fn () => $user ? Notification::where('user_id', $user->id)->where('is_read', false)->count() : 0,
            ],
            'can' => fn () => $this->permissions($user),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }

    protected function permissions($user): array
    {
        if (!$user) {
            return [];
        }

        $permissions = Cache::remember('permissions.all', 300, fn () => Permission::all());
        $flatSlugs = $user->getAllPermissions()->pluck('slug')->flip();
        $can = [];

        foreach ($permissions as $permission) {
            $module = $permission->module;
            $action = $permission->action;
            $can[$module] ??= ['view'=>false,'create'=>false,'edit'=>false,'delete'=>false,'export'=>false,'approve'=>false,'fields'=>[]];
            if ($permission->field === null) {
                $can[$module][$action] = isset($flatSlugs[$permission->slug]);
            } else {
                $can[$module]['fields'][$permission->field] = isset($flatSlugs[$permission->slug]);
            }
        }

        return $can;
    }
}
