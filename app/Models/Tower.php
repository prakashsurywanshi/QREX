<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tower extends Model
{
    use HasFactory;

    protected $fillable = ['tenant_id', 'project_id', 'name', 'floors_count', 'units_per_floor', 'description'];

    public function project(): BelongsTo { return $this->belongsTo(Project::class); }
    public function units(): HasMany { return $this->hasMany(Unit::class); }
}
