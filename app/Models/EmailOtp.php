<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'email',
    'purpose',
    'new_email',
    'code',
    'expires_at',
    'used_at',
])]
class EmailOtp extends Model
{
    public const PURPOSE_CURRENT = 'current';

    public const PURPOSE_NEW = 'new';

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    public function isUsable(): bool
    {
        return !$this->isUsed() && !$this->isExpired();
    }
}
