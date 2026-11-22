<?php

namespace App\Policies;

use App\Models\Commission;
use App\Models\User;

class CommissionPolicy
{
    public function view(User $user, Commission $commission): bool
    {
        return $user->isSuperAdmin() || $user->hasRole('admin') || $commission->agent_id === $user->id;
    }

    public function update(User $user, Commission $commission): bool
    {
        return $this->view($user, $commission);
    }

    public function approve(User $user, Commission $commission): bool
    {
        return $user->isSuperAdmin() || $user->hasRole('admin');
    }

    public function pay(User $user, Commission $commission): bool
    {
        return $this->approve($user, $commission);
    }

    public function delete(User $user, Commission $commission): bool
    {
        return $this->view($user, $commission);
    }
}
