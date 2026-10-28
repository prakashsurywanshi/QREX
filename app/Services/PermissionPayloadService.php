<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\User;

class PermissionPayloadService
{
    /**
     * Build the "can" map in the same shape HandleInertiaRequests uses:
     * [module => ['view','create','edit','delete','export','approve','fields'=>[...]]].
     */
    public function build(User $user): array
    {
        $permissions = Permission::all();
        $flatPermissions = $user->getAllPermissions();

        $can = [];

        foreach ($permissions->filter(fn ($p) => $p->field === null) as $permission) {
            $module = $permission->module;
            $action = $permission->action;

            if (!isset($can[$module])) {
                $can[$module] = $this->emptyModule();
            }

            $can[$module][$action] = $flatPermissions->contains('slug', $permission->slug);
        }

        foreach ($permissions->filter(fn ($p) => $p->field !== null) as $permission) {
            $module = $permission->module;
            $action = $permission->action;
            $field = $permission->field;

            if (!isset($can[$module])) {
                $can[$module] = $this->emptyModule();
            }

            $can[$module]['fields'][$field] = $flatPermissions->contains('slug', $permission->slug);
        }

        return $can;
    }

    public static function emptyModule(): array
    {
        return [
            'view' => false,
            'create' => false,
            'edit' => false,
            'delete' => false,
            'export' => false,
            'approve' => false,
            'fields' => [],
        ];
    }
}
