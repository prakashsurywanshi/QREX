<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'payment_id',
    'customer_name',
    'property_name',
    'amount',
    'amount_label',
    'mode',
    'txn_id',
    'due_date',
    'paid_date',
    'status',
])]
class Payment extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'due_date' => 'date',
            'paid_date' => 'date',
        ];
    }
}
