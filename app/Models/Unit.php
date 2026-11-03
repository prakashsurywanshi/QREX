<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Unit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'project_id', 'tower_id', 'unit_no', 'floor', 'unit_type',
        'carpet_area', 'built_up_area', 'super_area', 'price', 'price_per_sqft',
        'facing', 'status', 'held_by', 'hold_expires_at', 'booking_id', 'deal_id',
        'features', 'floor_plan_path', 'remarks',
    ];

    protected $casts = [
        'carpet_area' => 'decimal:2',
        'built_up_area' => 'decimal:2',
        'super_area' => 'decimal:2',
        'price' => 'decimal:2',
        'price_per_sqft' => 'decimal:2',
        'features' => 'array',
        'hold_expires_at' => 'datetime',
    ];

    public function project(): BelongsTo { return $this->belongsTo(Project::class); }
    public function tower(): BelongsTo { return $this->belongsTo(Tower::class); }
    public function holder(): BelongsTo { return $this->belongsTo(User::class, 'held_by'); }
    public function booking(): BelongsTo { return $this->belongsTo(Booking::class); }
    public function deal(): BelongsTo { return $this->belongsTo(Deal::class); }

    public function hold(int $userId, int $hours = 24): void
    {
        $this->update([
            'status' => 'hold',
            'held_by' => $userId,
            'hold_expires_at' => now()->addHours($hours),
        ]);
    }

    public function release(): void
    {
        $this->update([
            'status' => 'available',
            'held_by' => null,
            'hold_expires_at' => null,
        ]);
    }

    public function isHoldExpired(): bool
    {
        return $this->status === 'hold' && $this->hold_expires_at && $this->hold_expires_at->isPast();
    }
}
