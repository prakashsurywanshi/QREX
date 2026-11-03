<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'booking_id', 'deal_id', 'unit_id',
        'plan_name', 'total_amount', 'booking_amount',
        'plan_type', 'status', 'start_date', 'terms', 'notes', 'created_by',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'booking_amount' => 'decimal:2',
        'terms' => 'array',
        'start_date' => 'date',
    ];

    public function booking(): BelongsTo { return $this->belongsTo(Booking::class); }
    public function deal(): BelongsTo { return $this->belongsTo(Deal::class); }
    public function unit(): BelongsTo { return $this->belongsTo(Unit::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function installments(): HasMany { return $this->hasMany(Installment::class)->orderBy('installment_no'); }

    public function totalPaid(): float
    {
        return (float) $this->installments()->sum('paid_amount');
    }

    public function balance(): float
    {
        return max(0, (float) $this->total_amount - $this->totalPaid());
    }
}
