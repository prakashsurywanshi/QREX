<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'tenant_id',
    'deal_id',
    'lead_id',
    'customer_name',
    'property_id',
    'deal_value',
    'value_label',
    'stage',
    'stage_changed_at',
    'probability',
    'days_in_stage',
    'assigned_agent_id',
    'last_activity',
    'next_followup',
])]
class Deal extends Model
{
    use SoftDeletes, BelongsToTenant;

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function assignedAgent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_agent_id');
    }

    protected function daysInStage(): Attribute
    {
        return Attribute::get(fn (mixed $value, array $attributes) => max(0, (int) now()->diffInDays($attributes['stage_changed_at'] ?? $attributes['created_at'] ?? now())));
    }
}
