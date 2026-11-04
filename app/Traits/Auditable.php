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
        AuditLog::create([
            'tenant_id' => $this->tenant_id ?? (Auth::user()->tenant_id ?? null),
            'user_id' => Auth::id(),
            'action' => $action,
            'auditable_type' => get_class($this),
            'auditable_id' => $this->id,
            'old_values' => $action === 'updated' ? [] : null,
            'new_values' => $action === 'created' ? $this->toArray() : null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
