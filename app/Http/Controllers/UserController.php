<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/Users', [
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

        // Only a super-admin may assign the super-admin role or edit system roles.
        if ($role->slug === 'super-admin' && !$request->user()->isSuperAdmin()) {
            abort(403, 'Only a Super Admin can grant the Super Admin role.');
        }

        $tempPassword = \Illuminate\Support\Str::random(16);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $role->name,
            'branch' => $request->branch ?: 'HQ Mumbai',
            'status' => 'Active',
            'password' => \Illuminate\Support\Facades\Hash::make($tempPassword),
        ]);

        $user->roles()->attach($role->id);

        // Send an invite/password-set link (uses the standard password reset broker).
        $token = \Illuminate\Support\Facades\Password::broker()->createToken($user);
        $user->sendPasswordResetNotification($token);

        return back()->with('success', 'User invited. They will receive an email to set their password.');
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
