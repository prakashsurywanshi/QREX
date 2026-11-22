<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class GenericOwnerPolicy
{
    public function view(User $user, Model $model): bool
    {
        if ($user->isSuperAdmin() || $user->hasRole('admin')) return true;
        foreach (['user_id','agent_id','assigned_agent_id','owner_id','created_by'] as $field) {
            if (isset($model->{$field}) && (int) $model->{$field} === (int) $user->id) return true;
        }
        return $user->hasPermissionTo(class_basename($model).'.view') || $user->hasPermissionTo(strtolower(class_basename($model)).'s.view');
    }

    public function update(User $user, Model $model): bool { return $this->view($user, $model); }
    public function delete(User $user, Model $model): bool { return $this->view($user, $model); }
}
