<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionRule extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'min_value',
        'max_value',
        'type',
        'percentage',
        'fixed_amount',
        'applies_to',
        'is_active',
        'priority',
        'description',
    ];

    protected $casts = [
        'min_value' => 'decimal:2',
        'max_value' => 'decimal:2',
        'percentage' => 'decimal:2',
        'fixed_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('priority', 'desc');
    }
}
