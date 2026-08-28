<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'lead_id',
    'visit_id',
    'customer_name',
    'property_name',
    'agent_name',
    'visit_date',
    'visit_time',
    'status',
    'location',
    'notes',
    'feedback',
])]
class SiteVisit extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'visit_date' => 'date',
        ];
    }
}
