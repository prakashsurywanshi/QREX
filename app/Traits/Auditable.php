<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            $model->audit('created');
        });

        static::updated(function ($model) {
            $model->audit('updated');
        });

        static::deleted(function ($model) {
            $model->audit('deleted');
        });
    }

    public function audit(string $action): void
    {
        $user = Auth::user();
        $oldValues = null;
        $newValues = null;

        if ($action === 'updated') {
            $dirty = $this->getDirty();
            unset($dirty['password'], $dirty['remember_token']);
            $oldValues = collect($this->getOriginal())->only(array_keys($dirty))->except(['password', 'remember_token'])->toArray();
            $newValues = $dirty;
        } elseif ($action === 'created') {
            $newValues = collect($this->getAttributes())->except(['password', 'remember_token'])->toArray();
        } elseif ($action === 'deleted') {
            $oldValues = collect($this->getOriginal())->except(['password', 'remember_token'])->toArray();
        }

        AuditLog::create([
            'tenant_id' => $this->tenant_id ?? ($user->tenant_id ?? app()->bound('current_tenant_id') ? app('current_tenant_id') : null),
            'user_id' => $user?->id,
            'action' => $action,
            'auditable_type' => get_class($this),
            'auditable_id' => $this->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }
}
