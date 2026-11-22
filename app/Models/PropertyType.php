<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tenant_id',
    'name',
    'slug',
    'description',
    'spec_rules',
    'sort_order',
    'is_active',
])]
class PropertyType extends Model
{
    use BelongsToTenant;

    protected function casts(): array
    {
        return [
            'spec_rules' => 'array',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function amenities(): HasMany
    {
        return $this->hasMany(Amenity::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function activeAmenities(): HasMany
    {
        return $this->amenities()->active()->ordered();
    }
}
