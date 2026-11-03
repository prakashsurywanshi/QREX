<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionSplit extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'commission_id',
        'user_id',
        'share_percentage',
        'share_amount',
        'role',
    ];

    protected $casts = [
        'share_percentage' => 'decimal:2',
        'share_amount' => 'decimal:2',
    ];

    public function commission(): BelongsTo
    {
        return $this->belongsTo(Commission::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
