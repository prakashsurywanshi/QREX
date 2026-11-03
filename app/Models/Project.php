<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'name', 'slug', 'location', 'address', 'developer',
        'rera_no', 'launch_date', 'possession_date', 'description',
        'amenities', 'images', 'status', 'featured', 'is_published', 'created_by',
    ];

    protected $casts = [
        'amenities' => 'array',
        'images' => 'array',
        'featured' => 'boolean',
        'is_published' => 'boolean',
        'launch_date' => 'date',
        'possession_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = Str::slug($project->name) . '-' . Str::random(6);
            }
        });
    }

    public function towers(): HasMany { return $this->hasMany(Tower::class); }
    public function units(): HasMany { return $this->hasMany(Unit::class); }

    public function availableUnits(): HasMany { return $this->units()->where('status', 'available'); }
}
