<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'lead_id',
    'name',
    'phone',
    'email',
    'source',
    'campaign_id',
    'status',
    'budget',
    'preferred_location',
    'interested_property_id',
    'assigned_agent_id',
    'owner_id',
    'created_by',
    'score',
    'requirements',
    'last_contact',
    'next_followup',
])]
class Lead extends Model
{
    use SoftDeletes;

    public function assignedAgent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_agent_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function interestedProperty(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'interested_property_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class);
    }

    public function handovers(): HasMany
    {
        return $this->hasMany(LeadHandover::class);
    }

    public function scopeVisibleTo($query, User $user): void
    {
        if ($user->isSuperAdmin() || $user->hasRole('admin')) {
            return;
        }

        if ($user->hasAnyRole(['sales-executive', 'senior-agent'])) {
            $query->where(fn ($q) => $q
                ->where('assigned_agent_id', $user->id)
                ->orWhere('owner_id', $user->id));
        }
    }
}
