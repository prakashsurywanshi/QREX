<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $isSuperAdmin = $request->user()->isSuperAdmin();
        $roleFilter = $request->input('role');

        $query = User::query()->with('roles');

        // Hide super-admin users from everyone except super admins themselves.
        if (!$isSuperAdmin) {
            $query->whereHas('roles', fn ($q) => $q->where('slug', '!=', 'super-admin'));
        }

        if ($roleFilter && $roleFilter !== 'All') {
            $query->whereHas('roles', fn ($q) => $q->where('name', $roleFilter));
        }

        $users = $query
            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString()
            ->through(fn ($u) => $this->formatUser($u));

        return Inertia::render('admin/Users', [
            'users' => $users,
            'roles' => Role::withCount('permissions')->get(['id', 'name', 'slug', 'description', 'is_system']),
            'rolePermissions' => $this->rolePermissionsMatrix(),
            'filters' => ['role' => $roleFilter ?: 'All'],
        ]);
    }

    public function show(Request $request, User $user)
    {
        // Hide super-admin users from everyone except super admins themselves.
        if ($user->isSuperAdmin() && !$request->user()->isSuperAdmin()) {
            abort(404);
        }

        $user->load('roles');

        return Inertia::render('admin/UserProfile', [
            'user' => $this->formatUser($user),
            'roles' => Role::withCount('permissions')->get(['id', 'name', 'slug', 'description', 'is_system']),
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

        // Apply SMTP settings from the database before sending the invite email.

        app(\App\Services\MailConfigService::class)->applyForEmailSending();

        // Send an invite/password-set link (uses the standard password reset broker).
        $token = Password::broker()->createToken($user);
        $user->sendPasswordResetNotification($token);

        return back()->with('success', 'User invited. They will receive an email to set their password.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:users,email,'.$user->id],
            'phone' => ['nullable', 'string'],
            'branch' => ['nullable', 'string'],
            'role_id' => ['nullable', 'integer', 'exists:roles,id'],
            'status' => ['nullable', 'string', 'in:Active,Inactive'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $data = [];

        if ($request->filled('role_id')) {
            $role = Role::findOrFail($request->role_id);
            if ($role->slug === 'super-admin' && !$request->user()->isSuperAdmin()) {
                abort(403, 'Only a Super Admin can grant the Super Admin role.');
            }
            $data['role'] = $role->name;
            $user->roles()->sync([$role->id]);
        }

        foreach (['name', 'phone', 'branch', 'status'] as $field) {
            if ($request->filled($field)) {
                $data[$field] = $request->{$field};
            }
        }

        if ($request->filled('email') && $request->email !== $user->email) {
            $data['email'] = $request->email;
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return back()->with('success', 'User updated.');
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'The Super Admin account cannot be deleted.');
        }

        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return back()->with('success', 'User deleted.');
    }

    protected function formatUser(User $user): array
    {
        $primaryRole = $user->roles->first();

        return [
            'id' => $user->id,
            'user_id' => 'U-'.str_pad((string) $user->id, 3, '0', STR_PAD_LEFT),
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'role_id' => $primaryRole?->id,
            'roleName' => $primaryRole?->name ?? $user->role,
            'branch' => $user->branch,
            'status' => $user->status,
            'last_login' => $user->last_login_at?->format('Y-m-d h:i A'),
            'created_at' => $user->created_at?->format('Y-m-d h:i A'),
        ];
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
