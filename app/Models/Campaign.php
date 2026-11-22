<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tenant_id',
    'campaign_id',
    'name',
    'channel',
    'budget',
    'spent',
    'leads',
    'conversions',
    'revenue',
    'revenue_label',
    'roi',
    'start_date',
    'end_date',
    'status',
])]
class Campaign extends Model
{
    use BelongsToTenant;

    protected function casts(): array
    {
        return [
            'budget' => 'decimal:2',
            'spent' => 'decimal:2',
            'revenue' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }
}
