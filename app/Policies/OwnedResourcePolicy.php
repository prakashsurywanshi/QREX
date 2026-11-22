<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class OwnedResourcePolicy
{
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, Model $model): bool { return $this->ownsOrAdmin($user, $model); }
    public function create(User $user): bool { return true; }
    public function update(User $user, Model $model): bool { return $this->ownsOrAdmin($user, $model); }
    public function delete(User $user, Model $model): bool { return $this->ownsOrAdmin($user, $model); }

    protected function ownsOrAdmin(User $user, Model $model): bool
    {
        if ($user->isSuperAdmin() || $user->hasRole('admin')) return true;
        foreach (['user_id','agent_id','assigned_agent_id','owner_id','created_by'] as $field) {
            if (isset($model->{$field}) && $model->{$field} !== null && (int) $model->{$field} === (int) $user->id) return true;
        }
        return false;
    }
}
