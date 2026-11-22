<?php

namespace App\Models;

use App\Traits\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Receipt extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'payment_id', 'booking_id', 'receipt_no',
        'amount', 'issued_to', 'issued_by', 'receipt_data', 'pdf_path', 'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'receipt_data' => 'array',
    ];

    public function payment(): BelongsTo { return $this->belongsTo(Payment::class); }
    public function booking(): BelongsTo { return $this->belongsTo(Booking::class); }
    public function issuer(): BelongsTo { return $this->belongsTo(User::class, 'issued_by'); }

    public static function generateReceiptNo(): string
    {
        $last = self::latest('id')->first();
        $num = $last ? $last->id + 1 : 1;
        return 'REC-' . date('Y') . '-' . str_pad($num, 6, '0', STR_PAD_LEFT);
    }
}
