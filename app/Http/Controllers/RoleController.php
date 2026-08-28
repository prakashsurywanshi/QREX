<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/Roles', [
            'roles' => Role::with('permissions')
                ->withCount('users')
                ->get()
                ->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                    'description' => $role->description,
                    'is_system' => $role->is_system,
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

        return back()->with('success', 'Role "'.$role->name.'" created.');
    }

    public function update(Request $request, Role $role)
    {
        if ($role->is_system) {
            return back()->with('error', 'System roles cannot be modified.');
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

        return back()->with('success', 'Role updated.');
    }

    public function destroy(Role $role)
    {
        if ($role->is_system) {
            return back()->with('error', 'System roles cannot be deleted.');
        }

        $userCount = $role->users()->count();
        if ($userCount > 0) {
            return back()->with('error', 'Cannot delete role that is assigned to '.$userCount.' user(s).');
        }

        $role->delete();

        return back()->with('success', 'Role deleted.');
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
