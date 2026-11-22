<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'tenant_id',
    'name',
    'email',
    'password',
    'phone',
    'role',
    'branch',
    'status',
    'avatar',
    'last_login_at',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, BelongsToTenant;

    protected static ?array $cachedPermissions = null;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getInitialsAttribute(): string
    {
        $parts = array_filter(explode(' ', $this->name));

        return collect($parts)
            ->take(2)
            ->map(fn ($p) => strtoupper($p[0]))
            ->join('');
    }

    public function roles(): BelongsToMany
    {
        return $this->morphToMany(Role::class, 'model', 'model_has_roles');
    }

    public function primaryRole()
    {
        return $this->roles()->first();
    }

    public function isSuperAdmin(): bool
    {
        return $this->roles()->where('slug', 'super-admin')->exists();
    }

    public function hasRole(string $roleSlug): bool
    {
        return $this->roles()->where('slug', $roleSlug)->exists();
    }

    public function hasAnyRole(array $roleSlugs): bool
    {
        return $this->roles()->whereIn('slug', $roleSlugs)->exists();
    }

    public function hasPermissionTo(string $permissionSlug): bool
    {
        return $this->getAllPermissions()->contains('slug', $permissionSlug);
    }

    public function hasAnyPermission(array $permissionSlugs): bool
    {
        return $this->getAllPermissions()->whereIn('slug', $permissionSlugs)->isNotEmpty();
    }

    public function getAllPermissions()
    {
        if (static::$cachedPermissions !== null && isset(static::$cachedPermissions[$this->id])) {
            return static::$cachedPermissions[$this->id];
        }

        $permissions = $this->roles
            ->flatMap(fn (Role $role) => $role->permissions)
            ->unique('id')
            ->values();

        static::$cachedPermissions[$this->id] = $permissions;

        return $permissions;
    }

    public function getPermissionSlugs(): array
    {
        return $this->getAllPermissions()->pluck('slug')->toArray();
    }

    public function canAccessModule(string $module): bool
    {
        return $this->getAllPermissions()
            ->where('module', $module)
            ->where('action', 'view')
            ->isNotEmpty();
    }

    public function sendPasswordResetNotification($token): void
    {
        $url = route('password.reset', [
            'token' => $token,
            'email' => $this->email,
        ]);

        $this->notify(new \App\Notifications\ResetPasswordNotification($url, $this->name));
    }
}
