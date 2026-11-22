<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'tenant_id',
    'booking_id',
    'customer_name',
    'property_name',
    'agent_name',
    'booking_date',
    'deal_value',
    'deal_label',
    'booking_amount',
    'booking_amount_label',
    'status',
    'agreement_status',
    'possession_status',
])]
class Booking extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'deal_value' => 'decimal:2',
            'booking_amount' => 'decimal:2',
        ];
    }
}
