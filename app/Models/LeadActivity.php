<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'tenant_id',
    'lead_id',
    'type',
    'title',
    'description',
    'duration',
    'outcome',
    'contact_number',
    'email_subject',
    'next_followup',
    'location',
    'user_id',
])]
class LeadActivity extends Model
{
    use BelongsToTenant;

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
