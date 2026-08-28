<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'property_id',
    'title',
    'type',
    'transaction_type',
    'description',
    'status',
    'price',
    'price_label',
    'area',
    'bedrooms',
    'bathrooms',
    'floors',
    'parking',
    'furnishing',
    'possession_date',
    'address',
    'city',
    'state',
    'country',
    'pincode',
    'latitude',
    'longitude',
    'amenities',
    'featured',
    'is_website_visible',
    'seo_title',
    'meta_description',
    'slug',
    'image',
    'agent_id',
])]
class Property extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'featured' => 'boolean',
            'is_website_visible' => 'boolean',
            'price' => 'decimal:2',
            'area' => 'decimal:2',
        ];
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'interested_property_id');
    }

    protected function location(): Attribute
    {
        return Attribute::make(
            get: fn () => trim(implode(', ', array_filter([$this->address, $this->city]))),
        );
    }
}
