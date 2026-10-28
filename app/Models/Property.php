<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

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

    protected $appends = ['public_id'];

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

    public function coverOrImage(): ?string
    {
        $path = $this->images->firstWhere('is_cover', true)?->path
            ?? $this->images->first()?->path
            ?? $this->getRawOriginal('image');

        if (! $path) {
            return null;
        }

        // App-storage images are persisted as absolute or "/storage/..." URLs built
        // against whatever APP_URL was active at upload time. Rebuild them against
        // the current APP_URL so share previews resolve on the serving host.
        if (preg_match('#^(?:https?:)?//[^/]+(/storage/.+)$#i', $path, $matches)
            || preg_match('#^(/storage/.+)$#i', $path, $matches)) {
            return url($matches[1]);
        }

        // External URLs (e.g. stock/CDN images) are returned untouched.
        if (preg_match('#^https?://#i', $path)) {
            return $path;
        }

        return url($path);
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'interested_property_id');
    }

    protected function publicId(): Attribute
    {
        return Attribute::get(fn () => rawurlencode(Crypt::encryptString((string) $this->getKey())));
    }

    /**
     * Public routes bind on the encrypted "public_id" field while admin routes
     * keep binding on the raw primary key. Decryption failures resolve to no
     * match so invalid/raw IDs 404 on public URLs.
     */
    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        if ($field === 'public_id') {
            try {
                $value = Crypt::decryptString($value);
            } catch (DecryptException) {
                $value = null;
            }

            $field = null;
        }

        return parent::resolveRouteBindingQuery($query, $value, $field);
    }

    protected function location(): Attribute
    {
        return Attribute::make(
            get: fn () => trim(implode(', ', array_filter([$this->address, $this->city]))),
        );
    }
}
