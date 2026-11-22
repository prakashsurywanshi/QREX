<?php

namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

trait BelongsToTenant
{
    protected static array $tenantColumnCache = [];

    protected static function bootBelongsToTenant(): void
    {
        static::creating(function ($model) {
            if (!config('qrex.multi_tenant')) return;
            if (!static::modelHasTenantColumn($model)) return;
            if (empty($model->tenant_id)) {
                $tenantId = app()->bound('current_tenant_id') ? app('current_tenant_id') : null;
                if ($tenantId) {
                    $model->tenant_id = $tenantId;
                }
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            if (!config('qrex.multi_tenant')) return;
            $model = $builder->getModel();
            if (!static::modelHasTenantColumn($model)) return;
            $tenantId = app()->bound('current_tenant_id') ? app('current_tenant_id') : null;
            if ($tenantId) {
                $builder->where($model->getTable() . '.tenant_id', $tenantId);
            }
        });
    }

    protected static function modelHasTenantColumn($model): bool
    {
        $class = get_class($model);
        if (array_key_exists($class, static::$tenantColumnCache)) {
            return static::$tenantColumnCache[$class];
        }
        try {
            return static::$tenantColumnCache[$class] = Schema::hasColumn($model->getTable(), 'tenant_id');
        } catch (\Throwable $e) {
            return static::$tenantColumnCache[$class] = false;
        }
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
