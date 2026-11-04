<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;

class PermissionService
{
    public function userPermissions()
    {
        $user = Auth::user();
        if (!$user) return [];
        
        $key = "permissions.user.{$user->id}";
        return Cache::remember($key, 1800, function () use ($user) {
            return $user->getAllPermissions()->pluck('name')->toArray();
        });
    }

    public function clear($userId)
    {
        Cache::forget("permissions.user.{$userId}");
    }
}
