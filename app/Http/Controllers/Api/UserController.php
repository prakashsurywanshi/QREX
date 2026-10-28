<?php

namespace App\Http\Controllers\Api;

use App\Http\Responses\ApiResponse;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class UserController extends ApiController
{
    public function index()
    {
        return ApiResponse::success([
            'users' => User::with('roles')->get()->map(function ($u) {
                $primaryRole = $u->roles->first();

                return [
                    'id' => $u->id,
                    'user_id' => 'U-'.str_pad((string) $u->id, 3, '0', STR_PAD_LEFT),
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone,
                    'role' => $u->role,
                    'roleName' => $primaryRole?->name ?? $u->role,
                    'roleId' => $primaryRole?->id,
                    'branch' => $u->branch,
                    'status' => $u->status,
                    'last_login' => $u->last_login_at?->format('Y-m-d h:i A'),
                ];
            }),
            'roles' => Role::withCount('permissions')->get(['id', 'name', 'slug', 'description', 'is_system']),
            'rolePermissions' => $this->rolePermissionsMatrix(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string'],
            'role' => ['nullable', 'string'],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
            'branch' => ['nullable', 'string'],
        ]);

        $role = Role::findOrFail($request->role_id);

        if ($role->slug === 'super-admin' && !$request->user()->isSuperAdmin()) {
            abort(403, 'Only a Super Admin can grant the Super Admin role.');
        }

        $tempPassword = Str::random(16);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $role->name,
            'branch' => $request->branch ?: 'HQ Mumbai',
            'status' => 'Active',
            'password' => Hash::make($tempPassword),
        ]);

        $user->roles()->attach($role->id);

        $token = Password::broker()->createToken($user);
        $user->sendPasswordResetNotification($token);

        return ApiResponse::success(null, 'User invited. They will receive an email to set their password.', 201);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:users,email,'.$user->id],
            'phone' => ['nullable', 'string'],
            'branch' => ['nullable', 'string'],
            'role_id' => ['nullable', 'integer', 'exists:roles,id'],
            'status' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        if ($request->filled('role_id')) {
            $role = Role::findOrFail($request->role_id);
            if ($role->slug === 'super-admin' && !$request->user()->isSuperAdmin()) {
                abort(403, 'Only a Super Admin can grant the Super Admin role.');
            }
            $data['role'] = $role->name;
            $user->roles()->sync([$role->id]);
        }

        if ($request->filled('name')) {
            $data['name'] = $request->name;
        }
        if ($request->filled('email') && $request->email !== $user->email) {
            $data['email'] = $request->email;
        }
        if ($request->filled('phone')) {
            $data['phone'] = $request->phone;
        }
        if ($request->filled('branch')) {
            $data['branch'] = $request->branch;
        }
        if ($request->filled('status')) {
            $data['status'] = $request->status;
        }
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data ?? []);

        return ApiResponse::success(null, 'User updated.');
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->isSuperAdmin()) {
            return ApiResponse::error('The Super Admin account cannot be deleted.', 422);
        }

        if ($user->id === $request->user()->id) {
            return ApiResponse::error('You cannot delete your own account.', 422);
        }

        $user->delete();

        return ApiResponse::success(null, 'User deleted.');
    }

    protected function rolePermissionsMatrix(): array
    {
        $roles = Role::with('permissions')->get();
        $modules = collect(Permission::distinct()->pluck('module'))->filter(fn ($m) => $m !== 'roles')->values();
        $actions = collect(['view', 'create', 'edit', 'delete', 'export', 'approve']);

        return $roles->mapWithKeys(function ($role) use ($modules, $actions) {
            $perms = $role->permissions;

            return [$role->name => $modules->mapWithKeys(function ($module) use ($perms, $actions) {
                $modulePerms = $perms->where('module', $module);

                $abilities = $actions->filter(function ($action) use ($modulePerms) {
                    return $modulePerms->contains(fn ($p) => $p->action === $action);
                })->values()->all();

                return [ucfirst(str_replace('_', ' ', $module)) => $abilities];
            })->all()];
        })->all();
    }
}