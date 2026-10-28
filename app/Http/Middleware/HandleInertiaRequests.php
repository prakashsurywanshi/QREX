<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'app' => [
                'name' => config('app.name'),
                'project_name' => \App\Models\Setting::where('key', 'project_name')->value('value') ?: config('app.name'),
                'type' => 'Realty ERP & CRM',
                'logo' => \App\Models\Setting::where('key', 'logo_url')->value('value') ?: null,
            ],
            'site' => [
                'project_name' => \App\Models\Setting::where('key', 'project_name')->value('value') ?: config('app.name'),
                'agency_name' => \App\Models\Setting::where('key', 'agency_name')->value('value') ?: 'QREX',
                'contact_email' => \App\Models\Setting::where('key', 'contact_email')->value('value') ?: 'hello@example.in',
                'contact_phone' => \App\Models\Setting::where('key', 'contact_phone')->value('value') ?: '+91 98100 01111',
                'address' => \App\Models\Setting::where('key', 'address')->value('value') ?: '2nd Floor, Oberoi Mall Annexe, Andheri West, Mumbai 400053',
                'tagline' => \App\Models\Setting::where('key', 'tagline')->value('value') ?: 'Luxury Living, Redefined',
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
            'can' => $this->permissions($user),
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

        $permissions = \App\Models\Permission::all();

        $can = [];

        $flatPermissions = $user->getAllPermissions();

        foreach ($permissions->filter(fn ($p) => $p->field === null) as $permission) {
            $module = $permission->module;
            $action = $permission->action;

            if (!isset($can[$module])) {
                $can[$module] = [
                    'view' => false,
                    'create' => false,
                    'edit' => false,
                    'delete' => false,
                    'export' => false,
                    'approve' => false,
                    'fields' => [],
                ];
            }

            $can[$module][$action] = $flatPermissions->contains('slug', $permission->slug);
        }

        foreach ($permissions->filter(fn ($p) => $p->field !== null) as $permission) {
            $module = $permission->module;
            $action = $permission->action;
            $field = $permission->field;

            if (!isset($can[$module])) {
                $can[$module] = [
                    'view' => false,
                    'create' => false,
                    'edit' => false,
                    'delete' => false,
                    'export' => false,
                    'approve' => false,
                    'fields' => [],
                ];
            }

            if (!isset($can[$module]['fields'][$field])) {
                $can[$module]['fields'][$field] = false;
            }

            $can[$module]['fields'][$field] = $flatPermissions->contains('slug', $permission->slug);
        }

        return $can;
    }
}
