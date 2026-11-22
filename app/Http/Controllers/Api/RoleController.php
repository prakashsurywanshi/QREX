<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleController extends ApiController
{
    public function index()
    {
        return ApiResponse::success([
            'roles' => Role::with('permissions')
                ->withCount('users')
                ->get()
                ->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                    'description' => $role->description,
                    'is_system' => (bool) $role->is_system,
                    'permission_count' => $role->permissions->count(),
                    'user_count' => $role->users_count,
                    'permission_slugs' => $role->permissions->pluck('slug')->toArray(),
                ]),
            'permissions' => $this->permissionsTree(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        $role = Role::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'is_system' => false,
        ]);

        if ($request->filled('permissions')) {
            $permissionIds = Permission::whereIn('slug', $request->permissions)->pluck('id');
            $role->permissions()->attach($permissionIds);
        }

        return ApiResponse::success(null, 'Role "'.$role->name.'" created.', 201);
    }

    public function update(Request $request, Role $role)
    {
        if ($role->is_system) {
            return ApiResponse::error('System roles cannot be modified.', 422);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        $role->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        if ($request->has('permissions')) {
            $permissionIds = Permission::whereIn('slug', $request->permissions)->pluck('id');
            $role->permissions()->sync($permissionIds);
        }

        return ApiResponse::success(null, 'Role updated.');
    }

    public function destroy(Role $role)
    {
        if ($role->is_system) {
            return ApiResponse::error('System roles cannot be deleted.', 422);
        }

        $userCount = $role->users()->count();
        if ($userCount > 0) {
            return ApiResponse::error('Cannot delete role that is assigned to '.$userCount.' user(s).', 422);
        }

        $role->delete();

        return ApiResponse::success(null, 'Role deleted.');
    }

    public function permissions()
    {
        $all = Permission::all();
        return ApiResponse::success([
            'permissionGroups' => $all
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
                ->values(),
            'total' => $all->count(),
        ]);
    }

    protected function permissionsTree(): array
    {
        $permissions = Permission::all()
            ->groupBy('module')
            ->map(function ($perms, $module) {
                return [
                    'module' => $module,
                    'label' => ucfirst(str_replace('_', ' ', $module)),
                    'actions' => $perms->whereNull('field')
                        ->values()
                        ->map(fn ($p) => [
                            'slug' => $p->slug,
                            'action' => $p->action,
                            'label' => ucfirst($p->action),
                        ]),
                    'fields' => $perms->whereNotNull('field')
                        ->groupBy('action')
                        ->map(function ($fieldPerms, $action) {
                            return [
                                'action' => $action,
                                'fields' => $fieldPerms->values()->map(fn ($p) => [
                                    'slug' => $p->slug,
                                    'field' => $p->field,
                                    'label' => ucfirst(str_replace('_', ' ', $p->field)),
                                ]),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values()
            ->all();

        return $permissions;
    }
}