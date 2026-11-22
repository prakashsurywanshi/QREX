<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Communication extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'communicable_type', 'communicable_id',
        'type', 'direction', 'subject', 'content', 'meta',
        'duration_minutes', 'call_outcome', 'next_follow_up_at', 'created_by',
    ];

    protected $casts = [
        'meta' => 'array',
        'next_follow_up_at' => 'datetime',
    ];

    public function communicable(): MorphTo { return $this->morphTo(); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
