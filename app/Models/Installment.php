<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Installment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id', 'payment_plan_id', 'installment_no', 'milestone_name',
        'due_date', 'amount', 'percentage', 'status',
        'paid_amount', 'balance_amount', 'paid_at', 'payment_id',
        'reminder_sent_at', 'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'percentage' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
    ];

    public function paymentPlan(): BelongsTo { return $this->belongsTo(PaymentPlan::class); }
    public function payment(): BelongsTo { return $this->belongsTo(Payment::class); }

    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'paid')
            ->where('due_date', '<', now()->toDateString());
    }
}
