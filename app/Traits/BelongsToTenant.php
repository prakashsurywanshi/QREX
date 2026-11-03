<?php

namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::creating(function ($model) {
            if (config('qrex.multi_tenant') && empty($model->tenant_id)) {
                $tenantId = app()->bound('current_tenant_id') ? app('current_tenant_id') : null;
                if ($tenantId) {
                    $model->tenant_id = $tenantId;
                }
            }
        });

        if (config('qrex.multi_tenant')) {
            static::addGlobalScope('tenant', function (Builder $builder) {
                $tenantId = app()->bound('current_tenant_id') ? app('current_tenant_id') : null;
                if ($tenantId) {
                    $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
                }
            });
        }
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
