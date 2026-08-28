<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'customer_id',
    'name',
    'phone',
    'email',
    'type',
    'status',
    'properties',
    'total_value',
    'agent_id',
    'city',
    'requirements',
])]
class Customer extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'properties' => 'array',
        ];
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
