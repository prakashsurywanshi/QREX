<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::all()
            ->groupBy('module')
            ->map(fn ($perms, $module) => [
                'module' => $module,
                'label' => ucfirst(str_replace('_', ' ', $module)),
                'permissions' => $perms->map(fn ($p) => [
                    'id' => $p->id,
                    'slug' => $p->slug,
                    'name' => $p->name,
                    'action' => $p->action,
                    'field' => $p->field,
                    'description' => $p->description,
                ])->values(),
            ])
            ->values();

        return Inertia::render('admin/Permissions', [
            'permissionGroups' => $permissions,
            'total' => Permission::count(),
        ]);
    }
}
